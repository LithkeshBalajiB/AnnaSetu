import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { Thermometer, Droplets, AlertTriangle, CheckCircle2, RefreshCw, Wifi, WifiOff, Activity } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/iot-sensors")({
  head: () => ({
    meta: [
      { title: "IoT Sensor Live Feed — AnnaSetu" },
      { name: "description", content: "Real-time cold chain temperature and humidity monitoring per storage zone with live breach alerts." },
    ],
  }),
  component: IoTSensorsPage,
});

interface SensorZone {
  id: string;
  name: string;
  type: "Cold Room" | "Freezer" | "Ambient Store" | "Hot Hold" | "Dry Store";
  minTemp: number;
  maxTemp: number;
  minHum: number;
  maxHum: number;
  color: string;
}

const ZONES: SensorZone[] = [
  { id:"z1", name:"Cold Room A",    type:"Cold Room",   minTemp:2,  maxTemp:6,  minHum:80, maxHum:95, color:"#06b6d4" },
  { id:"z2", name:"Cold Room B",    type:"Cold Room",   minTemp:2,  maxTemp:6,  minHum:80, maxHum:95, color:"#0ea5e9" },
  { id:"z3", name:"Freezer Unit",   type:"Freezer",     minTemp:-22,maxTemp:-16,minHum:60, maxHum:80, color:"#8b5cf6" },
  { id:"z4", name:"Hot Hold Station",type:"Hot Hold",   minTemp:60, maxTemp:75, minHum:40, maxHum:70, color:"#f97316" },
  { id:"z5", name:"Dry Store",      type:"Dry Store",   minTemp:18, maxTemp:25, minHum:30, maxHum:55, color:"#eab308" },
];

function randInRange(min: number, max: number, drift = 0): number {
  return parseFloat((min + (max - min) * (0.3 + 0.4 * Math.random()) + drift).toFixed(1));
}

function generateHistory(zone: SensorZone, n = 20) {
  const rows = [];
  let t = randInRange(zone.minTemp, zone.maxTemp);
  let h = randInRange(zone.minHum, zone.maxHum);
  for (let i = n; i >= 0; i--) {
    const drift = (Math.random() - 0.5) * 0.4;
    t = parseFloat(Math.max(zone.minTemp - 3, Math.min(zone.maxTemp + 3, t + drift)).toFixed(1));
    h = parseFloat(Math.max(zone.minHum - 10, Math.min(zone.maxHum + 10, h + (Math.random() - 0.5) * 2)).toFixed(1));
    const label = new Date(Date.now() - i * 60000).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    rows.push({ time: label, temp: t, hum: h });
  }
  return rows;
}

interface ZoneState {
  zone: SensorZone;
  history: { time: string; temp: number; hum: number }[];
  currentTemp: number;
  currentHum: number;
  breach: boolean;
}

