import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MapPin,
  Warehouse,
  Route as RouteIcon,
  Clock,
  Truck,
  QrCode as QrIcon,
  ShieldCheck,
  FileCheck2,
  ThermometerSnowflake,
  Plus,
  CheckCircle2,
  AlertCircle,
  Tag,
  PenLine,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, TableShell, Th, Td, StatusBadge } from "@/components/dashboard-ui";
import { useViewMode } from "@/components/view-mode";
import {
  INITIAL_BATCHES,
  TraceableBatch,
  BatchStatus,
} from "@/lib/traceability-data";
import { TraceabilityModal } from "@/components/traceability-modal";
import { LiveRouteMap } from "@/components/live-route-map";
import { toast } from "sonner";

export const Route = createFileRoute("/redistribution")({
  head: () => ({
    meta: [
      { title: "Redistribution & Traceability — AnnaSetu" },
      {
        name: "description",
        content:
          "End-to-end food safety, batch QR codes, cold-chain temperature logs, allergen declarations, and digital proof of delivery.",
      },
      { property: "og:title", content: "Redistribution & Traceability — AnnaSetu" },
      {
        property: "og:description",
        content: "Track food safety from kitchen dock to NGO recipient with digital proof of delivery.",
      },
    ],
  }),
  component: Redistribution,
});

