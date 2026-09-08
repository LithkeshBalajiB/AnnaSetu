import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Info, Save, AlertTriangle, RotateCcw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/dashboard-ui";
import { useAlerts, DEFAULT_SETTINGS, type AlertSettings } from "@/components/alerts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alert-settings")({
  head: () => ({
    meta: [
      { title: "Alert Settings — AnnaSetu" },
      {
        name: "description",
        content:
          "Configure temperature, humidity and freshness thresholds, notification channels and the recipient for quality alerts.",
      },
      { property: "og:title", content: "Alert Settings — AnnaSetu" },
      {
        property: "og:description",
        content: "Set the thresholds that trigger quality alerts and choose who is notified.",
      },
    ],
  }),
  component: AlertSettingsPage,
});

function AlertSettingsPage() {
  const { settings, setSettings, notifications } = useAlerts();
  const [draft, setDraft] = useState<AlertSettings>(settings);

  const set = <K extends keyof AlertSettings>(k: K, v: AlertSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    setSettings(draft);
    toast.success("Alert settings saved", {
      description: "Thresholds re-evaluated against current sensor readings.",
    });
  };

  return (
    <DashboardLayout
      title="Alert Settings"
      subtitle="Thresholds, notification preferences and recipient"
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Quality thresholds"
          description="An alert is raised the moment a reading crosses these limits"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Max chilled temperature (°C)"
              hint="Applies to chillers and cold rooms"
              value={draft.maxTemperatureC}
              onChange={(v) => set("maxTemperatureC", v)}
              min={0}
              max={20}
              step={0.5}
            />
            <Field
              label="Max freezer temperature (°C)"
              hint="Freezer units must stay below this"
              value={draft.minTemperatureC}
              onChange={(v) => set("minTemperatureC", v)}
              min={-30}
              max={-5}
              step={0.5}
            />
            <Field
              label="Max relative humidity (%)"
              hint="High humidity accelerates spoilage"
              value={draft.maxHumidity}
              onChange={(v) => set("maxHumidity", v)}
              min={30}
              max={95}
              step={1}
            />
            <div>
              <p className="text-sm font-medium">Freshness alert level</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Which freshness status should raise an alert
              </p>
              <div className="mt-2 flex rounded-lg bg-muted p-1">
                {(
                  [
                    ["near-expiry", "Nearing expiry and worse"],
                    ["critical", "Spoiled only"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => set("freshnessLevel", v)}
                    className={cn(
                      "flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors",
                      draft.freshnessLevel === v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <h3 className="mt-6 text-sm font-semibold">Recipient</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <TextField
              label="Contact name"
              value={draft.recipientName}
              onChange={(v) => set("recipientName", v.slice(0, 100))}
            />
            <TextField
              label="Email address"
              type="email"
              value={draft.recipientEmail}
              onChange={(v) => set("recipientEmail", v.slice(0, 255))}
            />
            <TextField
              label="Mobile number"
              value={draft.recipientPhone}
              onChange={(v) => set("recipientPhone", v.slice(0, 20))}
            />
          </div>

          <h3 className="mt-6 text-sm font-semibold">Notification preference</h3>
          <div className="mt-3 space-y-2">
            <Toggle
              label="In-app notifications"
              hint="Bell badge and pop-up toast — active in this demo"
              checked={draft.channels.inApp}
              onChange={(v) => set("channels", { ...draft.channels, inApp: v })}
            />
            <Toggle
              label="Email alerts"
              hint="Requires backend setup before messages can be sent"
              checked={draft.channels.email}
              onChange={(v) => set("channels", { ...draft.channels, email: v })}
            />
            <Toggle
              label="SMS alerts"
              hint="Requires backend setup and an SMS provider account"
              checked={draft.channels.sms}
              onChange={(v) => set("channels", { ...draft.channels, sms: v })}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={save}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-4" /> Save settings
            </button>
            <button
              onClick={() => {
                setDraft(DEFAULT_SETTINGS);
                setSettings(DEFAULT_SETTINGS);
                toast("Thresholds reset to defaults");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              <RotateCcw className="size-4" /> Reset
            </button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Currently breaching" description="Live against your saved thresholds">
            <p className="text-3xl font-semibold tracking-tight">{notifications.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              active alerts · {notifications.filter((n) => n.severity === "critical").length}{" "}
              critical
            </p>
            <ul className="mt-4 space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="flex items-start gap-2 text-sm">
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      n.severity === "critical" ? "text-danger" : "text-warning",
                    )}
                  />
                  <span>
                    <span className="font-medium">{n.item}</span> — {n.detail}
                  </span>
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="text-sm text-muted-foreground">Everything within limits.</li>
              )}
            </ul>
          </Card>

          <div className="rounded-xl border border-warning/50 bg-warning/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Info className="size-4" /> Email and SMS are not connected yet
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              This demo raises alerts inside the app only. To actually deliver email or SMS,
              the app needs a backend with a verified sending domain (for email) and an SMS
              provider account — plus your confirmation of the sender address and number.
              Until that is set up, saved email and SMS preferences are stored as intent and
              no live messages are sent.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 accent-primary"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) onChange(Math.min(Math.max(n, min), max));
          }}
          className="h-9 w-20 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}