function IoTSensorsPage() {
  const [zones, setZones] = useState<ZoneState[]>(() =>
    ZONES.map(z => {
      const history = generateHistory(z);
      const last = history[history.length - 1]!;
      const breach = last.temp < z.minTemp || last.temp > z.maxTemp;
      return { zone: z, history, currentTemp: last.temp, currentHum: last.hum, breach };
    })
  );
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState("z1");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = () => {
    setZones(prev => prev.map(zs => {
      const last = zs.history[zs.history.length - 1]!;
      const drift = (Math.random() - 0.5) * 0.5;
      const newTemp = parseFloat(Math.max(zs.zone.minTemp - 4, Math.min(zs.zone.maxTemp + 4, last.temp + drift)).toFixed(1));
      const newHum = parseFloat(Math.max(zs.zone.minHum - 15, Math.min(zs.zone.maxHum + 15, last.hum + (Math.random() - 0.5) * 1.5)).toFixed(1));
      const breach = newTemp < zs.zone.minTemp || newTemp > zs.zone.maxTemp;
      if (breach && !zs.breach) toast.error(`⚠️ Temp breach: ${zs.zone.name} — ${newTemp}°C`, { duration: 5000 });
      const newRow = { time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }), temp: newTemp, hum: newHum };
      const history = [...zs.history.slice(-24), newRow];
      return { ...zs, history, currentTemp: newTemp, currentHum: newHum, breach };
    }));
  };

  useEffect(() => {
    if (live) { intervalRef.current = setInterval(tick, 3000); }
    else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [live]);

  const activeZone = zones.find(z => z.zone.id === selected)!;
  const breachCount = zones.filter(z => z.breach).length;

  return (
    <DashboardLayout title="IoT Sensor Live Feed" subtitle="Real-time cold chain temperature & humidity per storage zone">
      {/* Top status */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border", live ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-muted text-muted-foreground border-border")}>
            {live ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
            {live ? "Live Feed Active" : "Feed Paused"}
          </div>
          {breachCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
              <AlertTriangle className="size-3" />
              {breachCount} breach{breachCount > 1 ? "es" : ""} detected
            </div>
          )}
        </div>
        <button type="button" onClick={() => setLive(v => !v)}
          className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors", live ? "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" : "border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30")}>
          {live ? <><WifiOff className="size-3.5" /> Pause Feed</> : <><RefreshCw className="size-3.5" /> Resume Live Feed</>}
        </button>
      </div>

      {/* Zone cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {zones.map(zs => (
          <button key={zs.zone.id} type="button" onClick={() => setSelected(zs.zone.id)}
            className={cn("rounded-xl border p-4 text-left transition-all", selected === zs.zone.id ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border bg-card hover:shadow-md", zs.breach && "border-red-400/60 bg-red-500/5")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{zs.zone.type}</p>
                <p className="mt-0.5 font-bold text-sm text-foreground">{zs.zone.name}</p>
              </div>
              <div className={cn("flex size-2.5 rounded-full", zs.breach ? "bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.4)]")} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className={cn("rounded-lg px-2 py-1.5", zs.breach ? "bg-red-500/10" : "bg-muted/60")}>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5"><Thermometer className="size-3" />Temp</div>
                <p className={cn("text-sm font-bold", zs.breach ? "text-red-600 dark:text-red-400" : "text-foreground")}>{zs.currentTemp}°C</p>
              </div>
              <div className="rounded-lg bg-muted/60 px-2 py-1.5">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5"><Droplets className="size-3" />Hum</div>
                <p className="text-sm font-bold text-foreground">{zs.currentHum}%</p>
              </div>
            </div>
            {zs.breach ? (
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400"><AlertTriangle className="size-3" />Threshold breach!</p>
            ) : (
              <p className="mt-2 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-3" />Within safe zone</p>
            )}
          </button>
        ))}
      </div>

      {/* Detail charts */}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title={`${activeZone.zone.name} — Temperature`} description={`Safe zone: ${activeZone.zone.minTemp}°C – ${activeZone.zone.maxTemp}°C`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeZone.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize:9 }} stroke="var(--muted-foreground)" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize:10 }} stroke="var(--muted-foreground)" domain={[activeZone.zone.minTemp - 5, activeZone.zone.maxTemp + 5]} />
                <Tooltip contentStyle={{ borderRadius:10, border:"1px solid var(--border)", background:"var(--card)", fontSize:11 }} />
                <ReferenceLine y={activeZone.zone.maxTemp} stroke="#ef4444" strokeDasharray="4 2" label={{ value:"Max", fill:"#ef4444", fontSize:9 }} />
                <ReferenceLine y={activeZone.zone.minTemp} stroke="#3b82f6" strokeDasharray="4 2" label={{ value:"Min", fill:"#3b82f6", fontSize:9 }} />
                <Line type="monotone" dataKey="temp" name="Temperature °C" stroke={activeZone.zone.color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={`${activeZone.zone.name} — Humidity`} description={`Safe zone: ${activeZone.zone.minHum}% – ${activeZone.zone.maxHum}%`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeZone.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize:9 }} stroke="var(--muted-foreground)" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize:10 }} stroke="var(--muted-foreground)" domain={[activeZone.zone.minHum - 20, activeZone.zone.maxHum + 20]} />
                <Tooltip contentStyle={{ borderRadius:10, border:"1px solid var(--border)", background:"var(--card)", fontSize:11 }} />
                <ReferenceLine y={activeZone.zone.maxHum} stroke="#ef4444" strokeDasharray="4 2" label={{ value:"Max", fill:"#ef4444", fontSize:9 }} />
                <ReferenceLine y={activeZone.zone.minHum} stroke="#3b82f6" strokeDasharray="4 2" label={{ value:"Min", fill:"#3b82f6", fontSize:9 }} />
                <Line type="monotone" dataKey="hum" name="Humidity %" stroke="#14b8a6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* All zones summary table */}
      <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border px-5 py-3 flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">All Zones — Current Readings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-5 py-2.5 font-semibold">Zone</th>
                <th className="px-5 py-2.5 font-semibold">Type</th>
                <th className="px-5 py-2.5 font-semibold">Temp</th>
                <th className="px-5 py-2.5 font-semibold">Safe Range</th>
                <th className="px-5 py-2.5 font-semibold">Humidity</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zs => (
                <tr key={zs.zone.id} className={cn("border-t border-border transition-colors cursor-pointer hover:bg-accent/30", zs.breach && "bg-red-500/5")}>
                  <td className="px-5 py-3 font-semibold text-foreground" onClick={() => setSelected(zs.zone.id)}>{zs.zone.name}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{zs.zone.type}</td>
                  <td className={cn("px-5 py-3 font-bold", zs.breach ? "text-red-600 dark:text-red-400" : "text-foreground")}>{zs.currentTemp}°C</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{zs.zone.minTemp}°C – {zs.zone.maxTemp}°C</td>
                  <td className="px-5 py-3 text-foreground">{zs.currentHum}%</td>
                  <td className="px-5 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", zs.breach ? "bg-red-500/15 text-red-700 dark:text-red-400" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400")}>
                      {zs.breach ? <><AlertTriangle className="size-3" />Breach</> : <><CheckCircle2 className="size-3" />Normal</>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
