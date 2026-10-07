import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChefHat, Sparkles, Loader2, RefreshCw, Download, Lightbulb, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/dashboard-ui";
import { useViewMode } from "@/components/view-mode";
import { toast } from "sonner";

export const Route = createFileRoute("/menu-optimizer")({
  head: () => ({
    meta: [
      { title: "AI Menu Optimizer — AnnaSetu" },
      { name: "description", content: "Gemini AI suggests tomorrow's menu based on predicted surplus to minimize food waste." },
    ],
  }),
  component: MenuOptimizerPage,
});

interface MenuSuggestion {
  meal: string;
  ingredients: string[];
  surplusUsed: string[];
  servings: number;
  wasteReduction: number;
  prepTime: string;
  nutrition: string;
  notes: string;
}

interface OptimizedMenu {
  date: string;
  totalWasteReduced: number;
  breakfast: MenuSuggestion;
  lunch: MenuSuggestion;
  dinner: MenuSuggestion;
  rationale: string;
}

const FALLBACK_MENU: OptimizedMenu = {
  date: "Tomorrow",
  totalWasteReduced: 87,
  rationale: "Surplus analysis shows high predicted overstock in Rice, Dal, Tomatoes, and Spinach for tomorrow. This menu routes all high-risk items into core recipes to maximise consumption before spoilage.",
  breakfast: {
    meal: "Masala Dosa with Tomato Chutney",
    ingredients: ["Rice batter (surplus)", "Urad dal (surplus)", "Tomatoes (surplus)", "Green chilli", "Mustard seeds"],
    surplusUsed: ["Rice", "Dal", "Tomatoes"],
    servings: 120,
    wasteReduction: 28,
    prepTime: "45 min",
    nutrition: "320 kcal · 8g protein · 52g carbs",
    notes: "Overripe tomatoes are ideal for chutney — fully consumes the near-expiry stock.",
  },
  lunch: {
    meal: "Palak Dal & Jeera Rice",
    ingredients: ["Spinach (surplus)", "Toor dal (surplus)", "Basmati rice (surplus)", "Cumin", "Ginger-garlic paste"],
    surplusUsed: ["Spinach", "Dal", "Rice"],
    servings: 200,
    wasteReduction: 42,
    prepTime: "60 min",
    nutrition: "480 kcal · 18g protein · 72g carbs",
    notes: "Fresh spinach has a 3-day window — this lunch consumes 35 kg of predicted surplus.",
  },
  dinner: {
    meal: "Tomato Rasam & Vegetable Khichdi",
    ingredients: ["Tomatoes (surplus)", "Mixed lentils (surplus)", "Rice (surplus)", "Tamarind", "Curry leaves"],
    surplusUsed: ["Tomatoes", "Dal", "Rice"],
    servings: 180,
    wasteReduction: 17,
    prepTime: "40 min",
    nutrition: "380 kcal · 15g protein · 58g carbs",
    notes: "Rasam maximises tomato consumption. Khichdi is highly digestible and NGO-friendly.",
  },
};

async function generateMenuWithGemini(surplusItems: string[], apiKey: string): Promise<OptimizedMenu | null> {
  const prompt = `You are a professional institutional chef and food waste reduction expert for AnnaSetu, an Indian food redistribution platform.

Tomorrow's predicted high-surplus items (must be used): ${surplusItems.join(", ")}.

Generate a zero-waste daily menu for an Indian institutional kitchen (cafeteria/canteen) for 150-200 people.
Return ONLY this JSON (no markdown, no text outside JSON):
{
  "date": "Tomorrow",
  "totalWasteReduced": <integer kg>,
  "rationale": "<2 sentences explaining the strategy>",
  "breakfast": { "meal": "<name>", "ingredients": ["<item> (surplus)?", ...], "surplusUsed": ["<item>", ...], "servings": <int>, "wasteReduction": <int kg>, "prepTime": "<X min>", "nutrition": "<kcal · protein · carbs>", "notes": "<1 sentence>" },
  "lunch": { same structure },
  "dinner": { same structure }
}`;

  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]) as OptimizedMenu;
      }
    } catch {}
  }
  return null;
}

function MealCard({ label, suggestion }: { label: string; suggestion: MenuSuggestion }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
          <h3 className="mt-1 text-base font-bold text-foreground">{suggestion.meal}</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          🌿 {suggestion.wasteReduction} kg saved
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestion.surplusUsed.map(s => (
          <span key={s} className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            ↑ {s} (surplus)
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label:"Servings", value:`${suggestion.servings}` },
          { label:"Prep Time", value:suggestion.prepTime },
          { label:"Nutrition", value:suggestion.nutrition.split("·")[0]?.trim() ?? "" },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-muted/60 px-2 py-2">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-xs font-semibold text-foreground mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Ingredients</p>
        <div className="flex flex-wrap gap-1">
          {suggestion.ingredients.map(i => (
            <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{i}</span>
          ))}
        </div>
      </div>

      {suggestion.notes && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2">
          <Lightbulb className="size-3.5 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">{suggestion.notes}</p>
        </div>
      )}
    </div>
  );
}

