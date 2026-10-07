import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar as CalendarIcon,
  Clock,
  Truck,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Phone,
  ShieldCheck,
  Search,
  Sparkles,
  AlertTriangle,
  X,
  ThermometerSnowflake,
  PackageCheck,
  Printer,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/dashboard-ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/pickup-calendar")({
  head: () => ({
    meta: [
      { title: "Batch Pickup Calendar — AnnaSetu" },
      {
        name: "description",
        content:
          "Interactive calendar coordinating NGO collection slots with surplus forecast peaks and cold-chain logistics.",
      },
      { property: "og:title", content: "Batch Pickup Calendar — AnnaSetu" },
    ],
  }),
  component: PickupCalendarPage,
});

export interface PickupSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  ngoName: string;
  ngoContact: string;
  driverName: string;
  driverPhone: string;
  vehicleType: "Refrigerated Van (-4°C)" | "Insulated Electric Van" | "Standard Cargo Van" | "3-Wheeler Cargo";
  vehiclePlate: string;
  surplusLot: string;
  estimatedKg: number;
  category: "Cooked Meal" | "Produce" | "Bakery" | "Dairy";
  status: "scheduled" | "in-transit" | "completed" | "delayed";
  notes: string;
  gatePassId: string;
  loadingBay: string;
}

export interface DayForecast {
  date: string;
  forecastKg: number;
  peakCategory: "Cooked Meal" | "Produce" | "Bakery" | "Dairy";
  risk: "high" | "medium" | "low";
}

