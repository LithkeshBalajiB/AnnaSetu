import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Trophy, Medal, Star, TrendingUp, Users, Leaf, Award } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/impact-wall")({
  head: () => ({
    meta: [
      { title: "Impact Wall — AnnaSetu" },
      { name: "description", content: "Live impact leaderboard, staff badges, meals-saved ticker and sustainability gamification." },
    ],
  }),
  component: ImpactWallPage,
});

const STAFF = [
  { id:"s1", name:"Raman Verma", role:"Head Chef", avatar:"RV", meals:1248, kg:524, badges:["Zero Waste Week","500kg Hero","NGO Champion"], streak:12 },
  { id:"s2", name:"Meera Nair", role:"QC Lead", avatar:"MN", meals:987, kg:415, badges:["Zero Waste Week","100 Scans","Quality Guardian"], streak:8 },
  { id:"s3", name:"Arjun Pillai", role:"Sous Chef", avatar:"AP", meals:842, kg:354, badges:["First Donation","50kg Saved"], streak:5 },
  { id:"s4", name:"Sunita Reddy", role:"Kitchen Supervisor", avatar:"SR", meals:731, kg:307, badges:["Zero Waste Week","Cold Chain Champ"], streak:14 },
  { id:"s5", name:"David D'Souza", role:"Driver", avatar:"DD", meals:612, kg:257, badges:["Delivery Hero","On-Time Master"], streak:7 },
  { id:"s6", name:"Priya Sharma", role:"Nutrition Analyst", avatar:"PS", meals:543, kg:228, badges:["Freshness Expert"], streak:3 },
];

const BADGES_META: Record<string, { label: string; emoji: string; color: string }> = {
  "Zero Waste Week":    { label:"Zero Waste Week",    emoji:"🌿", color:"bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20" },
  "500kg Hero":         { label:"500 kg Hero",         emoji:"🏅", color:"bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20" },
  "NGO Champion":       { label:"NGO Champion",        emoji:"🤝", color:"bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20" },
  "100 Scans":          { label:"100 Scans",           emoji:"🔬", color:"bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20" },
  "Quality Guardian":   { label:"Quality Guardian",    emoji:"🛡️", color:"bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20" },
  "First Donation":     { label:"First Donation",      emoji:"🎯", color:"bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20" },
  "50kg Saved":         { label:"50 kg Saved",         emoji:"🌾", color:"bg-lime-500/10 text-lime-700 dark:text-lime-300 border border-lime-500/20" },
  "Cold Chain Champ":   { label:"Cold Chain Champ",    emoji:"❄️", color:"bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20" },
  "Delivery Hero":      { label:"Delivery Hero",       emoji:"🚛", color:"bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20" },
  "On-Time Master":     { label:"On-Time Master",      emoji:"⏱️", color:"bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20" },
  "Freshness Expert":   { label:"Freshness Expert",    emoji:"🥦", color:"bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20" },
};

const MONTHLY_IMPACT = [
  { month:"Apr", meals:2100, kg:882 },
  { month:"May", meals:2480, kg:1042 },
  { month:"Jun", meals:2890, kg:1214 },
  { month:"Jul", meals:3120, kg:1310 },
  { month:"Aug", meals:3560, kg:1495 },
  { month:"Sep", meals:3963, kg:1665 },
];

const RANK_ICON = [
  <Trophy key={0} className="size-4 text-amber-400" />,
  <Medal key={1} className="size-4 text-slate-400" />,
  <Medal key={2} className="size-4 text-amber-700" />,
];

function LiveTicker({ total }: { total: number }) {
  const [count, setCount] = useState(total);
  useEffect(() => {
    const t = setInterval(() => setCount(c => c + Math.floor(Math.random() * 3)), 4000);
    return () => clearInterval(t);
  }, [total]);
  return <span className="tabular-nums font-black text-4xl text-primary">{count.toLocaleString()}</span>;
}

