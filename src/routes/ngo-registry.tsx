import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MapPin, Phone, Star, Users, ShieldCheck, Clock, Tag,
  Search, Filter, ChevronDown, ChevronUp, Plus, Heart,
  Truck, CheckCircle2, AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, TableShell, Th, Td } from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/ngo-registry")({
  head: () => ({
    meta: [
      { title: "NGO Partner Registry — AnnaSetu" },
      { name: "description", content: "Searchable directory of verified NGO and food bank partners with smart food matching and capacity data." },
    ],
  }),
  component: NGORegistryPage,
});

interface NGOPartner {
  id: string;
  name: string;
  type: "NGO" | "Food Bank" | "Shelter" | "Old-Age Home" | "Orphanage" | "Community Kitchen";
  address: string;
  distanceKm: number;
  contactPerson: string;
  phone: string;
  accepts: string[];
  capacityKgPerDay: number;
  availableNow: boolean;
  rating: number;
  totalReceived: number;
  verified: boolean;
  lastPickup: string;
  preferredTime: string;
  vehicleAvailable: boolean;
}

const NGO_DATA: NGOPartner[] = [
  { id:"n1", name:"Akshaya Patra Foundation", type:"NGO", address:"Rajajinagar, Bengaluru", distanceKm:2.4, contactPerson:"Ravi Kumar", phone:"+91 80 2348 0000", accepts:["Cooked Meal","Produce","Bakery"], capacityKgPerDay:500, availableNow:true, rating:4.9, totalReceived:12400, verified:true, lastPickup:"2h ago", preferredTime:"7:00 AM – 9:00 AM", vehicleAvailable:true },
  { id:"n2", name:"Robin Hood Army Bengaluru", type:"NGO", address:"Koramangala, Bengaluru", distanceKm:3.8, contactPerson:"Priya Menon", phone:"+91 98450 77123", accepts:["Cooked Meal","Produce","Dairy"], capacityKgPerDay:200, availableNow:true, rating:4.8, totalReceived:8750, verified:true, lastPickup:"5h ago", preferredTime:"6:30 PM – 8:30 PM", vehicleAvailable:false },
  { id:"n3", name:"Seva Sahayog Foundation", type:"Food Bank", address:"Vijayanagar, Bengaluru", distanceKm:5.1, contactPerson:"Anita Rao", phone:"+91 80 2354 1234", accepts:["Produce","Bakery","Dairy","Meat"], capacityKgPerDay:350, availableNow:false, rating:4.6, totalReceived:6300, verified:true, lastPickup:"1d ago", preferredTime:"10:00 AM – 12:00 PM", vehicleAvailable:true },
  { id:"n4", name:"Hope Children Home", type:"Orphanage", address:"Austin Town, Bengaluru", distanceKm:7.2, contactPerson:"David D'Souza", phone:"+91 98860 11223", accepts:["Cooked Meal","Dairy","Bakery"], capacityKgPerDay:80, availableNow:true, rating:4.7, totalReceived:3200, verified:true, lastPickup:"3h ago", preferredTime:"12:00 PM – 1:00 PM", vehicleAvailable:false },
  { id:"n5", name:"Shree Sai Old Age Home", type:"Old-Age Home", address:"Malleshwaram, Bengaluru", distanceKm:4.5, contactPerson:"Meera Iyer", phone:"+91 80 2346 9900", accepts:["Cooked Meal","Produce","Dairy"], capacityKgPerDay:60, availableNow:true, rating:4.5, totalReceived:2100, verified:true, lastPickup:"Yesterday", preferredTime:"11:30 AM – 1:30 PM", vehicleAvailable:false },
  { id:"n6", name:"Zakat Foundation Food Pantry", type:"Food Bank", address:"Shivajinagar, Bengaluru", distanceKm:6.0, contactPerson:"Ibrahim Shaikh", phone:"+91 98765 43210", accepts:["Produce","Bakery","Meat"], capacityKgPerDay:150, availableNow:false, rating:4.4, totalReceived:4800, verified:true, lastPickup:"2d ago", preferredTime:"4:00 PM – 6:00 PM", vehicleAvailable:true },
  { id:"n7", name:"St. Mary's Community Kitchen", type:"Community Kitchen", address:"Fraser Town, Bengaluru", distanceKm:8.3, contactPerson:"Sister Grace", phone:"+91 80 2554 7788", accepts:["Produce","Cooked Meal","Bakery","Dairy"], capacityKgPerDay:400, availableNow:true, rating:4.8, totalReceived:9600, verified:true, lastPickup:"4h ago", preferredTime:"8:00 AM – 10:00 AM", vehicleAvailable:true },
  { id:"n8", name:"Janaagraha Urban Poverty Relief", type:"NGO", address:"Yeshwanthpur, Bengaluru", distanceKm:9.7, contactPerson:"Karthik Bhat", phone:"+91 99010 23456", accepts:["Produce","Bakery"], capacityKgPerDay:120, availableNow:false, rating:4.3, totalReceived:2900, verified:false, lastPickup:"3d ago", preferredTime:"3:00 PM – 5:00 PM", vehicleAvailable:false },
  { id:"n9", name:"Gurudwara Langar Trust", type:"Community Kitchen", address:"Frazer Town, Bengaluru", distanceKm:6.8, contactPerson:"Gurpreet Singh", phone:"+91 98450 55678", accepts:["Produce","Cooked Meal","Bakery","Dairy","Meat"], capacityKgPerDay:600, availableNow:true, rating:5.0, totalReceived:18000, verified:true, lastPickup:"1h ago", preferredTime:"All Day (6 AM – 10 PM)", vehicleAvailable:true },
  { id:"n10", name:"Annadaata Charitable Trust", type:"NGO", address:"Electronic City, Bengaluru", distanceKm:14.2, contactPerson:"Sudha Murthy", phone:"+91 80 2852 3311", accepts:["Cooked Meal","Produce"], capacityKgPerDay:250, availableNow:true, rating:4.6, totalReceived:5400, verified:true, lastPickup:"6h ago", preferredTime:"12:00 PM – 2:00 PM", vehicleAvailable:true },
];

