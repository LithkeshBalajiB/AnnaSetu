import { Link } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  ThermometerSnowflake,
  Truck,
  Leaf,
  Menu,
  X,
  SlidersHorizontal,
  History,
  ScanLine,
  ClipboardList,
  Users,
  Trophy,
  Wifi,
  ChefHat,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/components/view-mode";
import { NotificationCenter } from "@/components/notification-center";
import { AIChatbot } from "@/components/ai-chatbot";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette, CommandPaletteTrigger } from "@/components/command-palette";
import { OnboardingTour, TourButton } from "@/components/onboarding-tour";

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/surplus-forecast", label: "Surplus & Forecast", icon: TrendingUp },
      { to: "/quality-scanner", label: "AI Vision Scanner", icon: ScanLine },
      { to: "/scan-history", label: "Scan History", icon: ClipboardList },
      { to: "/quality-alerts", label: "Quality Alerts", icon: ThermometerSnowflake },
    ],
  },
  {
    label: "Redistribution",
    items: [
      { to: "/redistribution", label: "Redistribution & Traceability", icon: Truck },
      { to: "/ngo-registry", label: "NGO Partner Registry", icon: Users },
      { to: "/pickup-calendar", label: "Batch Pickup Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/iot-sensors", label: "IoT Sensor Feed", icon: Wifi },
      { to: "/menu-optimizer", label: "AI Menu Optimizer", icon: ChefHat },
      { to: "/impact-wall", label: "Impact Wall", icon: Trophy },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/sustainability", label: "Sustainability Report", icon: Leaf },
      { to: "/alert-history", label: "Alert History", icon: History },
      { to: "/alert-settings", label: "Alert Settings", icon: SlidersHorizontal },
    ],
  },
] as const;

export function DashboardLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { mode, setMode, data } = useViewMode();
  const [open, setOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [tourForceOpen, setTourForceOpen] = useState(false);

  // Global shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 no-print",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link to="/" className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Leaf className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">AnnaSetu</p>
            <p className="text-xs text-sidebar-foreground/60">Food Waste & Redistribution</p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </Link>
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    activeOptions={{ exact: false }}
                    activeProps={{
                      className:
                        "bg-sidebar-primary/15 text-sidebar-accent-foreground ring-1 ring-sidebar-primary/40",
                    }}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="m-3 rounded-lg bg-sidebar-accent/60 p-3 text-xs text-sidebar-foreground/75">
          <p className="font-medium text-sidebar-accent-foreground">Demo data</p>
          <p className="mt-1">All figures are simulated for demonstration.</p>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden no-print"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur md:px-6 no-print">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold md:text-lg">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Command Palette Trigger */}
            <CommandPaletteTrigger onClick={() => setCommandPaletteOpen(true)} />

            {/* View Mode Switcher */}
            <div className="hidden sm:flex rounded-lg bg-muted p-1">
              {(["kitchen", "processing"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    mode === m
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "kitchen" ? "Kitchen view" : "Processing view"}
                </button>
              ))}
            </div>

            {/* Guided Tour Launcher */}
            <TourButton onClick={() => setTourForceOpen(true)} />

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            <NotificationCenter />
          </div>
        </header>
        <main className="p-4 md:p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-primary no-print">
            {data.label}
          </p>
          {children}
        </main>
      </div>

      {/* Global AI Chatbot Copilot */}
      <AIChatbot />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onStartTour={() => setTourForceOpen(true)}
      />

      {/* Global Onboarding Feature Tour */}
      <OnboardingTour
        forceOpen={tourForceOpen}
        onClose={() => setTourForceOpen(false)}
      />
    </div>
  );
}

