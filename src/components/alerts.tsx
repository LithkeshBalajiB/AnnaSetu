import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useViewMode } from "@/components/view-mode";
import type { FlaggedItem } from "@/lib/mock-data";

export interface AlertSettings {
  maxTemperatureC: number;
  minTemperatureC: number;
  maxHumidity: number;
  freshnessLevel: "near-expiry" | "critical";
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  channels: { inApp: boolean; email: boolean; sms: boolean };
}

export const DEFAULT_SETTINGS: AlertSettings = {
  maxTemperatureC: 8,
  minTemperatureC: -22,
  maxHumidity: 70,
  freshnessLevel: "near-expiry",
  recipientName: "Kitchen Operations Lead",
  recipientEmail: "ops@campuskitchen.example",
  recipientPhone: "+91 90000 00000",
  channels: { inApp: true, email: false, sms: false },
};

export type SnoozeKey = "30m" | "2h" | "shift";

export const SNOOZE_OPTIONS: { key: SnoozeKey; label: string; minutes: number }[] = [
  { key: "30m", label: "30 minutes", minutes: 30 },
  { key: "2h", label: "2 hours", minutes: 120 },
  { key: "shift", label: "Until next shift", minutes: 8 * 60 },
];

export interface Acknowledgement {
  note: string;
  at: number;
  by: string;
}

export interface Snooze {
  until: number;
  label: string;
  at: number;
}

export interface Notification {
  id: string;
  title: string;
  detail: string;
  reading: string;
  severity: "warning" | "critical";
  item: string;
  location: string;
  time: string;
  ack?: Acknowledgement | undefined;
  snooze?: Snooze | undefined;
  snoozed: boolean;
}

export type HistoryKind =
  | "breach"
  | "notification"
  | "acknowledged"
  | "snoozed"
  | "dismissed";

export interface HistoryEvent {
  id: string;
  alertId: string;
  at: number;
  kind: HistoryKind;
  item: string;
  location: string;
  severity: "warning" | "critical";
  reading: string;
  threshold: string;
  status: string;
  delivery: string;
  note: string;
  snoozeDetail: string;
}

interface Ctx {
  settings: AlertSettings;
  setSettings: (s: AlertSettings) => void;
  notifications: Notification[];
  activeCount: number;
  unread: number;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  acknowledge: (id: string, note: string) => void;
  snooze: (id: string, key: SnoozeKey) => void;
  unsnooze: (id: string) => void;
  history: HistoryEvent[];
}

const AlertsContext = createContext<Ctx | null>(null);

const TIMES = ["2 min ago", "14 min ago", "38 min ago", "1 h ago", "2 h ago", "3 h ago"];
const OFFSETS = [2, 14, 38, 60, 120, 180];

type Raw = Omit<Notification, "snoozed"> & { threshold: string; ageMinutes: number };

