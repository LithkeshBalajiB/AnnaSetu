import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { ViewModeProvider } from "../components/view-mode";
import { Toaster } from "../components/ui/sonner";
import { AlertsProvider } from "../components/alerts";

// ─── Shared decorative background ───────────────────────────────────────────
function ErrorBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute bottom-0 right-0 size-[400px] rounded-full bg-accent/20 blur-3xl" />
      {/* Floating dots */}
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="absolute size-1.5 rounded-full bg-primary/20 animate-pulse"
          style={{
            top: `${10 + ((i * 17) % 80)}%`,
            left: `${5 + ((i * 23) % 90)}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            animationDuration: `${2 + (i % 3)}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── AnnaSetu Logo mark ───────────────────────────────────────────────────────
function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
        <svg viewBox="0 0 24 24" className="size-5 fill-primary-foreground">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
        </svg>
      </div>
      <span className="text-sm font-bold tracking-tight text-foreground">AnnaSetu</span>
    </div>
  );
}

// ─── 404 — Page Not Found ─────────────────────────────────────────────────────
function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <ErrorBg />
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <BrandMark />

        {/* Big illustrated number */}
        <div className="relative select-none">
          <span
            className="text-[10rem] font-black leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.4) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </span>
          {/* Plate illustration overlaid on the zero */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="size-28 rounded-full border-4 border-primary/20 bg-background/80 backdrop-blur flex items-center justify-center shadow-xl">
              <span className="text-5xl">🍽️</span>
            </div>
          </div>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-foreground">
          This page is off the menu
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
          The route you're looking for doesn't exist or may have been moved.
          Head back to the dashboard to continue managing food redistribution.
        </p>

        {/* Dashed divider with food icon */}
        <div className="my-6 flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 border-t border-dashed border-border" />
          <span className="text-lg">🌾</span>
          <div className="flex-1 border-t border-dashed border-border" />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Go to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:-translate-y-0.5"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Go Back
          </button>
        </div>

        <p className="mt-8 text-[11px] text-muted-foreground/60">
          AnnaSetu — Anna (food) + Setu (bridge) · the bridge for food
        </p>
      </div>
    </div>
  );
}