function MenuOptimizerPage() {
  const { data } = useViewMode();
  const [menu, setMenu] = useState<OptimizedMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const apiKey = (
    (typeof window !== "undefined" && localStorage.getItem("annasetu_gemini_key")) ||
    (import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined) || ""
  ).trim();

  const topSurplus = data.forecastRows
    .filter(r => r.predictedSurplusKg > 0)
    .sort((a, b) => b.predictedSurplusKg - a.predictedSurplusKg)
    .slice(0, 10);

  const generate = async () => {
    const items = selectedItems.size > 0
      ? topSurplus.filter(r => selectedItems.has(r.id)).map(r => r.item)
      : topSurplus.slice(0, 5).map(r => r.item);

    setLoading(true);
    try {
      const result = apiKey ? await generateMenuWithGemini(items, apiKey) : null;
      setMenu(result ?? FALLBACK_MENU);
      if (!result) toast.info("Using sample menu (no Gemini API key). Add one in Scanner settings for live AI menus.");
      else toast.success("✨ AI menu generated based on your surplus forecast!");
    } finally {
      setLoading(false);
    }
  };

  const exportMenu = () => {
    if (!menu) return;
    const text = `AnnaSetu AI Menu Optimizer — ${menu.date}
Generated: ${new Date().toLocaleString()}
Total waste reduction: ${menu.totalWasteReduced} kg

STRATEGY: ${menu.rationale}

BREAKFAST: ${menu.breakfast.meal}
Servings: ${menu.breakfast.servings} | Prep: ${menu.breakfast.prepTime} | Saves: ${menu.breakfast.wasteReduction} kg
Ingredients: ${menu.breakfast.ingredients.join(", ")}

LUNCH: ${menu.lunch.meal}
Servings: ${menu.lunch.servings} | Prep: ${menu.lunch.prepTime} | Saves: ${menu.lunch.wasteReduction} kg
Ingredients: ${menu.lunch.ingredients.join(", ")}

DINNER: ${menu.dinner.meal}
Servings: ${menu.dinner.servings} | Prep: ${menu.dinner.prepTime} | Saves: ${menu.dinner.wasteReduction} kg
Ingredients: ${menu.dinner.ingredients.join(", ")}`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = "annasetu-menu.txt"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Menu exported!");
  };

  return (
    <DashboardLayout title="AI Menu Optimizer" subtitle="Gemini AI suggests tomorrow's menu based on predicted surplus to minimize waste">
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Left: Surplus picker */}
        <div className="space-y-4">
          <Card title="Predicted Surplus Items" description="Select items to include in menu planning (defaults to top 5)">
            <div className="space-y-2">
              {topSurplus.map(r => (
                <button key={r.id} type="button" onClick={() => setSelectedItems(prev => {
                  const n = new Set(prev);
                  if (n.has(r.id)) n.delete(r.id); else n.add(r.id);
                  return n;
                })}
                  className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all text-sm ${selectedItems.has(r.id) ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card hover:bg-accent/30"}`}>
                  <span className="font-medium text-foreground">{r.item}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 rounded-full ${r.predictedSurplusKg > 15 ? "bg-red-400" : r.predictedSurplusKg > 8 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width:`${Math.min(r.predictedSurplusKg * 4, 60)}px` }} />
                    <span className="text-xs font-semibold text-muted-foreground">{r.predictedSurplusKg} kg</span>
                  </div>
                </button>
              ))}
            </div>
            <button type="button" onClick={generate} disabled={loading}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              {loading ? <><Loader2 className="size-4 animate-spin" />Generating…</> : <><Sparkles className="size-4" />Generate Menu</>}
            </button>
          </Card>

          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/3 p-4 text-center">
            <ChefHat className="size-8 text-primary/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground leading-relaxed">AnnaSetu AI analyses your surplus forecast and suggests a complete day&apos;s menu that routes high-risk items into core dishes before they expire.</p>
          </div>
        </div>

        {/* Right: Generated Menu */}
        <div className="xl:col-span-2">
          {!menu && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 rounded-xl border border-dashed border-border">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                <ChefHat className="size-8 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">No menu generated yet</p>
                <p className="text-sm text-muted-foreground mt-1">Select surplus items and click Generate Menu</p>
              </div>
              <button type="button" onClick={generate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                <Sparkles className="size-4" /> Generate Now
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4">
              <div className="relative flex size-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
                <Sparkles className="size-8 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-semibold">AI is crafting your menu…</p>
                <p className="text-sm text-muted-foreground mt-1">Analysing surplus, nutrition, and regional preferences</p>
              </div>
            </div>
          )}

          {menu && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-bold text-lg text-foreground">Optimized Menu — {menu.date}</h2>
                  <p className="text-sm text-muted-foreground">
                    Estimated <span className="font-semibold text-emerald-600 dark:text-emerald-400">{menu.totalWasteReduced} kg</span> of surplus will be consumed
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={generate} className="inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-2 text-xs font-medium hover:bg-accent">
                    <RefreshCw className="size-3.5" /> Regenerate
                  </button>
                  <button type="button" onClick={exportMenu} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                    <Download className="size-3.5" /> Export
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3">
                <ArrowRight className="size-4 shrink-0 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{menu.rationale}</p>
              </div>

              <MealCard label="Breakfast" suggestion={menu.breakfast} />
              <MealCard label="Lunch" suggestion={menu.lunch} />
              <MealCard label="Dinner" suggestion={menu.dinner} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