const TYPE_COLOR: Record<NGOPartner["type"], string> = {
  "NGO": "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "Food Bank": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "Shelter": "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Old-Age Home": "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "Orphanage": "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  "Community Kitchen": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={cn("size-3", i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
      ))}
      <span className="ml-1 text-[11px] font-semibold text-muted-foreground">{rating}</span>
    </div>
  );
}

function NGORegistryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<NGOPartner["type"] | "all">("all");
  const [availOnly, setAvailOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "capacity" | "rating">("distance");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<string | null>(null);

  const filtered = useMemo(() => NGO_DATA
    .filter(n => {
      const q = search.trim().toLowerCase();
      return (q === "" || n.name.toLowerCase().includes(q) || n.address.toLowerCase().includes(q) || n.accepts.some(a => a.toLowerCase().includes(q)))
        && (typeFilter === "all" || n.type === typeFilter)
        && (!availOnly || n.availableNow);
    })
    .sort((a, b) => sortBy === "distance" ? a.distanceKm - b.distanceKm : sortBy === "capacity" ? b.capacityKgPerDay - a.capacityKgPerDay : b.rating - a.rating),
  [search, typeFilter, availOnly, sortBy]);

  const availableCount = NGO_DATA.filter(n => n.availableNow).length;
  const totalCapacity = NGO_DATA.filter(n => n.availableNow).reduce((a, n) => a + n.capacityKgPerDay, 0);
  const totalReceived = NGO_DATA.reduce((a, n) => a + n.totalReceived, 0);
  const avgDist = Math.round(NGO_DATA.reduce((a, n) => a + n.distanceKm, 0) / NGO_DATA.length * 10) / 10;

  const handleMatch = (ngo: NGOPartner) => {
    setMatched(ngo.id);
    toast.success(`✅ Smart match sent to ${ngo.name}! ${ngo.contactPerson} will be notified.`, { duration: 4000 });
  };

  return (
    <DashboardLayout title="NGO Partner Registry" subtitle="Verified food bank and shelter directory with smart surplus matching">
      {/* KPI */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label:"Registered Partners", value: NGO_DATA.length, sub:"All verified NGOs", icon:"🤝" },
          { label:"Available Right Now", value: availableCount, sub:"Ready for pickup", icon:"🟢" },
          { label:"Network Capacity Today", value:`${totalCapacity.toLocaleString()} kg`, sub:"Combined daily intake", icon:"📦" },
          { label:"Total Food Received", value:`${(totalReceived/1000).toFixed(1)}t`, sub:"Across all partners", icon:"🌾" },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <span className="text-xl">{c.icon}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Smart Suggest Banner */}
      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Heart className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Smart Matching Active</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            AnnaSetu automatically suggests the best NGO partner based on food type, quantity, shelf life, and proximity.
            Today&apos;s top suggestion: <strong>Gurudwara Langar Trust</strong> — 600 kg/day capacity, 1km away, pickup anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setMatched("n9"); toast.success("Smart match sent to Gurudwara Langar Trust!", { duration: 4000 }); }}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <CheckCircle2 className="size-3.5" /> Accept Match
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search NGO, area, or food type…"
            className="h-9 w-64 rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as NGOPartner["type"] | "all")}
          className="h-9 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/40">
          <option value="all">All Types</option>
          {(["NGO","Food Bank","Shelter","Old-Age Home","Orphanage","Community Kitchen"] as const).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={() => setAvailOnly(v => !v)} className={cn("h-9 rounded-lg border px-3 text-xs font-medium transition-colors", availOnly ? "border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-input text-muted-foreground hover:text-foreground")}>
          🟢 Available Now Only
        </button>
        <div className="flex rounded-lg bg-muted p-1 ml-auto">
          {(["distance","capacity","rating"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)} className={cn("rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors capitalize", sortBy === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {s === "distance" ? "Nearest" : s === "capacity" ? "Capacity" : "⭐ Rating"}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} partner{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Cards Grid */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-start">
        {filtered.map(ngo => {
          const isExpanded = expandedId === ngo.id;
          const isMatched = matched === ngo.id;
          return (
            <div key={ngo.id} className={cn("rounded-xl border bg-card shadow-sm transition-all", isMatched ? "border-primary ring-2 ring-primary/30" : "border-border hover:shadow-md")}>
              {/* Header */}
              <div className="p-4 pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TYPE_COLOR[ngo.type])}>{ngo.type}</span>
                      {ngo.verified && <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"><ShieldCheck className="size-2.5" />FSSAI Verified</span>}
                      {isMatched && <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"><CheckCircle2 className="size-2.5" />Matched</span>}
                    </div>
                    <h3 className="mt-1.5 font-bold text-sm text-foreground leading-snug">{ngo.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />{ngo.address} · <span className="font-medium text-foreground">{ngo.distanceKm} km</span>
                    </div>
                  </div>
                  <div className={cn("flex size-3 mt-1.5 rounded-full shrink-0", ngo.availableNow ? "bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.4)]" : "bg-muted-foreground/30")} title={ngo.availableNow ? "Available now" : "Not available"} />
                </div>
                <div className="mt-2"><Stars rating={ngo.rating} /></div>
              </div>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-3 gap-0 border-t border-border">
                {[
                  { label:"Capacity", value:`${ngo.capacityKgPerDay}kg/d`, icon:<Tag className="size-3" /> },
                  { label:"Received", value:`${(ngo.totalReceived/1000).toFixed(1)}t`, icon:<Truck className="size-3" /> },
                  { label:"Last Pickup", value:ngo.lastPickup, icon:<Clock className="size-3" /> },
                ].map((s, i) => (
                  <div key={s.label} className={cn("px-3 py-2 text-center", i < 2 && "border-r border-border")}>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">{s.icon}<span className="text-[9px] uppercase tracking-wide">{s.label}</span></div>
                    <p className="text-xs font-semibold text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Accepted Food */}
              <div className="px-4 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Accepts</p>
                <div className="flex flex-wrap gap-1">
                  {ngo.accepts.map(a => <span key={a} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{a}</span>)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 p-4 pt-3">
                <button type="button" onClick={() => handleMatch(ngo)}
                  className={cn("flex-1 rounded-lg py-2 text-xs font-semibold transition-all", isMatched ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20")}>
                  {isMatched ? "✅ Matched!" : "🤝 Match Surplus"}
                </button>
                <button type="button" onClick={() => setExpandedId(isExpanded ? null : ngo.id)}
                  className={cn("rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors flex items-center gap-1", isExpanded ? "bg-accent border-border font-semibold text-foreground shadow-xs" : "border-border hover:bg-accent text-muted-foreground hover:text-foreground")}>
                  {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}Details
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/40 px-4 py-3 rounded-b-xl space-y-1.5 text-xs animate-in fade-in-50 duration-150">
                  <div className="flex gap-2"><Phone className="size-3.5 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Contact: </span><span className="font-medium text-foreground">{ngo.contactPerson}</span> · {ngo.phone}</div></div>
                  <div className="flex gap-2"><Clock className="size-3.5 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Preferred pickup: </span><span className="font-medium text-foreground">{ngo.preferredTime}</span></div></div>
                  <div className="flex gap-2"><Truck className="size-3.5 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Vehicle: </span><span className={cn("font-medium", ngo.vehicleAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>{ngo.vehicleAvailable ? "Own vehicle available" : "Requires our delivery"}</span></div></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-3 py-12 text-center">
          <AlertCircle className="size-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">No partners match your filter</p>
          <p className="text-sm text-muted-foreground">Try adjusting the search or removing the "Available Now" filter.</p>
        </div>
      )}

      {/* Register CTA */}
      <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-foreground">Know an NGO we should partner with?</p>
          <p className="text-sm text-muted-foreground mt-0.5">Help us grow the network and feed more people.</p>
        </div>
        <button type="button" onClick={() => toast.info("NGO registration form coming soon!", { duration: 3000 })}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" /> Register an NGO
        </button>
      </div>
    </DashboardLayout>
  );
}
