import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ScanLine,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle2,
  Sparkles,
  Scale,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, TableShell, Th, Td } from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/scan-history")({
  head: () => ({
    meta: [
      { title: "Scan History & Analytics — AnnaSetu" },
      {
        name: "description",
        content:
          "Complete log of AI Vision Scanner results with grade analytics and freshness trends.",
      },
    ],
  }),
  component: ScanHistoryPage,
});

type Grade =
  | "Grade A (Optimal)"
  | "Grade B (Safe - Urgent)"
  | "Grade C (Sub-Standard)"
  | "Grade D (Spoiled / Unsafe)";
type SuggestedAction =
  | "Immediate Kitchen Use"
  | "Redistribute to NGO"
  | "Secondary Discount Sale"
  | "Composting / Animal Feed";

interface StoredScan {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  freshnessScore: number;
  grade: Grade;
  shelfLifeRemaining: string;
  suggestedAction: SuggestedAction;
  estimatedSurplusKg: number;
  engine: "gemini" | "canvas-fallback";
  scannedAt: number;
  aiRecommendation: string;
}

const DEMO_SCANS: StoredScan[] = [
  {
    id: "h1",
    title: "Organic Red Vine Tomatoes (Crate #4)",
    category: "Produce",
    imageUrl:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=60",
    freshnessScore: 94,
    grade: "Grade A (Optimal)",
    shelfLifeRemaining: "5-7 Days",
    suggestedAction: "Immediate Kitchen Use",
    estimatedSurplusKg: 35,
    engine: "gemini",
    scannedAt: Date.now() - 600000,
    aiRecommendation:
      "High firmness index and optimal lycopene saturation. Suitable for cold room storage.",
  },
  {
    id: "h2",
    title: "Overripe Cavendish Bananas (Lot #B88)",
    category: "Produce",
    imageUrl:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=200&q=60",
    freshnessScore: 62,
    grade: "Grade B (Safe - Urgent)",
    shelfLifeRemaining: "12-18 Hours",
    suggestedAction: "Redistribute to NGO",
    estimatedSurplusKg: 28,
    engine: "gemini",
    scannedAt: Date.now() - 2700000,
    aiRecommendation:
      "High ethylene conversion. Internal pulp remains safe but peel integrity will deteriorate within 24h.",
  },
  {
    id: "h3",
    title: "Artisan Whole Grain Bread (Batch #L12)",
    category: "Bakery",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=60",
    freshnessScore: 18,
    grade: "Grade D (Spoiled / Unsafe)",
    shelfLifeRemaining: "0 Hours (Expired)",
    suggestedAction: "Composting / Animal Feed",
    estimatedSurplusKg: 16,
    engine: "gemini",
    scannedAt: Date.now() - 5400000,
    aiRecommendation:
      "Microbial fungal growth detected. Unsafe for human consumption. Divert to composting.",
  },
  {
    id: "h4",
    title: "Cooked Basmati Rice & Dal (Tray #3)",
    category: "Cooked Meal",
    imageUrl:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=60",
    freshnessScore: 86,
    grade: "Grade A (Optimal)",
    shelfLifeRemaining: "4.5 Hours (Hot Hold)",
    suggestedAction: "Redistribute to NGO",
    estimatedSurplusKg: 24,
    engine: "gemini",
    scannedAt: Date.now() - 7200000,
    aiRecommendation:
      "Hot-hold temperature stability detected. Ready for immediate thermal dispatch to NGOs.",
  },
  {
    id: "h5",
    title: "Shimla Crisp Apples (Lot #AP-09)",
    category: "Produce",
    imageUrl:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=60",
    freshnessScore: 54,
    grade: "Grade B (Safe - Urgent)",
    shelfLifeRemaining: "3 Days",
    suggestedAction: "Secondary Discount Sale",
    estimatedSurplusKg: 45,
    engine: "gemini",
    scannedAt: Date.now() - 10800000,
    aiRecommendation:
      "Superficial cosmetic bruising. Fleshy tissue remains edible and nutrient-dense.",
  },
  {
    id: "h6",
    title: "Fresh Spinach Leaves (Bundle #S22)",
    category: "Produce",
    imageUrl:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=60",
    freshnessScore: 88,
    grade: "Grade A (Optimal)",
    shelfLifeRemaining: "3-4 Days",
    suggestedAction: "Immediate Kitchen Use",
    estimatedSurplusKg: 12,
    engine: "canvas-fallback",
    scannedAt: Date.now() - 14400000,
    aiRecommendation:
      "Vivid colour uniformity detected. No visual defects.",
  },
  {
    id: "h7",
    title: "Paneer Tikka Marinade Batch",
    category: "Dairy",
    imageUrl:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=60",
    freshnessScore: 72,
    grade: "Grade A (Optimal)",
    shelfLifeRemaining: "24 Hours",
    suggestedAction: "Immediate Kitchen Use",
    estimatedSurplusKg: 8,
    engine: "gemini",
    scannedAt: Date.now() - 18000000,
    aiRecommendation:
      "Fresh paneer with appropriate marination. Safe for immediate use.",
  },
  {
    id: "h8",
    title: "Stale Idli Batter (Drum #IB-5)",
    category: "Cooked Meal",
    imageUrl:
      "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=200&q=60",
    freshnessScore: 28,
    grade: "Grade C (Sub-Standard)",
    shelfLifeRemaining: "1-2 Hours",
    suggestedAction: "Secondary Discount Sale",
    estimatedSurplusKg: 20,
    engine: "canvas-fallback",
    scannedAt: Date.now() - 21600000,
    aiRecommendation:
      "Elevated sourness from over-fermentation. Can still be used for dosas but not idlis.",
  },
];

