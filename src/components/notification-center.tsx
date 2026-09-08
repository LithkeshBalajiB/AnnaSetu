import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  AlertTriangle,
  X,
  Settings2,
  MapPin,
  Check,
  Clock,
  History,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAlerts,
  SNOOZE_OPTIONS,
  formatTime,
  type Notification,
} from "@/components/alerts";

export function NotificationCenter() {
  const { notifications, activeCount, unread, markAllRead } = useAlerts();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) markAllRead();
        }}
        className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[24rem] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notification centre</p>
              <p className="text-xs text-muted-foreground">
                {activeCount} needing attention · {notifications.length} total
              </p>
            </div>
            <div className="flex gap-1">
              <Link
                to="/alert-history"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 rounded-lg border border-input px-2 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <History className="size-3.5" /> History
              </Link>
              <Link
                to="/alert-settings"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 rounded-lg border border-input px-2 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <Settings2 className="size-3.5" />
              </Link>
            </div>
          </div>
          <div className="max-h-[28rem] overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No alerts above your current thresholds.
              </p>
            )}
            {notifications.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n }: { n: Notification }) {
  const { acknowledge, snooze, unsnooze, dismiss } = useAlerts();
  const [mode, setMode] = useState<"idle" | "ack" | "snooze">("idle");
  const [note, setNote] = useState("");

  return (
    <div
      className={cn(
        "border-b border-border/60 px-4 py-3 last:border-0",
        n.snoozed && "bg-muted/50 opacity-70",
        n.ack && "bg-success/5",
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
            n.ack
              ? "bg-success/15 text-success"
              : n.snoozed
                ? "bg-muted text-muted-foreground"
                : n.severity === "critical"
                  ? "bg-danger/15 text-danger"
                  : "bg-warning/25 text-warning-foreground",
          )}
        >
          {n.ack ? (
            <Check className="size-3.5" />
          ) : n.snoozed ? (
            <BellOff className="size-3.5" />
          ) : (
            <AlertTriangle className="size-3.5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">{n.title}</p>
          <p className="text-xs text-muted-foreground">{n.item}</p>
          <p className="mt-1 text-xs">{n.detail}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3" /> {n.location} · {n.time}
          </p>

          {n.ack && (
            <div className="mt-2 rounded-lg border border-success/40 bg-success/10 p-2 text-[11px]">
              <p className="font-medium text-success">
                Handled by {n.ack.by} · {formatTime(n.ack.at)}
              </p>
              {n.ack.note && <p className="mt-0.5 text-foreground/80">“{n.ack.note}”</p>}
            </div>
          )}

          {n.snoozed && !n.ack && (
            <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Clock className="size-3" /> Snoozed {n.snooze?.label.toLowerCase()} · resumes{" "}
              {formatTime(n.snooze!.until)}
              <button onClick={() => unsnooze(n.id)} className="ml-1 underline">
                resume now
              </button>
            </p>
          )}

          {mode === "ack" && (
            <div className="mt-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                rows={2}
                placeholder="Add a note (optional) — what action was taken?"
                className="w-full rounded-lg border border-input bg-background p-2 text-xs outline-none focus:ring-2 focus:ring-ring/40"
              />
              <div className="mt-1.5 flex gap-2">
                <button
                  onClick={() => {
                    acknowledge(n.id, note.trim());
                    setMode("idle");
                  }}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Confirm handled
                </button>
                <button
                  onClick={() => setMode("idle")}
                  className="rounded-lg border border-input px-3 py-1.5 text-xs hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {mode === "snooze" && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SNOOZE_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => {
                    snooze(n.id, o.key);
                    setMode("idle");
                  }}
                  className="rounded-lg border border-input px-2.5 py-1.5 text-xs hover:bg-accent"
                >
                  {o.label}
                </button>
              ))}
              <button
                onClick={() => setMode("idle")}
                className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}

          {mode === "idle" && !n.ack && (
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={() => setMode("ack")}
                className="inline-flex items-center gap-1 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <Check className="size-3.5" /> Mark handled
              </button>
              {!n.snoozed && (
                <button
                  onClick={() => setMode("snooze")}
                  className="inline-flex items-center gap-1 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  <Clock className="size-3.5" /> Snooze
                </button>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => dismiss(n.id)}
          aria-label="Dismiss alert"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
