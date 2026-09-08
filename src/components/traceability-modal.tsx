import { useState, useEffect } from "react";
import {
  X,
  QrCode as QrIcon,
  ShieldCheck,
  ThermometerSnowflake,
  FileCheck2,
  History,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Truck,
  UserCheck,
  Tag,
  Check,
  Flame,
  Camera,
  Upload,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  TraceableBatch,
  COMMON_ALLERGENS,
  BatchStatus,
} from "@/lib/traceability-data";
import { QRCodeView } from "@/components/qr-code";
import { SignaturePad } from "@/components/signature-pad";
import { toast } from "sonner";

interface TraceabilityModalProps {
  batch: TraceableBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBatch: (updated: TraceableBatch) => void;
  allBatches?: TraceableBatch[] | undefined;
  onSelectBatch?: ((batch: TraceableBatch) => void) | undefined;
}

type ModalTab = "label" | "coldchain" | "pod" | "audit";

export function TraceabilityModal({
  batch,
  isOpen,
  onClose,
  onUpdateBatch,
  allBatches = [],
  onSelectBatch,
}: TraceabilityModalProps) {
  if (!isOpen || !batch) return null;

  const [activeTab, setActiveTab] = useState<ModalTab>("label");

  // Local state for POD form
  const [recipientName, setRecipientName] = useState(
    batch.proofOfDelivery.recipientName || batch.matchedPartner.contactPerson,
  );
  const [recipientDesignation, setRecipientDesignation] = useState(
    batch.proofOfDelivery.recipientDesignation || "Operations Lead",
  );
  const [otpInput, setOtpInput] = useState(
    batch.proofOfDelivery.otpVerified ? (batch.proofOfDelivery.otpCode || "") : "",
  );
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(
    batch.proofOfDelivery.signatureUrl,
  );
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    batch.proofOfDelivery.photoProofUrl,
  );
  const [deliveryNotes, setDeliveryNotes] = useState(
    batch.proofOfDelivery.deliveryNotes || "",
  );

  // Local state for cold chain checklist
  const [checklist, setChecklist] = useState(batch.checklist);
  const [newTempC, setNewTempC] = useState<string>("");
  const [tempStage, setTempStage] = useState<"inTransit" | "delivery">("inTransit");
  const [tempNotes, setTempNotes] = useState<string>("");

  // Sync state whenever batch changes
  useEffect(() => {
    if (!batch) return;
    setRecipientName(batch.proofOfDelivery.recipientName || batch.matchedPartner.contactPerson);
    setRecipientDesignation(batch.proofOfDelivery.recipientDesignation || "Operations Lead");
    setOtpInput(batch.proofOfDelivery.otpVerified ? (batch.proofOfDelivery.otpCode || "") : "");
    setSignatureUrl(batch.proofOfDelivery.signatureUrl);
    setPhotoUrl(batch.proofOfDelivery.photoProofUrl);
    setDeliveryNotes(batch.proofOfDelivery.deliveryNotes || "");
    setChecklist(batch.checklist);
  }, [batch?.id]);

  const handlePrintLabel = () => {
    window.print();
  };

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    if (typeof checklist[key] === "boolean") {
      const updated = { ...checklist, [key]: !checklist[key] };
      setChecklist(updated);

      const updatedBatch: TraceableBatch = {
        ...batch,
        checklist: updated,
        auditTrail: [
          ...batch.auditTrail,
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actor: "Current User",
            role: "Food Safety Officer",
            action: `Checklist Updated: ${String(key)}`,
            details: `Status set to ${!checklist[key] ? "PASSED" : "FAILED"}`,
            hash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
          },
        ],
      };
      onUpdateBatch(updatedBatch);
      toast.success("Food safety checklist updated");
    }
  };

  const handleLogTemp = (e: React.FormEvent) => {
    e.preventDefault();
    const temp = parseFloat(newTempC);
    if (isNaN(temp)) {
      toast.error("Please enter a valid temperature value");
      return;
    }

    const passed = temp >= 60 || temp <= 5; // Safe if hot (>60C) or chilled (<5C)
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const updatedBatch: TraceableBatch = {
      ...batch,
      temperatureStages: {
        ...batch.temperatureStages,
        [tempStage]: {
          tempC: temp,
          time,
          passed,
          notes: tempNotes || (passed ? "Within safe critical limits" : "WARNING: Temperature in danger zone (5°C - 60°C)"),
        },
      },
      auditTrail: [
        ...batch.auditTrail,
        {
          id: `aud-${Date.now()}`,
          timestamp: time,
          actor: "Current User",
          role: "Cold-Chain Monitor",
          action: `Logged ${tempStage === "inTransit" ? "In-Transit" : "Delivery"} Temperature`,
          details: `Recorded ${temp}°C (${passed ? "Safe Zone" : "Danger Zone Alert!"})`,
          hash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        },
      ],
    };

    onUpdateBatch(updatedBatch);
    setNewTempC("");
    setTempNotes("");
    toast.success(`Temperature logged: ${temp}°C`);
  };

  const handleCompletePOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureUrl) {
      toast.error("Recipient signature is required to complete delivery");
      return;
    }

    const isOtpCorrect = !batch.proofOfDelivery.otpCode || otpInput.trim() === batch.proofOfDelivery.otpCode;
    if (!isOtpCorrect) {
      toast.error(`Invalid OTP. Please enter the correct handover code (${batch.proofOfDelivery.otpCode || "4829"})`);
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const updatedBatch: TraceableBatch = {
      ...batch,
      status: "Delivered & Verified",
      proofOfDelivery: {
        ...batch.proofOfDelivery,
        recipientName,
        recipientDesignation,
        signatureUrl,
        photoProofUrl: photoUrl || batch.proofOfDelivery.photoProofUrl,
        otpVerified: true,
        deliveredAt: `Today, ${time}`,
        deliveryNotes: deliveryNotes || "Signed & verified handover at destination.",
      },
      auditTrail: [
        ...batch.auditTrail,
        {
          id: `aud-${Date.now()}`,
          timestamp: time,
          actor: recipientName || "NGO Recipient",
          role: "Authorized Receiver",
          action: "Proof of Delivery Signed & Verified",
          details: `Digital POD confirmed with OTP #${otpInput || batch.proofOfDelivery.otpCode}. Status updated to Delivered.`,
          hash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        },
      ],
    };

    onUpdateBatch(updatedBatch);
    toast.success("Proof of Delivery verified and recorded in Audit Trail!");
  };

  const handleSimulatePhoto = () => {
    const samplePhotos = [
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
    ];
    const chosen = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setPhotoUrl(chosen);
    toast.success("Recipient handover photo attached!");
  };

  // QR Code Payload (compact JSON for scanner apps)
  const qrPayload = JSON.stringify({
    app: "AnnaSetu",
    batchId: batch.id,
    item: batch.itemName,
    qty: `${batch.quantityKg}kg`,
    servings: batch.servingsCount,
    prepared: batch.preparedAt,
    bestBefore: batch.bestBefore,
    allergens: batch.allergens,
    temp: batch.targetHoldingTemp,
    partner: batch.matchedPartner.name,
    verifyUrl: `https://annasetu.org/verify/${batch.id}`,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/60 p-3 backdrop-blur-sm sm:p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Batch Selector Dropdown if multiple batches exist */}
            {allBatches.length > 1 && onSelectBatch ? (
              <div className="flex items-center gap-1.5 no-print">
                <select
                  value={batch.id}
                  onChange={(e) => {
                    const found = allBatches.find((b) => b.id === e.target.value);
                    if (found) onSelectBatch(found);
                  }}
                  className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  title="Switch between food donation batches"
                >
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-card text-foreground font-normal">
                      {b.id} — {b.itemName} ({b.quantityKg}kg)
                    </option>
                  ))}
                </select>

                {/* Prev / Next controls */}
                <div className="flex items-center border border-border rounded-lg bg-background">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = allBatches.findIndex((b) => b.id === batch.id);
                      if (idx > 0) onSelectBatch(allBatches[idx - 1]!);
                    }}
                    disabled={allBatches.findIndex((b) => b.id === batch.id) === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Previous Food Batch"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = allBatches.findIndex((b) => b.id === batch.id);
                      if (idx < allBatches.length - 1) onSelectBatch(allBatches[idx + 1]!);
                    }}
                    disabled={allBatches.findIndex((b) => b.id === batch.id) === allBatches.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Next Food Batch"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                {batch.id}
              </span>
            )}

            <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              {batch.itemName}
            </h2>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {batch.dietaryType}
            </span>
            <span className="rounded-md bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {batch.quantityKg} kg ({batch.servingsCount} servings)
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrintLabel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent no-print"
              title="Print Dispatch Label"
            >
              <Printer className="size-3.5" /> Print Label
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground no-print"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-muted/30 px-5 text-sm font-medium no-print">
          <button
            type="button"
            onClick={() => setActiveTab("label")}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors ${
              activeTab === "label"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrIcon className="size-4" /> Batch QR & Dispatch Label
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("coldchain")}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors ${
              activeTab === "coldchain"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ThermometerSnowflake className="size-4" /> Cold-Chain & Safety Checklist
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pod")}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors ${
              activeTab === "pod"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck2 className="size-4" /> Proof of Delivery (POD)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors ${
              activeTab === "audit"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="size-4" /> Immutable Audit Trail
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          
          {/* TAB 1: BATCH QR & DISPATCH LABEL */}
          {activeTab === "label" && (
            <div className="space-y-6">
              {/* Printable Dispatch Label Box */}
              <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          AnnaSetu Verified Food Rescue Batch
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          FSSAI Safety Grade A
                        </span>
                      </div>
                      <h3 className="mt-1 text-2xl font-bold text-foreground">
                        {batch.itemName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Source: <span className="font-medium text-foreground">{batch.donorSource}</span> · Supervisor: <span className="font-medium text-foreground">{batch.donorSupervisor}</span>
                      </p>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-accent/60 p-2.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Prepared Time</p>
                        <p className="text-xs font-semibold">{batch.preparedAt}</p>
                      </div>
                      <div className="rounded-lg bg-accent/60 p-2.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Safe Window</p>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {batch.bestBefore}
                        </p>
                      </div>
                      <div className="rounded-lg bg-accent/60 p-2.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Required Temp</p>
                        <p className="text-xs font-semibold">{batch.targetHoldingTemp}</p>
                      </div>
                    </div>

                    {/* Allergens & Dietary Declaration */}
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        ⚠️ Mandatory Allergen & Dietary Declaration:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {batch.allergens.map((allergen) => (
                          <span
                            key={allergen}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300"
                          >
                            <Tag className="size-3" /> {allergen}
                          </span>
                        ))}
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          <Check className="size-3" /> {batch.dietaryType}
                        </span>
                      </div>
                    </div>

                    {/* Reheating & Safe Handling */}
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                      <p className="font-semibold text-amber-900 dark:text-amber-200">
                        🍲 Handling & Reheating Instructions:
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {batch.reheatingInstructions}
                      </p>
                    </div>

                    {/* Matched NGO Destination */}
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                      <MapPin className="size-5 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">
                          Destination: {batch.matchedPartner.name} ({batch.matchedPartner.type})
                        </p>
                        <p className="text-muted-foreground">
                          Contact: {batch.matchedPartner.contactPerson} · {batch.matchedPartner.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scannable QR Code */}
                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-4 dark:bg-slate-900 shrink-0">
                    <p className="mb-2 text-center text-xs font-bold text-foreground">
                      Scan to Verify Chain of Custody
                    </p>
                    <QRCodeView value={qrPayload} size={160} fileName={`batch-${batch.id}`} />
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      ID: {batch.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COLD-CHAIN & SAFETY CHECKLIST */}
          {activeTab === "coldchain" && (
            <div className="space-y-6">
              {/* Temperature Stages Timeline */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="text-sm font-bold text-foreground">
                  Multi-Stage Cold-Chain Temperature Log
                </h4>
                <p className="text-xs text-muted-foreground">
                  Target holding parameter: <span className="font-semibold text-primary">{batch.targetHoldingTemp}</span>
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {/* Stage 1 */}
                  <div className={`rounded-xl border p-4 ${batch.temperatureStages.packaging.passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">1. Packaging / Kitchen</span>
                      {batch.temperatureStages.packaging.passed ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="size-4 text-rose-600" />
                      )}
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      {batch.temperatureStages.packaging.tempC}°C
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {batch.temperatureStages.packaging.time} · {batch.temperatureStages.packaging.notes}
                    </p>
                  </div>

                  {/* Stage 2 */}
                  <div className={`rounded-xl border p-4 ${batch.temperatureStages.inTransit ? (batch.temperatureStages.inTransit.passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5") : "border-border bg-muted/20"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">2. In-Transit Van</span>
                      {batch.temperatureStages.inTransit && (batch.temperatureStages.inTransit.passed ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="size-4 text-rose-600" />
                      ))}
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      {batch.temperatureStages.inTransit ? `${batch.temperatureStages.inTransit.tempC}°C` : "Pending log"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {batch.temperatureStages.inTransit ? `${batch.temperatureStages.inTransit.time} · ${batch.temperatureStages.inTransit.notes}` : "Awaiting mid-route IoT sensor sync"}
                    </p>
                  </div>

                  {/* Stage 3 */}
                  <div className={`rounded-xl border p-4 ${batch.temperatureStages.delivery ? (batch.temperatureStages.delivery.passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5") : "border-border bg-muted/20"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">3. Receiving Drop Point</span>
                      {batch.temperatureStages.delivery && (batch.temperatureStages.delivery.passed ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="size-4 text-rose-600" />
                      ))}
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      {batch.temperatureStages.delivery ? `${batch.temperatureStages.delivery.tempC}°C` : "Pending handover"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {batch.temperatureStages.delivery ? `${batch.temperatureStages.delivery.time} · ${batch.temperatureStages.delivery.notes}` : "Will be recorded at recipient signoff"}
                    </p>
                  </div>
                </div>

                {/* Log New Temperature Form */}
                <form onSubmit={handleLogTemp} className="mt-5 rounded-lg border border-border bg-accent/20 p-4">
                  <p className="text-xs font-semibold text-foreground">
                    Record New Temperature Reading
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <select
                      value={tempStage}
                      onChange={(e) => setTempStage(e.target.value as any)}
                      className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-medium"
                    >
                      <option value="inTransit">In-Transit Stage</option>
                      <option value="delivery">Destination Handover Stage</option>
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Temp in °C (e.g. 64.5)"
                      value={newTempC}
                      onChange={(e) => setNewTempC(e.target.value)}
                      className="w-36 rounded-lg border border-input bg-card px-3 py-1.5 text-xs"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      className="flex-1 min-w-40 rounded-lg border border-input bg-card px-3 py-1.5 text-xs"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Save Temp Log
                    </button>
                  </div>
                </form>
              </div>

              {/* Mandatory Checklist */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Mandatory Food Safety Checklist
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Verified by: <span className="font-semibold">{batch.checklist.verifiedBy}</span> at {batch.checklist.verifiedAt}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="size-4" /> Ready for Dispatch
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-xs hover:bg-accent/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.packagingIntact}
                      onChange={() => handleToggleChecklist("packagingIntact")}
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-semibold text-foreground">Packaging Integrity & Tamper Seals Verified</p>
                      <p className="text-muted-foreground">No spills, tears, or broken container locks detected.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-xs hover:bg-accent/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.temperatureInSafeZone}
                      onChange={() => handleToggleChecklist("temperatureInSafeZone")}
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-semibold text-foreground">Critical Temperature Zone Compliance</p>
                      <p className="text-muted-foreground">Core temperature is outside the microbial danger zone (5°C – 60°C).</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-xs hover:bg-accent/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.foodGradeContainers}
                      onChange={() => handleToggleChecklist("foodGradeContainers")}
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-semibold text-foreground">Food-Grade Insulated Transport Containers</p>
                      <p className="text-muted-foreground">Inspected and sanitized prior to meal loading.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-xs hover:bg-accent/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.vehicleCleanAndInsulated}
                      onChange={() => handleToggleChecklist("vehicleCleanAndInsulated")}
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-semibold text-foreground">Vehicle Cleanliness & Cold-Chain Capacity</p>
                      <p className="text-muted-foreground">Logistics partner complies with safe food transport guidelines.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROOF OF DELIVERY (POD) */}
          {activeTab === "pod" && (
            <div className="space-y-6">
              {batch.status === "Delivered & Verified" && batch.proofOfDelivery.signatureUrl ? (
                // Verified POD Summary Card
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="size-6 text-emerald-600" />
                    <div>
                      <h4 className="text-base font-bold">Delivery Successfully Verified & Signed</h4>
                      <p className="text-xs text-muted-foreground">
                        Delivered on: <span className="font-semibold text-foreground">{batch.proofOfDelivery.deliveredAt}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs font-semibold text-muted-foreground">Receiver Information</p>
                      <p className="mt-1 text-sm font-bold text-foreground">{batch.proofOfDelivery.recipientName}</p>
                      <p className="text-xs text-muted-foreground">{batch.proofOfDelivery.recipientDesignation} · {batch.proofOfDelivery.recipientPhone}</p>
                      <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                        ✓ OTP Verified #{batch.proofOfDelivery.otpCode}
                      </p>
                      {batch.proofOfDelivery.deliveryNotes && (
                        <p className="mt-2 text-xs italic text-muted-foreground border-t pt-2">
                          "{batch.proofOfDelivery.deliveryNotes}"
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs font-semibold text-muted-foreground">Digital Signature</p>
                      <div className="mt-2 flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 dark:bg-slate-900 p-2">
                        <img
                          src={batch.proofOfDelivery.signatureUrl}
                          alt="Recipient signature"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {batch.proofOfDelivery.photoProofUrl && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Attached Photo Proof</p>
                      <img
                        src={batch.proofOfDelivery.photoProofUrl}
                        alt="Proof of Handover"
                        className="h-44 w-full rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                // Digital POD Handover Form
                <form onSubmit={handleCompletePOD} className="space-y-5">
                  <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">
                        Digital Handover & Receiver Confirmation
                      </h4>
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        OTP Handover Code: {batch.proofOfDelivery.otpCode || "4829"}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-foreground">Recipient Name *</label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-xs"
                          placeholder="e.g. Anita Roy"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Role / Designation</label>
                        <input
                          type="text"
                          value={recipientDesignation}
                          onChange={(e) => setRecipientDesignation(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-xs"
                          placeholder="e.g. Shelter Supervisor"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground">
                        Enter Handover OTP (Provided to Driver/NGO) *
                      </label>
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="mt-1 w-full max-w-xs font-mono tracking-wider rounded-lg border border-input bg-card px-3 py-2 text-sm font-bold"
                        placeholder="Enter 4-digit code"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground">Delivery / Portion Notes</label>
                      <textarea
                        rows={2}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-xs"
                        placeholder="Notes on meal temperature, container return, or distribution count..."
                      />
                    </div>

                    {/* Signature Pad */}
                    <div className="pt-2">
                      <SignaturePad
                        recipientName={recipientName}
                        initialSignature={signatureUrl}
                        onSave={(url) => setSignatureUrl(url)}
                        onClear={() => setSignatureUrl(undefined)}
                      />
                    </div>

                    {/* Photo Proof Simulation */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Camera className="size-3.5 text-primary" /> Recipient Handover Photo Proof (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={handleSimulatePhoto}
                          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <Upload className="size-3" /> Simulate Photo Capture
                        </button>
                      </div>
                      {photoUrl ? (
                        <div className="mt-2 relative">
                          <img
                            src={photoUrl}
                            alt="Captured proof"
                            className="h-32 w-full rounded-lg object-cover border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotoUrl(undefined)}
                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          No photo attached. Driver or recipient can upload container photo.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                  >
                    Confirm Recipient Handover & Sign Off
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: IMMUTABLE AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Cryptographically Logged Chain of Custody
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    All events are timestamped and signed with digital hash verification.
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  Batch: {batch.id}
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:left-2.5 before:top-2 before:w-0.5 before:bg-border">
                {batch.auditTrail.map((entry, index) => (
                  <div key={entry.id} className="relative">
                    <span className="absolute -left-6 top-1 flex size-5 items-center justify-center rounded-full bg-primary ring-4 ring-card text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <p className="text-xs font-bold text-foreground">
                          {entry.action}
                        </p>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.details}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-[10px] text-muted-foreground">
                        <span>
                          Actor: <strong className="text-foreground">{entry.actor}</strong> ({entry.role})
                        </span>
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[9px]">
                          Hash: {entry.hash}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground no-print">
          <span>AnnaSetu Traceability Engine · ISO 22000 & FSSAI Compliant</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-secondary px-4 py-1.5 font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