function loadScans(): StoredScan[] {
  if (typeof window === "undefined") return DEMO_SCANS;
  try {
    const raw = localStorage.getItem("annasetu_scan_history");
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p) && p.length > 0) return p;
    }
  } catch {}
  return DEMO_SCANS;
}

const GRADE_COLOR: Record<Grade, string> = {
  "Grade A (Optimal)": "#10b981",
  "Grade B (Safe - Urgent)": "#f59e0b",
  "Grade C (Sub-Standard)": "#f97316",
  "Grade D (Spoiled / Unsafe)": "#ef4444",
};

const GRADE_BG: Record<Grade, string> = {
  "Grade A (Optimal)": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "Grade B (Safe - Urgent)": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "Grade C (Sub-Standard)": "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  "Grade D (Spoiled / Unsafe)": "bg-red-500/15 text-red-700 dark:text-red-300",
};

const ACTION_BG: Record<SuggestedAction, string> = {
  "Immediate Kitchen Use": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Redistribute to NGO": "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  "Secondary Discount Sale": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "Composting / Animal Feed": "bg-red-500/10 text-red-700 dark:text-red-400",
};

function formatAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ScanHistoryPage() {
  const [scans, setScans] = useState<StoredScan[]>(() => loadScans());
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<Grade | "all">("all");
  const [actionFilter, setActionFilter] = useState<SuggestedAction | "all">("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      scans
        .filter((s) => {
          const q = query.trim().toLowerCase();
          return (
            (q === "" ||
              s.title.toLowerCase().includes(q) ||
              s.category.toLowerCase().includes(q)) &&
            (gradeFilter === "all" || s.grade === gradeFilter) &&
            (actionFilter === "all" || s.suggestedAction === actionFilter)
          );
        })
        .sort((a, b) => (sortDir === "desc" ? b.scannedAt - a.scannedAt : a.scannedAt - b.scannedAt)),
    [scans, query, gradeFilter, actionFilter, sortDir]
  );

  const gradeDist = useMemo(() => {
    const counts: Record<string, number> = {};
    scans.forEach((s) => {
      counts[s.grade] = (counts[s.grade] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [scans]);

  const catData = useMemo(() => {
    const m: Record<string, { count: number; total: number }> = {};
    scans.forEach((s) => {
      if (!m[s.category]) m[s.category] = { count: 0, total: 0 };
      m[s.category]!.count++;
      m[s.category]!.total += s.freshnessScore;
    });
    return Object.entries(m).map(([cat, v]) => ({
      category: cat,
      scans: v.count,
      avgFreshness: Math.round(v.total / v.count),
    }));
  }, [scans]);

  const freshnessTrend = useMemo(
    () =>
      [...scans]
        .sort((a, b) => a.scannedAt - b.scannedAt)
        .map((s, i) => ({ scan: `#${i + 1}`, score: s.freshnessScore })),
    [scans]
  );

  const totalKg = scans.reduce((a, s) => a + s.estimatedSurplusKg, 0);
  const avgFresh = scans.length
    ? Math.round(scans.reduce((a, s) => a + s.freshnessScore, 0) / scans.length)
    : 0;
  const safeCount = scans.filter(
    (s) => s.grade === "Grade A (Optimal)" || s.grade === "Grade B (Safe - Urgent)"
  ).length;
  const ngoCount = scans.filter((s) => s.suggestedAction === "Redistribute to NGO").length;

  const clearHistory = () => {
    if (!confirm("Clear all scan history? This cannot be undone.")) return;
    localStorage.removeItem("annasetu_scan_history");
    setScans([]);
    toast.success("Scan history cleared.");
  };

  const exportCsv = () => {
    const headers = [
      "Scanned At",
      "Title",
      "Category",
      "Grade",
      "Freshness Score",
      "Shelf Life",
      "Suggested Action",
      "Surplus (kg)",
      "Engine",
    ];
    const rows = filtered.map((s) => [
      new Date(s.scannedAt).toLocaleString(),
      `"${s.title}"`,
      s.category,
      `"${s.grade}"`,
      s.freshnessScore,
      `"${s.shelfLifeRemaining}"`,
      `"${s.suggestedAction}"`,
      s.estimatedSurplusKg,
      s.engine,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} scans to CSV`);
  };

  return (
    <DashboardLayout
      title="Scan History & Analytics"
      subtitle="Complete log of all AI Vision Scanner results with grade trends and freshness analytics"
    >
      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Scans",
            value: `${scans.length}`,
            sub: `${filtered.length} shown`,
            icon: ScanLine,
          },
          {
            label: "Avg Freshness Score",
            value: `${avgFresh}`,
            sub: "Across all scans",
            icon: Sparkles,
          },
          {
            label: "Safe for Consumption",
            value: `${safeCount}/${scans.length}`,
            sub: `${Math.round((safeCount / Math.max(scans.length, 1)) * 100)}% pass rate`,
            icon: CheckCircle2,
          },
          {
            label: "Total Surplus Tracked",
            value: `${totalKg} kg`,
            sub: `${ngoCount} routed to NGO`,
            icon: Scale,
          },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="Grade Distribution" description="Breakdown of all scan outcomes">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {gradeDist.map((e) => (
                    <Cell
                      key={e.name}
                      fill={GRADE_COLOR[e.name as Grade] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 11,
                  }}
                  formatter={(v, n) => [
                    `${v} scan${Number(v) !== 1 ? "s" : ""}`,
                    (n as string).split("(")[1]?.replace(")", "") ?? n,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {gradeDist.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{
                      background: GRADE_COLOR[d.name as Grade] ?? "#94a3b8",
                    }}
                  />
                  <span className="text-muted-foreground truncate max-w-40">
                    {d.name.split("(")[1]?.replace(")", "") ?? d.name}
                  </span>
                </div>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Category Breakdown" description="Avg freshness by food category">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  stroke="var(--muted-foreground)"
                  domain={[0, 100]}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 10 }}
                  stroke="var(--muted-foreground)"
                  width={76}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 11,
                  }}
                />
                <Bar
                  dataKey="avgFreshness"
                  name="Avg Freshness"
                  fill="var(--chart-2)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Freshness Score Trend" description="Score across scans in order">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={freshnessTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="scan"
                  tick={{ fontSize: 10 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Freshness"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--chart-2)", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Scan Log Table */}
      <Card
        className="mt-4"
        title="All Scan Results"
        description="Click a row to expand the AI recommendation. Scans are saved in your browser."
        action={
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              <Download className="size-3.5" /> CSV
            </button>
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-100"
            >
              <Trash2 className="size-3.5" /> Clear All
            </button>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search item or category..."
              className="h-9 w-52 rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value as Grade | "all")}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="all">All Grades</option>
            <option value="Grade A (Optimal)">Grade A - Optimal</option>
            <option value="Grade B (Safe - Urgent)">Grade B - Safe/Urgent</option>
            <option value="Grade C (Sub-Standard)">Grade C - Sub-Standard</option>
            <option value="Grade D (Spoiled / Unsafe)">Grade D - Spoiled</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as SuggestedAction | "all")}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="all">All Actions</option>
            <option value="Immediate Kitchen Use">Kitchen Use</option>
            <option value="Redistribute to NGO">Redistribute to NGO</option>
            <option value="Secondary Discount Sale">Discount Sale</option>
            <option value="Composting / Animal Feed">Composting</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="inline-flex items-center gap-1 rounded-lg border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            <Filter className="size-3" />
            {sortDir === "desc" ? "Newest First" : "Oldest First"}
          </button>
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {scans.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
              <ScanLine className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">No scans yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the AI Vision Scanner to scan your first food item.
              </p>
            </div>
            <Link
              to="/quality-scanner"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              <ScanLine className="size-4" /> Open Scanner
            </Link>
          </div>
        ) : (
          <TableShell minWidth="56rem">
            <thead>
              <tr>
                <Th>Item</Th>
                <Th>Category</Th>
                <Th>Grade</Th>
                <Th>Freshness</Th>
                <Th>Shelf Life</Th>
                <Th>Action</Th>
                <Th>Surplus</Th>
                <Th>Engine</Th>
                <Th>Scanned</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const isExpanded = expandedId === s.id;
                const trend =
                  s.freshnessScore >= 75 ? (
                    <TrendingUp className="inline size-3 text-emerald-500 mr-0.5" />
                  ) : s.freshnessScore >= 45 ? (
                    <Minus className="inline size-3 text-amber-500 mr-0.5" />
                  ) : (
                    <TrendingDown className="inline size-3 text-red-500 mr-0.5" />
                  );
                return (
                  <tr
                    key={s.id}
                    className="border-t border-border cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <img
                          src={s.imageUrl}
                          alt={s.title}
                          className="size-8 rounded-md object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <span className="font-medium text-xs leading-snug max-w-36 line-clamp-2">
                          {s.title}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {s.category}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          GRADE_BG[s.grade]
                        )}
                      >
                        {s.grade.split("(")[0]?.trim()}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        {trend}
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.freshnessScore}%`,
                              background: GRADE_COLOR[s.grade],
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{s.freshnessScore}</span>
                      </div>
                    </Td>
                    <Td className="text-xs">{s.shelfLifeRemaining}</Td>
                    <Td>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          ACTION_BG[s.suggestedAction]
                        )}
                      >
                        {s.suggestedAction}
                      </span>
                    </Td>
                    <Td className="text-xs font-semibold">{s.estimatedSurplusKg} kg</Td>
                    <Td>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          s.engine === "gemini"
                            ? "bg-violet-500/10 text-violet-700 dark:text-violet-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {s.engine === "gemini" ? "Gemini" : "Canvas"}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {formatAgo(s.scannedAt)}
                        {isExpanded ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <Td colSpan={9}>
                    <span className="text-muted-foreground">No scans match this filter.</span>
                  </Td>
                </tr>
              )}
            </tbody>
          </TableShell>
        )}
      </Card>
    </DashboardLayout>
  );
}