const INITIAL_FORECASTS: Record<string, DayForecast> = {
  "2026-10-01": { date: "2026-10-01", forecastKg: 42, peakCategory: "Produce", risk: "medium" },
  "2026-10-02": { date: "2026-10-02", forecastKg: 65, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-03": { date: "2026-10-03", forecastKg: 85, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-04": { date: "2026-10-04", forecastKg: 30, peakCategory: "Bakery", risk: "low" },
  "2026-10-05": { date: "2026-10-05", forecastKg: 48, peakCategory: "Produce", risk: "medium" },
  "2026-10-06": { date: "2026-10-06", forecastKg: 52, peakCategory: "Dairy", risk: "medium" },
  "2026-10-07": { date: "2026-10-07", forecastKg: 78, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-08": { date: "2026-10-08", forecastKg: 60, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-09": { date: "2026-10-09", forecastKg: 95, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-10": { date: "2026-10-10", forecastKg: 110, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-11": { date: "2026-10-11", forecastKg: 88, peakCategory: "Produce", risk: "high" },
  "2026-10-12": { date: "2026-10-12", forecastKg: 35, peakCategory: "Bakery", risk: "low" },
  "2026-10-13": { date: "2026-10-13", forecastKg: 45, peakCategory: "Produce", risk: "medium" },
  "2026-10-14": { date: "2026-10-14", forecastKg: 58, peakCategory: "Dairy", risk: "medium" },
  "2026-10-15": { date: "2026-10-15", forecastKg: 72, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-16": { date: "2026-10-16", forecastKg: 90, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-17": { date: "2026-10-17", forecastKg: 105, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-18": { date: "2026-10-18", forecastKg: 64, peakCategory: "Produce", risk: "medium" },
  "2026-10-19": { date: "2026-10-19", forecastKg: 28, peakCategory: "Bakery", risk: "low" },
  "2026-10-20": { date: "2026-10-20", forecastKg: 50, peakCategory: "Produce", risk: "medium" },
  "2026-10-21": { date: "2026-10-21", forecastKg: 62, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-22": { date: "2026-10-22", forecastKg: 70, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-23": { date: "2026-10-23", forecastKg: 92, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-24": { date: "2026-10-24", forecastKg: 115, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-25": { date: "2026-10-25", forecastKg: 75, peakCategory: "Produce", risk: "high" },
  "2026-10-26": { date: "2026-10-26", forecastKg: 32, peakCategory: "Bakery", risk: "low" },
  "2026-10-27": { date: "2026-10-27", forecastKg: 46, peakCategory: "Dairy", risk: "medium" },
  "2026-10-28": { date: "2026-10-28", forecastKg: 58, peakCategory: "Produce", risk: "medium" },
  "2026-10-29": { date: "2026-10-29", forecastKg: 68, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-30": { date: "2026-10-30", forecastKg: 98, peakCategory: "Cooked Meal", risk: "high" },
  "2026-10-31": { date: "2026-10-31", forecastKg: 120, peakCategory: "Cooked Meal", risk: "high" },
};

const INITIAL_PICKUPS: PickupSlot[] = [
  {
    id: "pk-101",
    date: "2026-10-07",
    time: "11:30 AM",
    ngoName: "Feeding India — Central Hub",
    ngoContact: "Amit Saxena (+91 98110 22341)",
    driverName: "Rajesh Kumar",
    driverPhone: "+91 98765 43210",
    vehicleType: "Insulated Electric Van",
    vehiclePlate: "DL-1V-8823",
    surplusLot: "Cooked Basmati Rice & Dal (Tray #3)",
    estimatedKg: 35,
    category: "Cooked Meal",
    status: "in-transit",
    notes: "Requires insulated thermal containers. Destination: Mayapuri Shelter Home.",
    gatePassId: "GP-2026-1007-01",
    loadingBay: "Bay 2 (Cold Dock)",
  },
  {
    id: "pk-102",
    date: "2026-10-07",
    time: "03:45 PM",
    ngoName: "Robin Hood Army — Green Park",
    ngoContact: "Pooja Verma (+91 98200 44512)",
    driverName: "Sunil Yadav",
    driverPhone: "+91 99102 33451",
    vehicleType: "Standard Cargo Van",
    vehiclePlate: "DL-3C-4419",
    surplusLot: "Overripe Cavendish Bananas & Fresh Apples",
    estimatedKg: 40,
    category: "Produce",
    status: "scheduled",
    notes: "Direct distribution to slum education centers.",
    gatePassId: "GP-2026-1007-02",
    loadingBay: "Bay 1 (Dry Dock)",
  },
  {
    id: "pk-103",
    date: "2026-10-05",
    time: "02:00 PM",
    ngoName: "Akshaya Patra Logistix",
    ngoContact: "Vikram Sengupta (+91 98450 11200)",
    driverName: "Mahesh Chandra",
    driverPhone: "+91 97112 00412",
    vehicleType: "Refrigerated Van (-4°C)",
    vehiclePlate: "KA-01-MJ-5501",
    surplusLot: "Bulk Paneer Tikka & Curd Batches",
    estimatedKg: 45,
    category: "Dairy",
    status: "completed",
    notes: "Temperature monitored batch. Handed over at 3.2°C.",
    gatePassId: "GP-2026-1005-01",
    loadingBay: "Bay 2 (Cold Dock)",
  },
  {
    id: "pk-104",
    date: "2026-10-06",
    time: "12:15 PM",
    ngoName: "Roti Bank Delhi NCR",
    ngoContact: "Harpreet Singh (+91 98101 99882)",
    driverName: "Gurpreet Singh",
    driverPhone: "+91 98233 44556",
    vehicleType: "Standard Cargo Van",
    vehiclePlate: "HR-26-BR-9912",
    surplusLot: "Whole Grain Breads & Rotis (Lot #L12)",
    estimatedKg: 48,
    category: "Bakery",
    status: "completed",
    notes: "Distribution completed at AIIMS night shelter.",
    gatePassId: "GP-2026-1006-01",
    loadingBay: "Bay 1 (Dry Dock)",
  },
  {
    id: "pk-105",
    date: "2026-10-08",
    time: "10:30 AM",
    ngoName: "No Food Waste — Rohini Cluster",
    ngoContact: "Kavita Rao (+91 98711 00234)",
    driverName: "Dinesh Shrestha",
    driverPhone: "+91 98912 33211",
    vehicleType: "3-Wheeler Cargo",
    vehiclePlate: "DL-1L-6710",
    surplusLot: "Morning Breakfast Buffet Surplus & Croissants",
    estimatedKg: 30,
    category: "Cooked Meal",
    status: "scheduled",
    notes: "Pick up by 11:00 AM sharp before temperature drops.",
    gatePassId: "GP-2026-1008-01",
    loadingBay: "Bay 3 (Express)",
  },
  {
    id: "pk-106",
    date: "2026-10-09",
    time: "02:30 PM",
    ngoName: "Feeding India — Central Hub",
    ngoContact: "Amit Saxena (+91 98110 22341)",
    driverName: "Manoj Sharma",
    driverPhone: "+91 98188 77665",
    vehicleType: "Refrigerated Van (-4°C)",
    vehiclePlate: "DL-1V-8823",
    surplusLot: "Friday Corporate Cafeteria Surplus (Rice, Subzi, Dal)",
    estimatedKg: 75,
    category: "Cooked Meal",
    status: "scheduled",
    notes: "Heavy volume expected from tech park campus.",
    gatePassId: "GP-2026-1009-01",
    loadingBay: "Bay 2 (Cold Dock)",
  },
  {
    id: "pk-107",
    date: "2026-10-10",
    time: "01:00 PM",
    ngoName: "Akshaya Patra Logistix",
    ngoContact: "Vikram Sengupta (+91 98450 11200)",
    driverName: "Rajendra Rawat",
    driverPhone: "+91 98711 88992",
    vehicleType: "Insulated Electric Van",
    vehiclePlate: "KA-01-MJ-5501",
    surplusLot: "Weekend Banquet Event Curries & Pulao",
    estimatedKg: 85,
    category: "Cooked Meal",
    status: "scheduled",
    notes: "Requires 6 large thermal drums.",
    gatePassId: "GP-2026-1010-01",
    loadingBay: "Bay 2 (Cold Dock)",
  },
  {
    id: "pk-108",
    date: "2026-10-12",
    time: "04:00 PM",
    ngoName: "Roti Bank Delhi NCR",
    ngoContact: "Harpreet Singh (+91 98101 99882)",
    driverName: "Tarlochan Singh",
    driverPhone: "+91 98100 11223",
    vehicleType: "Standard Cargo Van",
    vehiclePlate: "HR-26-BR-9912",
    surplusLot: "Day-end Bakery Breads & Pav Rolls",
    estimatedKg: 32,
    category: "Bakery",
    status: "scheduled",
    notes: "Distribution to Old Delhi homeless shelters.",
    gatePassId: "GP-2026-1012-01",
    loadingBay: "Bay 1 (Dry Dock)",
  },
];

const REGISTERED_NGOS = [
  { name: "Feeding India — Central Hub", contact: "Amit Saxena (+91 98110 22341)", defaultVehicle: "Insulated Electric Van" },
  { name: "Robin Hood Army — Green Park", contact: "Pooja Verma (+91 98200 44512)", defaultVehicle: "Standard Cargo Van" },
  { name: "Akshaya Patra Logistix", contact: "Vikram Sengupta (+91 98450 11200)", defaultVehicle: "Refrigerated Van (-4°C)" },
  { name: "Roti Bank Delhi NCR", contact: "Harpreet Singh (+91 98101 99882)", defaultVehicle: "Standard Cargo Van" },
  { name: "No Food Waste — Rohini Cluster", contact: "Kavita Rao (+91 98711 00234)", defaultVehicle: "3-Wheeler Cargo" },
  { name: "Goonj Kitchen Relief", contact: "Sanjay Bose (+91 98188 33441)", defaultVehicle: "Insulated Electric Van" },
];

function loadStoredPickups(): PickupSlot[] {
  try {
    const raw = localStorage.getItem("annasetu_pickup_calendar");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem("annasetu_pickup_calendar", JSON.stringify(INITIAL_PICKUPS));
  return INITIAL_PICKUPS;
}

function PickupCalendarPage() {
  const [pickups, setPickups] = useState<PickupSlot[]>(loadStoredPickups);
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-07");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedGatePass, setSelectedGatePass] = useState<PickupSlot | null>(null);

  const [formData, setFormData] = useState({
    date: "2026-10-07",
    time: "14:00",
    ngoName: REGISTERED_NGOS[0]!.name,
    category: "Cooked Meal" as PickupSlot["category"],
    surplusLot: "Evening Dining Hall Surplus (Tray #5)",
    estimatedKg: 40,
    vehicleType: "Insulated Electric Van" as PickupSlot["vehicleType"],
    vehiclePlate: "DL-1V-4421",
    driverName: "Mukesh Sharma",
    driverPhone: "+91 98711 22334",
    notes: "Thermal insulation required. Priority dispatch.",
    loadingBay: "Bay 2 (Cold Dock)",
  });

  const savePickups = (updated: PickupSlot[]) => {
    setPickups(updated);
    try {
      localStorage.setItem("annasetu_pickup_calendar", JSON.stringify(updated));
    } catch {}
  };

  const handleCreatePickup = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: PickupSlot = {
      id: `pk-${Date.now()}`,
      date: formData.date,
      time: formData.time,
      ngoName: formData.ngoName,
      ngoContact:
        REGISTERED_NGOS.find((n) => n.name === formData.ngoName)?.contact || "+91 98110 00000",
      driverName: formData.driverName,
      driverPhone: formData.driverPhone,
      vehicleType: formData.vehicleType,
      vehiclePlate: formData.vehiclePlate,
      surplusLot: formData.surplusLot,
      estimatedKg: Number(formData.estimatedKg) || 25,
      category: formData.category,
      status: "scheduled",
      notes: formData.notes,
      gatePassId: `GP-${formData.date.replace(/-/g, "")}-${Math.floor(10 + Math.random() * 90)}`,
      loadingBay: formData.loadingBay,
    };

    const next = [newSlot, ...pickups];
    savePickups(next);
    setIsScheduleOpen(false);
    setSelectedDate(formData.date);
    toast.success(`Pickup scheduled for ${formData.ngoName}!`, {
      description: `${newSlot.estimatedKg} kg of ${newSlot.category} allocated on ${newSlot.date} at ${newSlot.time}.`,
    });
  };

  const handleUpdateStatus = (id: string, newStatus: PickupSlot["status"]) => {
    const next = pickups.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
    savePickups(next);
    toast.success(`Pickup status updated to "${newStatus.toUpperCase()}"`);
  };

  const handleDeletePickup = (id: string) => {
    const next = pickups.filter((p) => p.id !== id);
    savePickups(next);
    toast.info("Pickup cancelled and slot released.");
  };

  const stats = useMemo(() => {
    const totalPickups = pickups.length;
    const totalKg = pickups.reduce((acc, p) => acc + p.estimatedKg, 0);
    const completedCount = pickups.filter((p) => p.status === "completed").length;
    const coldChainCount = pickups.filter(
      (p) => p.vehicleType.includes("Refrigerated") || p.vehicleType.includes("Insulated")
    ).length;
    const coldChainRate = totalPickups ? Math.round((coldChainCount / totalPickups) * 100) : 0;
    return { totalPickups, totalKg, completedCount, coldChainRate };
  }, [pickups]);

  const calendarDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    for (let d = 27; d <= 30; d++) {
      days.push({ dateStr: `2026-09-${d}`, dayNum: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= 31; d++) {
      const pad = d < 10 ? `0${d}` : `${d}`;
      days.push({ dateStr: `2026-10-${pad}`, dayNum: d, isCurrentMonth: true });
    }
    for (let d = 1; d <= 7; d++) {
      days.push({ dateStr: `2026-11-0${d}`, dayNum: d, isCurrentMonth: false });
    }
    return days;
  }, []);

  const selectedDayPickups = useMemo(() => {
    return pickups
      .filter((p) => p.date === selectedDate)
      .filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (vehicleFilter === "cold" && !p.vehicleType.includes("Refrigerated") && !p.vehicleType.includes("Insulated")) return false;
        if (vehicleFilter === "standard" && (p.vehicleType.includes("Refrigerated") || p.vehicleType.includes("Insulated"))) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return p.ngoName.toLowerCase().includes(q) || p.surplusLot.toLowerCase().includes(q) || p.driverName.toLowerCase().includes(q);
        }
        return true;
      });
  }, [pickups, selectedDate, statusFilter, vehicleFilter, searchQuery]);

  const selectedDayForecast = INITIAL_FORECASTS[selectedDate];
  const selectedDayTotalCapacity = useMemo(() => {
    return pickups.filter((p) => p.date === selectedDate).reduce((acc, p) => acc + p.estimatedKg, 0);
  }, [pickups, selectedDate]);

  const getStatusBadge = (status: PickupSlot["status"]) => {
    switch (status) {
      case "scheduled":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"><Clock className="size-3" /> Scheduled</span>;
      case "in-transit":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 animate-pulse"><Truck className="size-3" /> In Transit</span>;
      case "completed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"><CheckCircle2 className="size-3" /> Completed</span>;
      case "delayed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"><AlertCircle className="size-3" /> Delayed</span>;
    }
  };

  return (
    <DashboardLayout
      title="Batch Pickup Calendar"
      subtitle="Coordinating NGO collection slots with surplus forecast peaks and cold-chain logistics"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
              <span>Monthly Pickups</span>
              <CalendarIcon className="size-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{stats.totalPickups}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              <span className="text-emerald-600 font-semibold">{stats.completedCount}</span> successfully executed
            </p>
          </Card>

          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
              <span>Scheduled Rescue</span>
              <Truck className="size-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{stats.totalKg.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">kg</span></div>
            <p className="text-[11px] text-muted-foreground mt-1">
              ~{(stats.totalKg * 2.8).toFixed(0)} meals redirected to shelters
            </p>
          </Card>

          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
              <span>Cold-Chain Guard</span>
              <ThermometerSnowflake className="size-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{stats.coldChainRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Insulated & active refrigeration
            </p>
          </Card>

          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
              <span>Partner Fleet</span>
              <Users className="size-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{REGISTERED_NGOS.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active verified redistribution NGOs
            </p>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                October 2026
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Active Dispatch Hub
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Showing scheduled NGO dispatches aligned with kitchen surplus peaks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDate("2026-10-07")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                selectedDate === "2026-10-07"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-background border-border hover:bg-muted"
              )}
            >
              Today (Oct 7)
            </button>
            <div className="flex items-center border border-border rounded-lg bg-background p-0.5">
              <button
                aria-label="Previous month"
                className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                onClick={() => toast.info("Archive viewing disabled in demo mode")}
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-2 text-xs font-medium text-foreground">Oct 2026</span>
              <button
                aria-label="Next month"
                className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                onClick={() => toast.info("Future month schedule opens on Oct 25")}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, date: selectedDate }));
                setIsScheduleOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Plus className="size-4" />
              Schedule Batch Pickup
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-muted-foreground pb-2 border-b border-border/60 mb-2">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((cell) => {
                  const isSelected = cell.dateStr === selectedDate;
                  const isToday = cell.dateStr === "2026-10-07";
                  const dayPickups = pickups.filter((p) => p.date === cell.dateStr);
                  const forecast = INITIAL_FORECASTS[cell.dateStr];
                  const totalKgBooked = dayPickups.reduce((acc, p) => acc + p.estimatedKg, 0);

                  return (
                    <button
                      key={cell.dateStr}
                      onClick={() => setSelectedDate(cell.dateStr)}
                      className={cn(
                        "relative min-h-[92px] p-2 rounded-xl text-left border transition-all flex flex-col justify-between group",
                        cell.isCurrentMonth
                          ? "bg-background/80 hover:bg-accent/40"
                          : "bg-muted/20 text-muted-foreground/40 border-transparent opacity-50",
                        isSelected
                          ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                          : "border-border/60 hover:border-border",
                        isToday && !isSelected && "border-emerald-500/50 bg-emerald-500/[0.03]"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={cn(
                            "text-xs font-semibold size-6 flex items-center justify-center rounded-full",
                            isToday
                              ? "bg-emerald-600 text-white font-bold"
                              : isSelected
                              ? "bg-foreground text-background font-bold"
                              : "text-foreground"
                          )}
                        >
                          {cell.dayNum}
                        </span>
                        {forecast && (
                          <span
                            className={cn(
                              "text-[10px] font-medium px-1.5 py-0.5 rounded",
                              forecast.forecastKg >= 80
                                ? "bg-rose-500/10 text-rose-600 font-bold"
                                : forecast.forecastKg >= 50
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-emerald-500/10 text-emerald-600"
                            )}
                            title={`Predicted Surplus: ${forecast.forecastKg} kg`}
                          >
                            ⚡{forecast.forecastKg}k
                          </span>
                        )}
                      </div>

                      <div className="mt-1 space-y-1 w-full">
                        {dayPickups.length > 0 ? (
                          <div className="space-y-1">
                            {dayPickups.slice(0, 2).map((p) => (
                              <div
                                key={p.id}
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1",
                                  p.status === "completed"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    : p.status === "in-transit"
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                    : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                )}
                              >
                                <Truck className="size-2.5 shrink-0" />
                                <span className="truncate">{p.ngoName.split("—")[0]}</span>
                              </div>
                            ))}
                            {dayPickups.length > 2 && (
                              <div className="text-[9px] text-muted-foreground font-semibold px-1">
                                +{dayPickups.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : forecast && forecast.forecastKg > 0 ? (
                          <div className="text-[10px] text-muted-foreground/60 italic flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-amber-400 inline-block" />
                            No pickup
                          </div>
                        ) : null}
                      </div>

                      {forecast && (
                        <div className="w-full mt-1">
                          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                totalKgBooked >= forecast.forecastKg
                                  ? "bg-emerald-500"
                                  : totalKgBooked > 0
                                  ? "bg-amber-500"
                                  : "bg-transparent"
                              )}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((totalKgBooked / forecast.forecastKg) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-blue-500" />
                    <span>Scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span>In Transit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Completed</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span>⚡ Predicted Surplus Volume</span>
                  <span className="text-muted-foreground/40">|</span>
                  <span>Progress Bar: Reserved Capacity</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <Card className="p-4 shadow-sm border-border">
              <div className="flex items-start justify-between pb-3 border-b border-border/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h3>
                    {selectedDate === "2026-10-07" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedDayPickups.length} scheduled batch pickups on dock schedule
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, date: selectedDate }));
                    setIsScheduleOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Plus className="size-3.5" /> Slot
                </button>
              </div>

              {selectedDayForecast && (
                <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <Sparkles className="size-3.5 text-amber-500" />
                      Predicted Surplus:
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedDayForecast.forecastKg} kg ({selectedDayForecast.peakCategory})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <PackageCheck className="size-3.5 text-emerald-500" />
                      Allocated NGO Capacity:
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        selectedDayTotalCapacity >= selectedDayForecast.forecastKg
                          ? "text-emerald-600"
                          : "text-amber-600"
                      )}
                    >
                      {selectedDayTotalCapacity} kg (
                      {Math.round(
                        (selectedDayTotalCapacity / selectedDayForecast.forecastKg) * 100
                      )}
                      %)
                    </span>
                  </div>

                  <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border/40">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        selectedDayTotalCapacity >= selectedDayForecast.forecastKg
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      )}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (selectedDayTotalCapacity / selectedDayForecast.forecastKg) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  {selectedDayTotalCapacity < selectedDayForecast.forecastKg && (
                    <div className="flex items-center justify-between text-[11px] pt-1 text-amber-700 dark:text-amber-400">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="size-3" />
                        {selectedDayForecast.forecastKg - selectedDayTotalCapacity} kg unassigned
                      </span>
                      <button
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            date: selectedDate,
                            estimatedKg: selectedDayForecast.forecastKg - selectedDayTotalCapacity,
                          }));
                          setIsScheduleOpen(true);
                        }}
                        className="underline hover:text-amber-800 font-semibold"
                      >
                        Auto-Book NGO →
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search NGO or lot..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-transit">In Transit</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {selectedDayPickups.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-border rounded-xl">
                    <Truck className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold">No Pickups for this Date</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                      No NGO dispatch collection is currently scheduled for {selectedDate}.
                    </p>
                    <button
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, date: selectedDate }));
                        setIsScheduleOpen(true);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      <Plus className="size-3.5" /> Book Pickup Slot
                    </button>
                  </div>
                ) : (
                  selectedDayPickups.map((slot) => (
                    <div
                      key={slot.id}
                      className="border border-border rounded-xl p-3.5 bg-background hover:border-emerald-500/40 transition-all shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs bg-muted px-2 py-0.5 rounded border border-border flex items-center gap-1">
                            <Clock className="size-3 text-muted-foreground" />
                            {slot.time}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600">
                            {slot.loadingBay}
                          </span>
                        </div>
                        {getStatusBadge(slot.status)}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
                          <span>{slot.ngoName}</span>
                          <span className="text-xs font-bold text-emerald-600">{slot.estimatedKg} kg</span>
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <Truck className="size-3 shrink-0" />
                          <span>{slot.vehicleType}</span>
                          <span className="font-mono text-[11px] bg-muted/60 px-1 rounded">
                            {slot.vehiclePlate}
                          </span>
                        </p>
                      </div>

                      <div className="text-xs p-2 rounded bg-muted/30 border border-border/50">
                        <p className="font-medium text-foreground truncate">{slot.surplusLot}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Driver: {slot.driverName} ({slot.driverPhone})
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between border-t border-border/50 text-xs">
                        <button
                          onClick={() => setSelectedGatePass(slot)}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          <QrCode className="size-3.5" /> Gate Pass
                        </button>

                        <div className="flex items-center gap-2">
                          {slot.status === "scheduled" && (
                            <button
                              onClick={() => handleUpdateStatus(slot.id, "in-transit")}
                              className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium hover:bg-amber-500/20"
                            >
                              Dispatch
                            </button>
                          )}
                          {slot.status === "in-transit" && (
                            <button
                              onClick={() => handleUpdateStatus(slot.id, "completed")}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-500/20"
                            >
                              Confirm Delivery
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePickup(slot.id)}
                            className="text-muted-foreground hover:text-rose-600"
                            title="Cancel pickup"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="size-5 text-emerald-600" />
                Schedule NGO Batch Pickup
              </DialogTitle>
              <DialogDescription>
                Coordinate collection times with registered NGO fleets and reserve loading dock bays.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePickup} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Pickup Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Assigned NGO Partner</label>
                <select
                  value={formData.ngoName}
                  onChange={(e) => {
                    const sel = REGISTERED_NGOS.find((n) => n.name === e.target.value);
                    setFormData({
                      ...formData,
                      ngoName: e.target.value,
                      vehicleType: (sel?.defaultVehicle as PickupSlot["vehicleType"]) || formData.vehicleType,
                    });
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {REGISTERED_NGOS.map((n) => (
                    <option key={n.name} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Surplus Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as PickupSlot["category"] })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Cooked Meal">Cooked Meal (Hot/Cold)</option>
                    <option value="Produce">Produce / Raw Veg & Fruits</option>
                    <option value="Bakery">Bakery & Breads</option>
                    <option value="Dairy">Dairy & Marinated</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Volume (kg)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={formData.estimatedKg}
                    onChange={(e) => setFormData({ ...formData, estimatedKg: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Surplus Batch Title / Lot</label>
                <input
                  type="text"
                  required
                  value={formData.surplusLot}
                  onChange={(e) => setFormData({ ...formData, surplusLot: e.target.value })}
                  placeholder="e.g. Afternoon Buffet Rice & Mixed Vegetable Curry"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleType: e.target.value as PickupSlot["vehicleType"],
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Refrigerated Van (-4°C)">Refrigerated Van (-4°C)</option>
                    <option value="Insulated Electric Van">Insulated Electric Van</option>
                    <option value="Standard Cargo Van">Standard Cargo Van</option>
                    <option value="3-Wheeler Cargo">3-Wheeler Cargo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Vehicle Reg / Plate</label>
                  <input
                    type="text"
                    required
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Driver Name</label>
                  <input
                    type="text"
                    required
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Driver Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Assigned Loading Bay</label>
                <select
                  value={formData.loadingBay}
                  onChange={(e) => setFormData({ ...formData, loadingBay: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Bay 1 (Dry Dock)">Bay 1 (Dry Dock — Bakery & Produce)</option>
                  <option value="Bay 2 (Cold Dock)">Bay 2 (Cold Dock — Meals & Dairy)</option>
                  <option value="Bay 3 (Express)">Bay 3 (Express — Quick Curbside Dispatch)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  Confirm & Generate Gate Pass
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedGatePass} onOpenChange={() => setSelectedGatePass(null)}>
          <DialogContent className="max-w-md">
            {selectedGatePass && (
              <div>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="size-5 text-emerald-600" />
                      AnnaSetu Security Gate Pass
                    </span>
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded">
                      {selectedGatePass.gatePassId}
                    </span>
                  </DialogTitle>
                  <DialogDescription>
                    Official facility clearance token for food safety and loading bay security.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 p-4 rounded-xl border border-dashed border-border bg-muted/20 space-y-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border shadow-xs text-slate-900">
                    <div className="size-32 bg-slate-100 flex items-center justify-center rounded border border-slate-200">
                      <QrCode className="size-24 text-slate-800" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-2 font-semibold tracking-wider">
                      AUTH-HASH: {selectedGatePass.gatePassId}-VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Authorized NGO:</p>
                      <p className="font-semibold text-foreground">{selectedGatePass.ngoName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Authorized Bay:</p>
                      <p className="font-semibold text-emerald-600">{selectedGatePass.loadingBay}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vehicle Reg:</p>
                      <p className="font-mono font-semibold">{selectedGatePass.vehiclePlate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Driver:</p>
                      <p className="font-semibold">{selectedGatePass.driverName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Allocated Lot:</p>
                      <p className="font-semibold">{selectedGatePass.surplusLot}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volume Approved:</p>
                      <p className="font-bold text-emerald-600">{selectedGatePass.estimatedKg} kg</p>
                    </div>
                  </div>

                  <div className="text-[11px] p-2 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                    🛡️ Verified under Food Safety & Standard Act. Cold-chain integrity guaranteed upon exit.
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      toast.success("Gate pass sent to driver phone via SMS / WhatsApp!");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    <Phone className="size-3.5" /> SMS Driver Pass
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted font-medium"
                    >
                      <Printer className="size-3.5" /> Print
                    </button>
                    <button
                      onClick={() => setSelectedGatePass(null)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