function evaluate(items: FlaggedItem[], s: AlertSettings): Raw[] {
  const out: Raw[] = [];
  items.forEach((it, i) => {
    const time = TIMES[i % TIMES.length] ?? "just now";
    const ageMinutes = OFFSETS[i % OFFSETS.length] ?? 5;
    const base = { item: it.name, location: it.location, time, ageMinutes };
    const isFrozen = it.temperatureC < 0;
    const isHot = it.temperatureC > 50;
    if (!isFrozen && !isHot && it.temperatureC > s.maxTemperatureC) {
      out.push({
        ...base,
        id: `${it.id}-temp`,
        title: "Temperature above threshold",
        detail: `${it.temperatureC}°C recorded (limit ${s.maxTemperatureC}°C)`,
        reading: `${it.temperatureC} °C`,
        threshold: `max ${s.maxTemperatureC} °C`,
        severity: it.temperatureC > s.maxTemperatureC + 5 ? "critical" : "warning",
      });
    }
    if (isFrozen && it.temperatureC > s.minTemperatureC) {
      out.push({
        ...base,
        id: `${it.id}-frozen`,
        title: "Freezer drifting warm",
        detail: `${it.temperatureC}°C recorded (limit ${s.minTemperatureC}°C)`,
        reading: `${it.temperatureC} °C`,
        threshold: `max ${s.minTemperatureC} °C`,
        severity: "warning",
      });
    }
    if (it.humidity > s.maxHumidity) {
      out.push({
        ...base,
        id: `${it.id}-hum`,
        title: "Humidity above threshold",
        detail: `${it.humidity}% recorded (limit ${s.maxHumidity}%)`,
        reading: `${it.humidity} % RH`,
        threshold: `max ${s.maxHumidity} % RH`,
        severity: "warning",
      });
    }
    const breach =
      s.freshnessLevel === "critical" ? it.risk === "critical" : it.risk !== "fresh";
    if (breach) {
      out.push({
        ...base,
        id: `${it.id}-fresh`,
        title: it.risk === "critical" ? "Item flagged spoiled" : "Item nearing expiry",
        detail:
          it.risk === "critical"
            ? `${it.quantityKg} kg must be diverted or discarded now`
            : `${it.quantityKg} kg should be redistributed today`,
        reading: it.risk === "critical" ? "Spoiled" : "Nearing expiry",
        threshold:
          s.freshnessLevel === "critical" ? "spoiled only" : "nearing expiry or worse",
        severity: it.risk === "critical" ? "critical" : "warning",
      });
    }
  });
  return out;
}

