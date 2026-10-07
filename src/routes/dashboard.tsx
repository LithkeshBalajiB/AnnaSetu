import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Scale,
  AlertTriangle,
  HeartHandshake,
  PackageCheck,
  CloudDrizzle,
  ScanLine,
  Truck,
  CalendarDays,
  ChefHat,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  Wifi,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, StatCard, RiskBadge, TableShell, Th, Td } from "@/components/dashboard-ui";
import { useViewMode } from "@/components/view-mode";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Overview — AnnaSetu" },
      {
        name: "description",
        content:
          "Live mission control for predicted food surplus, near-expiry alerts, NGO matches and CO2 avoided across kitchens and processing units.",
      },
      { property: "og:title", content: "Dashboard Overview — AnnaSetu" },
      {
        property: "og:description",
        content:
          "Predicted surplus, expiry risk and redistribution impact in one sustainability control room.",
      },
    ],
  }),
  component: Overview,
});

const RECENT_ACTIVITY = [
  {
    id: "act-1",
    time: "2 mins ago",
    title: "AI Scan Passed (Grade A)",
    desc: "42 kg Steamed Sona Masoori Rice verified for distribution.",
    tag: "AI Scanner",
    badgeCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "act-2",
    time: "8 mins ago",
    title: "Truck TN-09-KL-4412 Departed",
    desc: "En route to Seva Shelter Home (Cold chain: 3.2°C).",
    tag: "Redistribution",
    badgeCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "act-3",
    time: "19 mins ago",
    title: "Zero-Waste Recipe Generated",
    desc: "12 kg surplus paneer converted to Biryani Gravy prep sheet.",
    tag: "Menu AI",
    badgeCls: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    id: "act-4",
    time: "34 mins ago",
    title: "Cold Room A Sensor Normal",
    desc: "Temp stabilized at 3.4°C after loading dock closed.",
    tag: "IoT Telemetry",
    badgeCls: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
];

function Overview() {
  const { data } = useViewMode();
  const s = data.summary;
  const [chartRange, setChartRange] = useState<"14d" | "7d">("14d");

  const chartData = useMemo(() => {
    if (chartRange === "7d") {
      return data.demandVsActual.slice(-7);
    }
    return data.demandVsActual;
  }, [data.demandVsActual, chartRange]);

  return (
    <DashboardLayout
      title="Mission Control"
      subtitle="Today's surplus signals, cold-chain telemetry and redistribution logistics"
    >
      {/* Real-time Operational Banner */}
      <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Live Operations Active
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Cold Chain 100% Safe
              </span>
            </div>
            <h2 className="text-lg font-bold sm:text-xl text-foreground">
              Food redistribution in progress across 4 Bengaluru NGO clusters
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Predicted daily surplus is down 14% this week. Zero food safety violations detected by IoT sensors.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/quality-scanner"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-all"
            >
              <ScanLine className="size-4" />
              <span>AI Scan Batch</span>
            </Link>
            <Link
              to="/redistribution"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <Truck className="size-4 text-primary" />
              <span>Track Fleet GPS</span>
            </Link>
            <Link
              to="/pickup-calendar"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <CalendarDays className="size-4 text-primary" />
              <span>Pickup Calendar</span>
            </Link>
            <Link
              to="/menu-optimizer"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <ChefHat className="size-4 text-purple-600 dark:text-purple-400" />
              <span>AI Repurpose</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Surplus predicted today"
          value={s.surplusTodayKg.toLocaleString()}
          unit="kg"
          hint="-14% vs last week peak"
          icon={<Scale className="size-4" />}
        />
        <StatCard
          label="Items flagged near-expiry"
          value={String(s.nearExpiryItems)}
          hint="2 critical · 10 moderate"
          tone="warning"
          icon={<AlertTriangle className="size-4" />}
        />
        <StatCard
          label="Active NGO dispatches"
          value={String(s.activeMatches)}
          hint="4 en-route · 1 pending"
          icon={<HeartHandshake className="size-4" />}
        />
        <StatCard
          label="Food saved this month"
          value={s.savedThisMonthKg.toLocaleString()}
          unit="kg"
          hint="~5,850 meals provided"
          tone="success"
          icon={<PackageCheck className="size-4" />}
        />
        <StatCard
          label="CO₂e avoided this month"
          value={s.co2AvoidedKg.toLocaleString()}
          unit="kg"
          hint="Eqv. to 292 trees planted"
          tone="success"
          icon={<CloudDrizzle className="size-4" />}
        />
      </div>

      {/* Main Charts & Quick Operational Panels */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* Demand vs Actual Chart */}
        <Card
          className="xl:col-span-2"
          title="Predicted Demand vs Actual Consumption"
          description="Machine learning forecast variance across kitchen preparation cycles (kg)"
          action={
            <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setChartRange("7d")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartRange === "7d"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange("14d")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartRange === "14d"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                14 Days
              </button>
            </div>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="predicted" name="Predicted demand" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual consumption"
                  stroke="var(--chart-4)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live Operational Fleet Status */}
        <div className="space-y-4">
          <Card
            title="Redistribution Fleet Status"
            description="Active cold-chain logistics convoy"
            action={
              <Link
                to="/redistribution"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Live Map</span>
                <ArrowRight className="size-3" />
              </Link>
            }
          >
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Truck className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">TN-09-KL-4412</p>
                    <p className="text-[11px] text-muted-foreground">Cold Hold Van · 3.2°C</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Moving
                </span>
              </div>

              {/* Delivery Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Bengaluru Central Run</span>
                  <span className="font-semibold text-foreground">Stop 1 of 4</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: "25%" }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 text-primary" /> Next ETA: 12:15 PM
                </span>
                <span className="font-medium text-foreground">Seva Shelter Home</span>
              </div>
            </div>

            {/* Quick Link to IoT Sensors */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border/80 bg-card p-3">
              <div className="flex items-center gap-2">
                <Wifi className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium">IoT Environmental Telemetry</span>
              </div>
              <Link
                to="/iot-sensors"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>3 Freezers Safe</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Flagged Items & Live Activity Feed Grid */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* Flagged Near-Expiry Items with 1-click repurpose */}
        <Card
          className="xl:col-span-2"
          title="Today's Flagged Inventory Items"
          description="Sorted by expiry urgency with immediate action buttons"
          action={
            <Link
              to="/menu-optimizer"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Convert in Menu AI</span>
              <ArrowRight className="size-3" />
            </Link>
          }
        >
          <TableShell minWidth="24rem">
            <thead>
              <tr>
                <Th>Item & Source</Th>
                <Th>Qty</Th>
                <Th>Expiry Risk</Th>
                <Th>Storage Temp</Th>
                <Th>Recommended Action</Th>
              </tr>
            </thead>
            <tbody>
              {[...data.flagged]
                .sort(
                  (a, b) =>
                    ["critical", "near-expiry", "fresh"].indexOf(a.risk) -
                    ["critical", "near-expiry", "fresh"].indexOf(b.risk),
                )
                .map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <Td>
                      <div>
                        <p className="font-semibold text-foreground">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.source} · {f.location}</p>
                      </div>
                    </Td>
                    <Td className="font-bold">{f.quantityKg} kg</Td>
                    <Td>
                      <RiskBadge risk={f.risk} />
                    </Td>
                    <Td>
                      <span className="font-mono text-xs">
                        {f.temperatureC > 50 ? `${f.temperatureC}°C (Hot Hold)` : `${f.temperatureC}°C (Chilled)`}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/pickup-calendar"
                          className="rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-semibold transition-colors"
                        >
                          Dispatch
                        </Link>
                        <Link
                          to="/menu-optimizer"
                          className="rounded-lg border border-border hover:bg-muted px-2 py-1 text-xs font-medium text-foreground transition-colors"
                        >
                          Repurpose
                        </Link>
                      </div>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </TableShell>
        </Card>

        {/* Live Operations Activity Ticker */}
        <Card
          title="Live System Activity"
          description="Real-time log of AI validations & pickups"
        >
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${act.badgeCls}`}>
                      {act.tag}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{act.time}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-foreground leading-tight">
                    {act.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {act.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">All systems operational</span>
            <Link
              to="/alert-history"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Audit Logs</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
