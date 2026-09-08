import { createFileRoute } from "@tanstack/react-router";
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
import { Scale, AlertTriangle, HeartHandshake, PackageCheck, CloudDrizzle } from "lucide-react";
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
          "Live overview of predicted food surplus, near-expiry alerts, NGO matches and CO2 avoided across kitchens and processing units.",
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

function Overview() {
  const { data } = useViewMode();
  const s = data.summary;

  return (
    <DashboardLayout
      title="Overview"
      subtitle="Today's surplus signals, expiry risk and redistribution impact"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Surplus predicted today"
          value={s.surplusTodayKg.toLocaleString()}
          unit="kg"
          hint="Model confidence 91%"
          icon={<Scale className="size-4" />}
        />
        <StatCard
          label="Items flagged near-expiry"
          value={String(s.nearExpiryItems)}
          hint="Across all storage units"
          tone="warning"
          icon={<AlertTriangle className="size-4" />}
        />
        <StatCard
          label="Active NGO / buyer matches"
          value={String(s.activeMatches)}
          hint="Pickups scheduled today"
          icon={<HeartHandshake className="size-4" />}
        />
        <StatCard
          label="Food saved this month"
          value={s.savedThisMonthKg.toLocaleString()}
          unit="kg"
          tone="success"
          icon={<PackageCheck className="size-4" />}
        />
        <StatCard
          label="CO₂e avoided this month"
          value={s.co2AvoidedKg.toLocaleString()}
          unit="kg"
          tone="success"
          icon={<CloudDrizzle className="size-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Predicted demand vs actual consumption"
          description="Last 14 days, aggregated across all lines (kg)"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.demandVsActual}>
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
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Today's flagged items" description="Sorted by expiry risk">
          <TableShell minWidth="20rem">
            <thead>
              <tr>
                <Th>Item</Th>
                <Th>Qty</Th>
                <Th>Risk</Th>
                <Th>Source</Th>
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
                  <tr key={f.id}>
                    <Td className="font-medium">{f.name}</Td>
                    <Td>{f.quantityKg} kg</Td>
                    <Td>
                      <RiskBadge risk={f.risk} />
                    </Td>
                    <Td className="text-muted-foreground">{f.source}</Td>
                  </tr>
                ))}
            </tbody>
          </TableShell>
        </Card>
      </div>
    </DashboardLayout>
  );
}
