import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { Camera, Droplets, Thermometer, MapPin, Send, ScanLine } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, RiskBadge } from "@/components/dashboard-ui";
import { useViewMode } from "@/components/view-mode";

export const Route = createFileRoute("/quality-alerts")({
  head: () => ({
    meta: [
      { title: "Quality Alerts — AnnaSetu" },
      {
        name: "description",
        content:
          "Computer-vision and sensor flagged items with live temperature, humidity and freshness status per storage unit.",
      },
      { property: "og:title", content: "Quality Alerts — AnnaSetu" },
      {
        property: "og:description",
        content: "Catch near-expiry stock before it becomes waste.",
      },
    ],
  }),
  component: QualityAlerts,
});

function QualityAlerts() {
  const { data } = useViewMode();

  return (
    <DashboardLayout
      title="Quality Alerts"
      subtitle="Sensor and vision flagged stock across storage units"
    >
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {data.flagged.map((f) => (
          <div
            key={f.id}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex h-32 items-center justify-center bg-muted text-muted-foreground">
              <Camera className="size-7 opacity-50" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{f.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {f.location} · {f.quantityKg} kg
                  </p>
                </div>
                <RiskBadge risk={f.risk} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted/60 px-3 py-2">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Thermometer className="size-3" /> Temp
                  </p>
                  <p className="font-semibold">{f.temperatureC}°C</p>
                </div>
                <div className="rounded-lg bg-muted/60 px-3 py-2">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Droplets className="size-3" /> Humidity
                  </p>
                  <p className="font-semibold">{f.humidity}%</p>
                </div>
              </div>
              <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-border">
                <Link
                  to="/quality-scanner"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <ScanLine className="size-3.5" /> Run AI Vision Defect Scan
                </Link>
                <button
                  onClick={() => toast.success(`${f.name} queued for redistribution — Traceable Batch ID & QR generated!`)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Send className="size-3.5" /> Send to redistribution & trace
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title="Storage temperature — last 24h" description="Three monitored storage units">
          <ChartBlock
            data={data.storageTrend}
            keys={[
              { k: "unitA", name: "Cold room 1 (°C)" },
              { k: "unitB", name: "Cold room 2 (°C)" },
              { k: "unitC", name: "Freezer C (°C)" },
            ]}
          />
        </Card>
        <Card title="Storage humidity — last 24h" description="Relative humidity (%)">
          <ChartBlock
            data={data.storageTrend}
            keys={[
              { k: "humA", name: "Cold room 1" },
              { k: "humB", name: "Cold room 2" },
              { k: "humC", name: "Freezer C" },
            ]}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

function ChartBlock({
  data,
  keys,
}: {
  data: Record<string, number | string>[];
  keys: { k: string; name: string }[];
}) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-5)"];
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
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
          {keys.map((key, i) => (
            <Line
              key={key.k}
              type="monotone"
              dataKey={key.k}
              name={key.name}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