// ─── Error / Crash + Offline ──────────────────────────────────────────────────
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [countdown, setCountdown] = useState(15);
  const [retrying, setRetrying] = useState(false);

  // Detect online/offline transitions
  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  setCountdown(15); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Auto-retry countdown when offline then reconnects
  useEffect(() => {
    if (!isOnline) {
      setCountdown(15);
      return;
    }
    if (countdown <= 0) {
      handleRetry();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, countdown]);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      router.invalidate();
      reset();
      setRetrying(false);
    }, 400);
  };

  // Determine if this looks like a network error
  const isNetworkError =
    !isOnline ||
    /network|fetch|load|offline|failed to fetch|net::/i.test(error?.message ?? "");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <ErrorBg />
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        <BrandMark />

        {isNetworkError || !isOnline ? (
          /* ── OFFLINE / NETWORK ERROR ── */
          <>
            {/* Animated wifi icon */}
            <div className="relative mb-6 flex size-28 items-center justify-center rounded-3xl border-2 border-amber-500/30 bg-amber-500/10 shadow-xl shadow-amber-500/10">
              <svg
                className="size-14 text-amber-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M1 1l22 22" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" strokeLinecap="round" strokeWidth="3" />
              </svg>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-3xl border-2 border-amber-500/20 animate-ping" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              {isOnline ? "Connection lost" : "You're offline"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
              {isOnline
                ? "The page failed to load due to a network issue. Check your connection and try again."
                : "No internet connection detected. AnnaSetu will automatically reconnect and retry when you're back online."}
            </p>

            {/* Status pill */}
            <div className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
              isOnline
                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-600 border border-rose-500/30"
            }`}>
              <span className={`size-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              {isOnline ? "Connected — retrying automatically" : "Offline — waiting for connection"}
            </div>

            {/* Countdown bar */}
            {isOnline && (
              <div className="mt-5 w-full max-w-xs">
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                  <span>Auto-retrying in</span>
                  <span className="font-mono font-bold text-primary">{countdown}s</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${((15 - countdown) / 15) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying || !isOnline}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                <svg
                  className={`size-4 ${retrying ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
                {retrying ? "Retrying…" : "Retry Now"}
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:-translate-y-0.5"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Home
              </a>
            </div>
          </>
        ) : (
          /* ── APP CRASH / GENERIC ERROR ── */
          <>
            <div className="relative mb-6 flex size-28 items-center justify-center rounded-3xl border-2 border-rose-500/30 bg-rose-500/10 shadow-xl shadow-rose-500/10">
              <span className="text-6xl">⚠️</span>
              <div className="absolute inset-0 rounded-3xl border-2 border-rose-500/10 animate-ping" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
              The application crashed unexpectedly. Your data is safe — this is a temporary error. Please try reloading the page.
            </p>

            {/* Error details (collapsed) */}
            <details className="mt-4 w-full max-w-sm text-left group">
              <summary className="cursor-pointer text-xs text-muted-foreground/70 hover:text-muted-foreground font-mono select-none">
                ▸ Show error details
              </summary>
              <div className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 font-mono text-[10px] text-rose-600 dark:text-rose-400 break-all leading-relaxed">
                {error?.message || "Unknown error"}
              </div>
            </details>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-60"
              >
                <svg
                  className={`size-4 ${retrying ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
                {retrying ? "Reloading…" : "Try Again"}
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:-translate-y-0.5"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Go Home
              </a>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:-translate-y-0.5"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                </svg>
                Hard Reload
              </button>
            </div>
          </>
        )}

        <p className="mt-10 text-[11px] text-muted-foreground/60">
          AnnaSetu — Anna (food) + Setu (bridge) · the bridge for food
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SCREEN — shown during initial load & route transitions
// ─────────────────────────────────────────────────────────────────────────────
function LoadingScreen({ exiting = false }: { exiting?: boolean }) {
  // Grain-themed animated dots
  const grains = ["🌾", "🥦", "🍅", "🌽", "🫘"];

  const tips = [
    "Connecting hunger relief corridors…",
    "Calibrating real-time cold chain monitors…",
    "Running AI freshness & food safety checks…",
  ];

  // Pick exactly one random status message per load
  const [activeTip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        exiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[500px] rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30">
            <svg viewBox="0 0 24 24" className="size-6 fill-primary-foreground">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-foreground">AnnaSetu</p>
            <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Food Waste · Redistribution</p>
          </div>
        </div>

        {/* Animated food grain orbit */}
        <div className="relative flex size-24 items-center justify-center">
          {grains.map((g, i) => (
            <span
              key={i}
              className="absolute text-lg"
              style={{
                animation: `spin 2.5s linear infinite`,
                animationDelay: `${i * -0.5}s`,
                transformOrigin: "0 0",
                transform: `rotate(${i * 72}deg) translateX(44px)`,
              }}
            >
              {g}
            </span>
          ))}
          {/* Centre pulse */}
          <div className="size-10 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
            <div className="size-5 rounded-full bg-primary animate-ping" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-1 w-52 overflow-hidden rounded-full bg-muted shadow-inner">
            <div
              className="h-full bg-primary rounded-full shadow-sm"
              style={{ animation: "loading-progress 1.4s ease-in-out infinite" }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-medium h-4 text-center">
            {activeTip}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loading-progress {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 70%;  margin-left: 15%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION EXPIRED OVERLAY
// 30 minutes of inactivity → show overlay
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS  =  2 * 60 * 1000; //  2 minute warning

function SessionExpiredOverlay() {
  const [expired, setExpired]     = useState(false);
  const [warning, setWarning]     = useState(false);
  const [countdown, setCountdown] = useState(120); // seconds shown in warning
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = () => {
    if (timerRef.current)  clearTimeout(timerRef.current);
    if (warnRef.current)   clearTimeout(warnRef.current);
    if (countRef.current)  clearInterval(countRef.current);
  };

  const startTimers = useCallback(() => {
    clearAll();
    setWarning(false);
    setExpired(false);
    setCountdown(120);

    // Warning 2 min before expiry
    warnRef.current = setTimeout(() => {
      setWarning(true);
      setCountdown(120);
      countRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countRef.current!);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Full expiry
    timerRef.current = setTimeout(() => {
      clearAll();
      setWarning(false);
      setExpired(true);
    }, SESSION_TIMEOUT_MS);
  }, []);

  const continueSession = () => {
    setWarning(false);
    setExpired(false);
    startTimers();
  };

  const signOut = () => {
    clearAll();
    setWarning(false);
    setExpired(false);
    // In a real app this would clear tokens; here we just go home
    window.location.href = "/";
  };

  useEffect(() => {
    startTimers();
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const reset = () => { if (!expired) startTimers(); };
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearAll();
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimers]);

  // ── Warning banner (2-min countdown) ────────────────────────────────────────
  if (warning && !expired) {
    const pct = ((120 - countdown) / 120) * 100;
    return (
      <div className="fixed bottom-4 left-1/2 z-[9998] -translate-x-1/2 w-[min(92vw,420px)] animate-in slide-in-from-bottom-4">
        <div className="rounded-2xl border border-amber-500/40 bg-card shadow-2xl overflow-hidden">
          {/* Countdown progress strip */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="p-4 flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Session expiring soon</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your session will expire in{" "}
                <span className="font-mono font-bold text-amber-600">
                  {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                </span>
                {" "}due to inactivity.
              </p>
              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  onClick={continueSession}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Continue Session
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Full session expired screen ──────────────────────────────────────────────
  if (!expired) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-md px-4">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/6 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Top accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-accent" />

          <div className="p-8 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-lg">
              <svg
                className="size-10 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <div className="absolute inset-0 rounded-2xl border border-primary/10 animate-ping" />
            </div>

            {/* Brand */}
            <div className="flex items-center gap-1.5 mb-6">
              <div className="size-5 rounded-md bg-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-3 fill-primary-foreground">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">AnnaSetu</span>
            </div>

            <h2 className="text-xl font-bold text-foreground">Session Expired</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              You've been inactive for <span className="font-semibold text-foreground">30 minutes</span>.
              Your session has ended to keep your dashboard secure.
            </p>

            {/* Security badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Your data is safe & secure
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={continueSession}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-0.5"
              >
                Continue Session
              </button>
              <button
                type="button"
                onClick={signOut}
                className="w-full rounded-xl border border-border bg-background py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              >
                Sign Out & Go Home
              </button>
            </div>

            <p className="mt-5 text-[10px] text-muted-foreground/50">
              Sessions automatically expire after 30 minutes of inactivity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "AnnaSetu" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isRouterPending = routerState.status === "pending";

  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const lastPathRef = useRef(currentPath);
  const visitedPathsRef = useRef<Set<string>>(new Set([currentPath]));

  // Initial client load — display branded splash loader on initial app entry
  useEffect(() => {
    setHasMounted(true);
    setIsLoading(true);
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      const hideTimer = setTimeout(() => {
        setIsLoading(false);
        setIsExiting(false);
      }, 300);
      return () => clearTimeout(hideTimer);
    }, 1200);

    return () => clearTimeout(exitTimer);
  }, []);

  // Route transitions:
  // - Landing (/) and Dashboard (/dashboard) ALWAYS load on first visit and every revisit
  // - Other sub-sections only load once on first visit and NEVER reload when revisited
  useEffect(() => {
    if (!hasMounted) return;
    if (lastPathRef.current === currentPath) return;
    lastPathRef.current = currentPath;

    const isLandingOrDashboard = currentPath === "/" || currentPath === "/dashboard";

    if (isLandingOrDashboard) {
      // Always trigger loading screen when navigating to landing or dashboard
      setIsLoading(true);
      setIsExiting(false);

      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        const hideTimer = setTimeout(() => {
          setIsLoading(false);
          setIsExiting(false);
        }, 200);
        return () => clearTimeout(hideTimer);
      }, 500);

      return () => clearTimeout(exitTimer);
    }

    // For other sub-sections: do not load again if already visited
    if (visitedPathsRef.current.has(currentPath)) {
      return;
    }

    visitedPathsRef.current.add(currentPath);
    setIsLoading(true);
    setIsExiting(false);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      const hideTimer = setTimeout(() => {
        setIsLoading(false);
        setIsExiting(false);
      }, 150);
      return () => clearTimeout(hideTimer);
    }, 180);

    return () => clearTimeout(exitTimer);
  }, [currentPath, hasMounted]);

  const showLoading = hasMounted && (isLoading || isRouterPending);

  return (
    <QueryClientProvider client={queryClient}>
      <ViewModeProvider>
        <AlertsProvider>
          {/* Full-page loading screen with increased duration & smooth fade */}
          {showLoading && <LoadingScreen exiting={isExiting} />}

          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <Toaster position="bottom-right" />

          {/* Session expiry — global inactivity tracker (client-only) */}
          {hasMounted && <SessionExpiredOverlay />}
        </AlertsProvider>
      </ViewModeProvider>
    </QueryClientProvider>
  );
}