/** Seeded, realistic history from earlier shifts so the log is never empty. */
function seedHistory(recipient: AlertSettings): HistoryEvent[] {
  const now = Date.now();
  const h = (n: number) => now - n * 3600_000;
  const rows: Omit<HistoryEvent, "id">[] = [
    {
      alertId: "cold-room-2-temp",
      at: h(26),
      kind: "breach",
      item: "Chicken Curry (bulk tray)",
      location: "Cold Room 2",
      severity: "critical",
      reading: "11.8 °C",
      threshold: "max 8 °C",
      status: "Open",
      delivery: "—",
      note: "",
      snoozeDetail: "",
    },
    {
      alertId: "cold-room-2-temp",
      at: h(26) + 60_000,
      kind: "notification",
      item: "Chicken Curry (bulk tray)",
      location: "Cold Room 2",
      severity: "critical",
      reading: "11.8 °C",
      threshold: "max 8 °C",
      status: "Notified",
      delivery: `In-app · ${recipient.recipientName}`,
      note: "",
      snoozeDetail: "",
    },
    {
      alertId: "cold-room-2-temp",
      at: h(25),
      kind: "acknowledged",
      item: "Chicken Curry (bulk tray)",
      location: "Cold Room 2",
      severity: "critical",
      reading: "11.8 °C",
      threshold: "max 8 °C",
      status: "Acknowledged",
      delivery: `In-app · ${recipient.recipientName}`,
      note: "Compressor reset, tray moved to Cold Room 1. Batch retained.",
      snoozeDetail: "",
    },
    {
      alertId: "dry-store-1-hum",
      at: h(19),
      kind: "breach",
      item: "Wheat Flour 25 kg sacks",
      location: "Dry Store 1",
      severity: "warning",
      reading: "78 % RH",
      threshold: "max 70 % RH",
      status: "Open",
      delivery: "—",
      note: "",
      snoozeDetail: "",
    },
    {
      alertId: "dry-store-1-hum",
      at: h(18),
      kind: "snoozed",
      item: "Wheat Flour 25 kg sacks",
      location: "Dry Store 1",
      severity: "warning",
      reading: "78 % RH",
      threshold: "max 70 % RH",
      status: "Snoozed",
      delivery: `In-app · ${recipient.recipientName}`,
      note: "Dehumidifier already running.",
      snoozeDetail: "2 hours (expired)",
    },
    {
      alertId: "dry-store-1-hum",
      at: h(16),
      kind: "acknowledged",
      item: "Wheat Flour 25 kg sacks",
      location: "Dry Store 1",
      severity: "warning",
      reading: "72 % RH",
      threshold: "max 70 % RH",
      status: "Acknowledged",
      delivery: `In-app · ${recipient.recipientName}`,
      note: "Humidity back within range after 2 h; sacks re-stacked off the floor.",
      snoozeDetail: "",
    },
    {
      alertId: "freezer-a-frozen",
      at: h(11),
      kind: "breach",
      item: "Frozen Green Peas",
      location: "Freezer A",
      severity: "warning",
      reading: "-19.5 °C",
      threshold: "max -22 °C",
      status: "Open",
      delivery: "—",
      note: "",
      snoozeDetail: "",
    },
    {
      alertId: "freezer-a-frozen",
      at: h(11) + 90_000,
      kind: "notification",
      item: "Frozen Green Peas",
      location: "Freezer A",
      severity: "warning",
      reading: "-19.5 °C",
      threshold: "max -22 °C",
      status: "Notified",
      delivery: `In-app · ${recipient.recipientName}`,
      note: "",
      snoozeDetail: "",
    },
    {
      alertId: "freezer-a-frozen",
      at: h(10),
      kind: "dismissed",
      item: "Frozen Green Peas",
      location: "Freezer A",
      severity: "warning",
      reading: "-22.4 °C",
      threshold: "max -22 °C",
      status: "Resolved",
      delivery: `In-app · ${recipient.recipientName}`,
      note: "Door left ajar during stock count; temperature recovered.",
      snoozeDetail: "",
    },
    {
      alertId: "prep-line-3-fresh",
      at: h(6),
      kind: "breach",
      item: "Mixed Green Salad",
      location: "Prep Line 3",
      severity: "warning",
      reading: "Nearing expiry",
      threshold: "nearing expiry or worse",
      status: "Open",
      delivery: "—",
      note: "",
      snoozeDetail: "",
    },
    {
      alertId: "prep-line-3-fresh",
      at: h(5),
      kind: "acknowledged",
      item: "Mixed Green Salad",
      location: "Prep Line 3",
      severity: "warning",
      reading: "Nearing expiry",
      threshold: "nearing expiry or worse",
      status: "Acknowledged",
      delivery: `In-app · ${recipient.recipientName}`,
      note: "18 kg offered to Annapurna Trust, pickup booked for 17:30.",
      snoozeDetail: "",
    },
  ];
  return rows.map((r, i) => ({ ...r, id: `seed-${i}` }));
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const HISTORY_KIND_LABEL: Record<HistoryKind, string> = {
  breach: "Threshold breach",
  notification: "Notification sent",
  acknowledged: "Acknowledged",
  snoozed: "Snoozed",
  dismissed: "Resolved / dismissed",
};

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { data, mode } = useViewMode();
  const [settings, setSettings] = useState<AlertSettings>(DEFAULT_SETTINGS);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [acks, setAcks] = useState<Record<string, Acknowledgement>>({});
  const [snoozes, setSnoozes] = useState<Record<string, Snooze>>({});
  const [readCount, setReadCount] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [history, setHistory] = useState<HistoryEvent[]>(() => seedHistory(DEFAULT_SETTINGS));
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const raw = useMemo(() => evaluate(data.flagged, settings), [data, settings]);

  const notifications = useMemo<Notification[]>(
    () =>
      raw
        .filter((n) => !dismissed.includes(n.id))
        .map(({ threshold: _t, ageMinutes: _a, ...n }) => {
          const sn = snoozes[n.id];
          return {
            ...n,
            ack: acks[n.id],
            snooze: sn,
            snoozed: !!sn && sn.until > now,
          };
        }),
    [raw, dismissed, acks, snoozes, now],
  );

  const addEvent = useCallback(
    (n: { id: string; item: string; location: string; severity: "warning" | "critical"; reading: string }, kind: HistoryKind, extra: Partial<HistoryEvent> = {}) => {
      setHistory((h) => [
        {
          id: `${n.id}-${kind}-${Date.now()}`,
          alertId: n.id,
          at: Date.now(),
          kind,
          item: n.item,
          location: n.location,
          severity: n.severity,
          reading: n.reading,
          threshold: raw.find((r) => r.id === n.id)?.threshold ?? "—",
          status: HISTORY_KIND_LABEL[kind],
          delivery: settings.channels.inApp
            ? `In-app · ${settings.recipientName}`
            : "No channel enabled",
          note: "",
          snoozeDetail: "",
          ...extra,
        },
        ...h,
      ]);
    },
    [raw, settings],
  );

  // Log new breaches + notification delivery events, and toast them.
  useEffect(() => {
    const live = raw.filter((n) => !dismissed.includes(n.id));
    if (seen.current === null) {
      seen.current = new Set(live.map((n) => n.id));
      setHistory((h) => {
        const extra: HistoryEvent[] = live.map((n) => ({
          id: `open-${n.id}`,
          alertId: n.id,
          at: Date.now() - n.ageMinutes * 60_000,
          kind: "breach",
          item: n.item,
          location: n.location,
          severity: n.severity,
          reading: n.reading,
          threshold: n.threshold,
          status: "Open",
          delivery: settings.channels.inApp ? `In-app · ${settings.recipientName}` : "—",
          note: "",
          snoozeDetail: "",
        }));
        return [...extra, ...h].sort((a, b) => b.at - a.at);
      });
      return;
    }
    const fresh = live.filter((n) => !seen.current!.has(n.id));
    fresh.forEach((n) => {
      addEvent(n, "breach", { status: "Open", delivery: "—", threshold: n.threshold });
      if (settings.channels.inApp) {
        addEvent(n, "notification", { threshold: n.threshold });
      }
    });
    if (settings.channels.inApp) {
      fresh.slice(0, 3).forEach((n) => {
        const msg = `${n.item} — ${n.title}`;
        if (n.severity === "critical") toast.error(msg, { description: n.detail });
        else toast.warning(msg, { description: n.detail });
      });
    }
    live.forEach((n) => seen.current!.add(n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, dismissed, settings.channels.inApp]);

  useEffect(() => {
    seen.current = null;
    setReadCount(0);
  }, [mode]);

  const activeCount = notifications.filter((n) => !n.snoozed && !n.ack).length;

  const acknowledge = (id: string, note: string) => {
    const n = notifications.find((x) => x.id === id);
    if (!n) return;
    const ack: Acknowledgement = { note, at: Date.now(), by: settings.recipientName };
    setAcks((a) => ({ ...a, [id]: ack }));
    setSnoozes(({ [id]: _drop, ...rest }) => rest);
    addEvent(n, "acknowledged", { status: "Acknowledged", note: note || "(no note added)" });
    toast.success(`Marked as handled — ${n.item}`, {
      description: note ? note : "Logged to alert history without a note.",
    });
  };

  const snooze = (id: string, key: SnoozeKey) => {
    const n = notifications.find((x) => x.id === id);
    const opt = SNOOZE_OPTIONS.find((o) => o.key === key);
    if (!n || !opt) return;
    const until = Date.now() + opt.minutes * 60_000;
    setSnoozes((s) => ({ ...s, [id]: { until, label: opt.label, at: Date.now() } }));
    addEvent(n, "snoozed", {
      status: "Snoozed",
      snoozeDetail: `${opt.label} · until ${formatTime(until)}`,
    });
    toast(`Snoozed for ${opt.label.toLowerCase()} — ${n.item}`, {
      description: `Silenced until ${formatTime(until)}.`,
    });
  };

  const unsnooze = (id: string) => setSnoozes(({ [id]: _drop, ...rest }) => rest);

  const dismiss = (id: string) => {
    const n = notifications.find((x) => x.id === id);
    setDismissed((d) => [...d, id]);
    if (n) addEvent(n, "dismissed", { status: "Resolved", note: n.ack?.note ?? "" });
  };

  return (
    <AlertsContext.Provider
      value={{
        settings,
        setSettings,
        notifications,
        activeCount,
        unread: Math.max(activeCount - readCount, 0),
        markAllRead: () => setReadCount(activeCount),
        dismiss,
        acknowledge,
        snooze,
        unsnooze,
        history: [...history].sort((a, b) => b.at - a.at),
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used inside AlertsProvider");
  return ctx;
}