function ImpactWallPage() {
  const totalMeals = STAFF.reduce((a, s) => a + s.meals, 0);
  const totalKg = STAFF.reduce((a, s) => a + s.kg, 0);
  const co2Avoided = Math.round(totalKg * 2.5);
  const waterSaved = Math.round(totalKg * 500);

  return (
    <DashboardLayout title="Impact Wall" subtitle="Live sustainability leaderboard, staff badges, and meals-saved tracker">
      {/* Live Impact Ticker */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 to-primary/3 p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">🌾 AnnaSetu has saved today</p>
        <LiveTicker total={totalMeals} />
        <p className="text-lg font-semibold text-foreground mt-1">meals redirected to people in need</p>
        <div className="mt-4 flex items-center justify-center gap-8 flex-wrap">
          {[
            { label:"Food rescued", value:`${totalKg.toLocaleString()} kg` },
            { label:"CO₂ avoided", value:`${co2Avoided.toLocaleString()} kg` },
            { label:"Water saved", value:`${(waterSaved/1000).toFixed(0)} kL` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* Leaderboard */}
        <div className="xl:col-span-2">
          <Card title="Staff Leaderboard" description="Ranked by meals contributed to redistribution this month">
            <div className="space-y-3">
              {STAFF.map((s, i) => (
                <div key={s.id} className={cn("flex items-center gap-3 rounded-xl p-3 transition-all", i === 0 && "bg-amber-500/5 ring-1 ring-amber-500/20")}>
                  <div className="flex size-8 shrink-0 items-center justify-center text-sm">
                    {i < 3 ? RANK_ICON[i] : <span className="text-xs font-bold text-muted-foreground">#{i+1}</span>}
                  </div>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">{s.role}</span>
                      {s.streak >= 7 && <span className="text-[10px] rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 font-medium">🔥 {s.streak}d streak</span>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {s.badges.slice(0,3).map(b => (
                        <span key={b} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", BADGES_META[b]?.color ?? "bg-muted text-muted-foreground")}>
                          {BADGES_META[b]?.emoji} {BADGES_META[b]?.label ?? b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{s.meals.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">meals</p>
                    <p className="text-xs font-semibold text-primary mt-0.5">{s.kg} kg</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Badges & Trend */}
        <div className="space-y-4">
          <Card title="Badge Gallery" description="Earned achievements across the team">
            <div className="grid grid-cols-2 gap-2">
              {Object.values(BADGES_META).map(b => (
                <div key={b.label} className={cn("rounded-lg p-2.5 text-center text-xs font-medium", b.color)}>
                  <div className="text-lg mb-1">{b.emoji}</div>
                  <p className="leading-tight text-[10px]">{b.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Monthly Impact" description="Meals rescued per month">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_IMPACT}>
                  <defs>
                    <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize:10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize:10 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius:10, border:"1px solid var(--border)", background:"var(--card)", fontSize:11 }} />
                  <Area type="monotone" dataKey="meals" name="Meals" stroke="var(--chart-2)" fill="url(#impactGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* "How to earn" CTA */}
      <div className="mt-4 rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Award className="size-4 text-primary" />How to earn badges</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4 text-xs text-muted-foreground">
          {[
            { emoji:"🌿", label:"Zero Waste Week", desc:"Zero food waste for 7 consecutive days" },
            { emoji:"🔬", label:"100 Scans", desc:"Complete 100 AI Vision Scanner analyses" },
            { emoji:"🤝", label:"NGO Champion", desc:"Coordinate 10+ successful NGO deliveries" },
            { emoji:"🏅", label:"500 kg Hero", desc:"Rescue 500 kg of food from going to waste" },
          ].map(b => (
            <div key={b.label} className="rounded-lg border border-border p-3">
              <div className="text-lg mb-1">{b.emoji}</div>
              <p className="font-semibold text-foreground text-xs">{b.label}</p>
              <p className="mt-0.5 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
