import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Risk } from "@/lib/mock-data";

export function Card({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm md:p-5",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold md:text-base">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    danger: "bg-danger/15 text-danger",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span className={cn("flex size-8 items-center justify-center rounded-lg", tones[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function RiskBadge({ risk }: { risk: Risk }) {
  const map: Record<Risk, { cls: string; label: string }> = {
    fresh: { cls: "bg-success/15 text-success", label: "Fresh" },
    "near-expiry": { cls: "bg-warning/25 text-warning-foreground", label: "Near expiry" },
    critical: { cls: "bg-danger/15 text-danger", label: "Critical" },
  };
  const { cls, label } = map[risk];
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", cls)}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "delivered"
      ? "bg-success/15 text-success"
      : status === "in transit"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize", cls)}>
      {status}
    </span>
  );
}

export function TableShell({
  children,
  minWidth = "36rem",
}: {
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-border pb-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn("border-b border-border/60 py-3 pr-4", className)}>
      {children}
    </td>
  );
}

