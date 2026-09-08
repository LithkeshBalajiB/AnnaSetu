import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, TableShell, Th, Td } from "@/components/dashboard-ui";
import { useViewMode } from "@/components/view-mode";
import { SURPLUS_THRESHOLD_KG } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/surplus-forecast")({
  head: () => ({
    meta: [
      { title: "Surplus & Forecast — AnnaSetu" },
      {
        name: "description",
        content:
          "Week-ahead surplus predictions per menu item or product batch, with demand, planned production and model confidence.",
      },
      { property: "og:title", content: "Surplus & Forecast — AnnaSetu" },
      {
        property: "og:description",
        content: "Predict food surplus before it happens, item by item.",
      },
    ],
  }),
  component: Forecast,
});

function Forecast() {
  const { data } = useViewMode();
  const [query, setQuery] = useState("");
  const [onlyRisky, setOnlyRisky] = useState(false);

  const rows = useMemo(
    () =>
      data.forecastRows.filter(
        (r) =>
          r.item.toLowerCase().includes(query.toLowerCase()) &&
          (!onlyRisky || r.predictedSurplusKg > SURPLUS_THRESHOLD_KG),
      ),
    [data, query, onlyRisky],
  );

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

  return (
    <DashboardLayout
      title="Surplus & Forecast"
      subtitle={`Upcoming week predictions per ${data.unitLabel.toLowerCase()}`}
    >
      <Card
        title="Predicted surplus by day"
        description={`Next 7 days, stacked by ${data.unitLabel.toLowerCase()} (kg)`}
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklySurplus}>
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
              {data.surplusSeries.map((s, i) => (
                <Bar key={s} dataKey={s} stackId="a" fill={colors[i % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card
        className="mt-4"
        title="Forecast detail"
        description={`Rows above ${SURPLUS_THRESHOLD_KG} kg predicted surplus are highlighted`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter items…"
              className="h-9 w-40 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <button
              onClick={() => setOnlyRisky((v) => !v)}
              className={cn(
                "h-9 rounded-lg border px-3 text-xs font-medium transition-colors",
                onlyRisky
                  ? "border-warning bg-warning/20 text-warning-foreground"
                  : "border-input text-muted-foreground hover:text-foreground",
              )}
            >
              Above threshold only
            </button>
          </div>
        }
      >
        <TableShell>
          <thead>
            <tr>
              <Th>{data.unitLabel}</Th>
              <Th>Predicted demand</Th>
              <Th>Planned production</Th>
              <Th>Predicted surplus</Th>
              <Th>Confidence</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const risky = r.predictedSurplusKg > SURPLUS_THRESHOLD_KG;
              return (
                <tr key={r.id} className={cn(risky && "bg-warning/10")}>
                  <Td className="font-medium">{r.item}</Td>
                  <Td>{r.predictedDemandKg} kg</Td>
                  <Td>{r.plannedProductionKg} kg</Td>
                  <Td className={cn("font-semibold", risky && "text-warning-foreground")}>
                    {r.predictedSurplusKg} kg
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${r.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(r.confidence * 100)}%
                      </span>
                    </div>
                  </Td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <Td className="py-6 text-center text-muted-foreground">No matching items.</Td>
              </tr>
            )}
          </tbody>
        </TableShell>
      </Card>
    </DashboardLayout>
  );
}
