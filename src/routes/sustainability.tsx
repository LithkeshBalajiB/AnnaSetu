import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FileText, Printer, Download, X, Leaf, Users, CloudDrizzle, Droplets } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, StatCard } from "@/components/dashboard-ui";
import { useViewMode } from "@/components/view-mode";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      { title: "Sustainability Report — AnnaSetu" },
      {
        name: "description",
        content:
          "Food saved, meals redirected, CO2e avoided and water savings, with a printable ESG summary for reporting.",
      },
      { property: "og:title", content: "Sustainability Report — AnnaSetu" },
      {
        property: "og:description",
        content: "Six months of waste reduction impact, ready to export as an ESG summary.",
      },
    ],
  }),
  component: Sustainability,
});

function Sustainability() {
  const { data, mode } = useViewMode();
  const [showReport, setShowReport] = useState(false);
  const su = data.sustainability;

  const downloadCsv = () => {
    const rows = [
      ["Metric", "Value", "Unit"],
      ["Food saved", String(su.foodSavedKg), "kg"],
      ["Meals redirected", String(su.mealsRedirected), "meals"],
      ["CO2e avoided", String(su.co2AvoidedKg), "kg"],
      ["Water saved", String(su.waterSavedL), "litres"],
      [],
      ["Month", "Waste (kg)", "Saved (kg)"],
      ...su.monthly.map((m) => [m.month, String(m.wasteKg), String(m.savedKg)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `esg-report-${mode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      title="Sustainability Report"
      subtitle="Impact of redistributed surplus over the last 6 months"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total food saved"
          value={su.foodSavedKg.toLocaleString()}
          unit="kg"
          tone="success"
          icon={<Leaf className="size-4" />}
        />
        <StatCard
          label="Meals redirected to people"
          value={su.mealsRedirected.toLocaleString()}
          tone="primary"
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="CO₂e avoided"
          value={su.co2AvoidedKg.toLocaleString()}
          unit="kg"
          tone="success"
          icon={<CloudDrizzle className="size-4" />}
        />
        <StatCard
          label="Water saved (estimate)"
          value={(su.waterSavedL / 1000).toLocaleString()}
          unit="kL"
          tone="primary"
          icon={<Droplets className="size-4" />}
        />
      </div>

      <Card
        className="mt-4"
        title="Waste reduction trend"
        description="Waste sent to disposal vs food redistributed (kg)"
        action={
          <button
            onClick={() => setShowReport(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <FileText className="size-4" /> Generate ESG report
          </button>
        }
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={su.monthly}>
              <defs>
                <linearGradient id="saved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="waste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
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
              <Area
                type="monotone"
                dataKey="savedKg"
                name="Food redistributed"
                stroke="var(--chart-2)"
                fill="url(#saved)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="wasteKg"
                name="Waste to disposal"
                stroke="var(--chart-4)"
                fill="url(#waste)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {showReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/50 p-4 backdrop-blur-sm">
          <div className="print-area mx-auto max-w-3xl rounded-xl bg-card p-6 shadow-xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  ESG Summary · {data.label}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Food Waste & Redistribution Report</h2>
                <p className="text-sm text-muted-foreground">
                  Reporting period: April – September 2026 · Generated by AnnaSetu
                </p>
              </div>
              <div className="flex gap-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Printer className="size-4" /> Print
                </button>
                <button
                  onClick={downloadCsv}
                  className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Download className="size-4" /> CSV
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  className="rounded-lg border border-input p-2 hover:bg-accent"
                  aria-label="Close report"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Food saved", `${su.foodSavedKg.toLocaleString()} kg`],
                ["Meals redirected", su.mealsRedirected.toLocaleString()],
                ["CO₂e avoided", `${su.co2AvoidedKg.toLocaleString()} kg`],
                ["Water saved", `${(su.waterSavedL / 1000).toLocaleString()} kL`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="mt-1 text-lg font-semibold">{v}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-6 text-sm font-semibold">Monthly breakdown</h3>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2">Month</th>
                  <th className="pb-2">Waste to disposal (kg)</th>
                  <th className="pb-2">Food redistributed (kg)</th>
                  <th className="pb-2">Diversion rate</th>
                </tr>
              </thead>
              <tbody>
                {su.monthly.map((m) => (
                  <tr key={m.month} className="border-b border-border/60">
                    <td className="py-2 font-medium">{m.month} 2026</td>
                    <td className="py-2">{m.wasteKg.toLocaleString()}</td>
                    <td className="py-2">{m.savedKg.toLocaleString()}</td>
                    <td className="py-2">
                      {Math.round((m.savedKg / (m.savedKg + m.wasteKg)) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Methodology: CO₂e avoided estimated at 2.5 kg per kg of food diverted from disposal;
              water savings estimated at 500 litres per kg; meals calculated at 0.42 kg per serving.
              Figures in this demo are simulated sample data.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
