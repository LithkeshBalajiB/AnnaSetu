import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/components/view-mode";
import { NotificationCenter } from "@/components/notification-center";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/surplus-forecast", label: "Surplus & Forecast", icon: TrendingUp },
  { to: "/quality-scanner", label: "AI Vision Scanner", icon: ScanLine },
  { to: "/quality-alerts", label: "Quality Alerts", icon: ThermometerSnowflake },
  { to: "/redistribution", label: "Redistribution & Traceability", icon: Truck },
  { to: "/sustainability", label: "Sustainability Report", icon: Leaf },
  { to: "/alert-history", label: "Alert History", icon: History },
  { to: "/alert-settings", label: "Alert Settings", icon: SlidersHorizontal },
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

  return (
    <div className="min-h-screen bg-background text-foreground">
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
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          <div className="ml-auto flex items-center gap-3">
            <div className="flex rounded-lg bg-muted p-1">
              {(["kitchen", "processing"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    mode === m
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "kitchen" ? "Kitchen view" : "Processing unit view"}
                </button>
              ))}
            </div>
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
    </div>
  );
}
