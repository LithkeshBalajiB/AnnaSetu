import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, FileText, Search } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, TableShell, Th, Td } from "@/components/dashboard-ui";
import {
  useAlerts,
  formatTime,
  HISTORY_KIND_LABEL,
  type HistoryKind,
} from "@/components/alerts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alert-history")({
  head: () => ({
    meta: [
      { title: "Alert History — AnnaSetu" },
      {
        name: "description",
        content:
          "Full log of threshold breaches, notifications, acknowledgements and snoozes, with CSV and PDF export.",
      },
      { property: "og:title", content: "Alert History — AnnaSetu" },
      {
        property: "og:description",
        content: "Every quality alert event with readings, notes and delivery details.",
      },
    ],
  }),
  component: AlertHistoryPage,
});

const KINDS: (HistoryKind | "all")[] = [
  "all",
  "breach",
  "notification",
  "acknowledged",
  "snoozed",
  "dismissed",
];

const COLUMNS = [
  "Timestamp",
  "Event",
  "Item",
  "Location",
  "Severity",
  "Reading",
  "Threshold",
  "Status",
  "Recipient / delivery",
  "Acknowledgement note",
  "Snooze",
];

function AlertHistoryPage() {
  const { history } = useAlerts();
  const [kind, setKind] = useState<HistoryKind | "all">("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      history.filter(
        (h) =>
          (kind === "all" || h.kind === kind) &&
          (query.trim() === "" ||
            `${h.item} ${h.location} ${h.note} ${h.status}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())),
      ),
    [history, kind, query],
  );

  const toRow = (h: (typeof rows)[number]) => [
    formatTime(h.at),
    HISTORY_KIND_LABEL[h.kind],
    h.item,
    h.location,
    h.severity,
    h.reading,
    h.threshold,
    h.status,
    h.delivery,
    h.note,
    h.snoozeDetail,
  ];

  const exportCsv = () => {
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [COLUMNS, ...rows.map(toRow)]
      .map((r) => r.map(esc).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} rows to CSV`);
  };

  const exportPdf = () => {
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) {
      toast.error("Allow pop-ups to export the PDF");
      return;
    }
    const head = COLUMNS.map((c) => `<th>${c}</th>`).join("");
    const body = rows
      .map(
        (h) =>
          `<tr>${toRow(h)
            .map((v) => `<td>${String(v).replace(/[<>&]/g, "") || "—"}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    win.document.write(`<!doctype html><html><head><title>Alert History — AnnaSetu</title>
      <style>
        body{font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;color:#0f172a}
        h1{font-size:20px;margin:0 0 4px}
        p.meta{font-size:12px;color:#64748b;margin:0 0 16px}
        table{width:100%;border-collapse:collapse;font-size:10px}
        th,td{border:1px solid #cbd5e1;padding:5px 6px;text-align:left;vertical-align:top}
        th{background:#ecfdf5}
        footer{margin-top:16px;font-size:10px;color:#64748b}
      </style></head><body>
      <h1>Alert History — AnnaSetu</h1>
      <p class="meta">Generated ${formatTime(Date.now())} · ${rows.length} events${kind === "all" ? "" : ` · filter: ${HISTORY_KIND_LABEL[kind as HistoryKind]}`}</p>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      <footer>Demonstration data. Save as PDF from the print dialog.</footer>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const counts = (k: HistoryKind) => history.filter((h) => h.kind === k).length;

  return (
    <DashboardLayout
      title="Alert History"
      subtitle="Every threshold breach, notification, acknowledgement and snooze"
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Breaches logged", counts("breach")],
            ["Notifications sent", counts("notification")],
            ["Acknowledged", counts("acknowledged")],
            ["Snoozed", counts("snoozed")],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <Card
        title="Event log"
        description={`${rows.length} of ${history.length} events shown`}
        action={
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              <Download className="size-3.5" /> CSV
            </button>
            <button
              onClick={exportPdf}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <FileText className="size-3.5" /> PDF
            </button>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 60))}
              placeholder="Search item, location or note"
              className="h-9 w-64 rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {KINDS.map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  kind === k
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {k === "all" ? "All events" : HISTORY_KIND_LABEL[k]}
              </button>
            ))}
          </div>
        </div>

        <TableShell minWidth="72rem">
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <Th key={c}>{c}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.id} className="border-t border-border">
                <Td>{formatTime(h.at)}</Td>
                <Td>{HISTORY_KIND_LABEL[h.kind]}</Td>
                <Td>{h.item}</Td>
                <Td>{h.location}</Td>
                <Td>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      h.severity === "critical"
                        ? "bg-danger/15 text-danger"
                        : "bg-warning/25 text-warning-foreground",
                    )}
                  >
                    {h.severity}
                  </span>
                </Td>
                <Td>{h.reading}</Td>
                <Td>{h.threshold}</Td>
                <Td>{h.status}</Td>
                <Td>{h.delivery}</Td>
                <Td>{h.note || "—"}</Td>
                <Td>{h.snoozeDetail || "—"}</Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <Td colSpan={COLUMNS.length}>
                  <span className="text-muted-foreground">No events match this filter.</span>
                </Td>
              </tr>
            )}
          </tbody>
        </TableShell>
        <p className="mt-3 text-xs text-muted-foreground">
          Exports run entirely in your browser on the rows shown above. Data is simulated for
          demonstration.
        </p>
      </Card>
    </DashboardLayout>
  );
}