function Redistribution() {
  const { data } = useViewMode();
  const [batches, setBatches] = useState<TraceableBatch[]>(INITIAL_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState<TraceableBatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenBatch = (batch: TraceableBatch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const handleUpdateBatch = (updated: TraceableBatch) => {
    setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBatch(updated);
  };

  const handleCreateNewBatch = () => {
    const newId = `AS-2026-K${100 + batches.length + 1}`;
    const newBatch: TraceableBatch = {
      id: newId,
      itemName: "Fresh Mixed Fruit & Custard",
      category: "Dairy & Desserts",
      dietaryType: "Vegetarian",
      quantityKg: 15,
      servingsCount: 40,
      donorSource: "Main Cafeteria Pantry",
      donorSupervisor: "Chef Raman Verma (ID #K-402)",
      preparedAt: "Just now",
      bestBefore: "Today, 06:00 PM (4 hr safe window)",
      expiryHoursLeft: 4.0,
      targetHoldingTemp: "Chilled < 4°C",
      temperatureStages: {
        packaging: { tempC: 3.8, time: "Just now", passed: true, notes: "Chilled in Cold Room 1" },
      },
      allergens: ["Dairy / Milk"],
      reheatingInstructions: "Keep continuously chilled below 4°C. Do not leave at room temperature.",
      checklist: {
        packagingIntact: true,
        temperatureInSafeZone: true,
        foodGradeContainers: true,
        vehicleCleanAndInsulated: true,
        verifiedBy: "QC Lead Meera Nair",
        verifiedAt: "Just now",
      },
      matchedPartner: {
        id: "ngo-5",
        name: "Hope Children Home",
        type: "Shelter",
        contactPerson: "David D'Souza",
        phone: "+91 98860 11223",
        address: "Austin Town, Bengaluru",
      },
      proofOfDelivery: {
        otpCode: "5912",
      },
      status: "Prepared & Logged",
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actor: "Chef Raman Verma",
          role: "Head Chef",
          action: "New Traceable Batch Registered",
          details: "15kg fruit custard logged with Cold-Chain Checklist & QR Code.",
          hash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        },
      ],
    };

    setBatches((prev) => [newBatch, ...prev]);
    setSelectedBatch(newBatch);
    setIsModalOpen(true);
    toast.success(`Batch ${newId} created with dynamic QR code!`);
  };

  const deliveredCount = batches.filter((b) => b.status === "Delivered & Verified").length;

  return (
    <DashboardLayout
      title="Redistribution & Traceability"
      subtitle="Batch QR tracking, cold-chain compliance, allergen safety and digital proof of delivery"
    >
      {/* Top Food-Safety & Traceability KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Traceability ID & QR</span>
            <QrIcon className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{batches.length} Batches</p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ 100% Generated with Digital Hash
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Cold-Chain Integrity</span>
            <ThermometerSnowflake className="size-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">Safe Zone</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Multi-stage temp logging active
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Allergen Safety</span>
            <ShieldCheck className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">FSSAI Grade A</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mandatory allergen disclosure
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Deliveries (POD)</span>
            <FileCheck2 className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {deliveredCount} / {batches.length} Completed
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Digital signature & OTP verified
          </p>
        </div>
      </div>

      {/* Main Grid: Logistics Route + Drop Points */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Live Logistics & Drop Points"
          description="Real-time multi-stop GPS routing powered by Leaflet & OpenStreetMap"
        >
          <LiveRouteMap />
        </Card>

        <Card title="Route Optimization & Fleet" description="Calibrated for thermal stability & fastest ETA">
          <ol className="space-y-3">
            {data.route.stops.map((stop, i) => (
              <li key={stop} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{stop}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <RouteIcon className="size-3" /> Distance
              </p>
              <p className="font-semibold">{data.route.distanceKm} km</p>
            </div>
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" /> Est. Transit Time
              </p>
              <p className="font-semibold">{data.route.minutes} min</p>
            </div>
            <div className="col-span-2 rounded-lg bg-muted/60 px-3 py-2">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Truck className="size-3" /> Assigned Fleet Unit
              </p>
              <p className="font-semibold">{data.route.vehicle} (Refrigerated)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Traceable Donation Batches Table */}
      <Card
        className="mt-4"
        title="Active Traceable Batches & Proof-of-Delivery"
        description="Click any batch to inspect QR code, verify cold chain, view allergens or record recipient signature"
        action={
          <button
            type="button"
            onClick={handleCreateNewBatch}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="size-4" /> Create Traceable Batch
          </button>
        }
      >
        <TableShell>
          <thead>
            <tr>
              <Th>Batch ID & QR</Th>
              <Th>Item & Category</Th>
              <Th>Quantity</Th>
              <Th>Matched Destination</Th>
              <Th>Cold-Chain Temp</Th>
              <Th>Allergens</Th>
              <Th>Status & Actions</Th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-accent/30 transition-colors">
                <Td>
                  <button
                    type="button"
                    onClick={() => handleOpenBatch(b)}
                    className="flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:underline"
                    title="View QR & Safety Details"
                  >
                    <QrIcon className="size-3.5 text-primary" />
                    {b.id}
                  </button>
                </Td>
                <Td>
                  <div>
                    <p className="font-semibold text-foreground text-xs">{b.itemName}</p>
                    <span className="inline-block mt-0.5 rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                      {b.dietaryType} · {b.category}
                    </span>
                  </div>
                </Td>
                <Td>
                  <span className="font-semibold text-xs">{b.quantityKg} kg</span>
                  <p className="text-[10px] text-muted-foreground">~{b.servingsCount} portions</p>
                </Td>
                <Td>
                  <div>
                    <p className="font-medium text-xs text-foreground">{b.matchedPartner.name}</p>
                    <p className="text-[10px] text-muted-foreground">{b.matchedPartner.contactPerson}</p>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {b.temperatureStages.packaging.tempC}°C
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({b.temperatureStages.delivery ? "Delivered" : b.temperatureStages.inTransit ? "In-Transit" : "Packed"})
                    </span>
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1 max-w-32">
                    {b.allergens.map((a) => (
                      <span
                        key={a}
                        className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-800 dark:text-amber-300"
                      >
                        {a.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        b.status === "Delivered & Verified"
                          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                          : b.status === "Dispatched & In-Transit"
                            ? "bg-sky-500/15 text-sky-800 dark:text-sky-300"
                            : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {b.status === "Delivered & Verified" ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <Clock className="size-3" />
                      )}
                      {b.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenBatch(b)}
                      className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent flex items-center gap-1"
                    >
                      {b.status === "Delivered & Verified" ? "View POD" : "Inspect / Sign"}
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>

      {/* Traceability Modal */}
      <TraceabilityModal
        batch={selectedBatch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateBatch={handleUpdateBatch}
        allBatches={batches}
        onSelectBatch={(b) => setSelectedBatch(b)}
      />
    </DashboardLayout>
  );
}
