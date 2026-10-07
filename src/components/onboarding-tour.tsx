import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ScanLine,
  Truck,
  Wifi,
  ChefHat,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface TourStep {
  title: string;
  badge: string;
  description: string;
  highlights: string[];
  to: string;
  toLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Real-Time Operations & Surplus Control",
    badge: "Step 1 of 5 · Overview",
    description:
      "AnnaSetu predicts surplus food across kitchens and processing units before it goes to waste. Real-time demand vs. consumption forecasting and cold-chain monitoring give your team actionable alerts.",
    highlights: [
      "Dynamic surplus predictions by line & time window",
      "Near-expiry urgency triage and smart mitigation alerts",
      "One-click switching between Kitchen & Processing views",
    ],
    to: "/dashboard",
    toLabel: "Go to Dashboard Overview",
    icon: Sparkles,
    accentColor: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "AI Vision Food Freshness Scanner",
    badge: "Step 2 of 5 · AI Vision",
    description:
      "Upload or capture fresh produce, cooked meals, or dairy. AnnaSetu inspects visual spoilage, assigns FSSAI grades (A through D), estimates remaining shelf-life, and triggers instant redistribution matching.",
    highlights: [
      "Real-time webcam or file upload analysis",
      "Visual bounding box detection & spoilage probability",
      "Automatic logging to Scan History with CSV exports",
    ],
    to: "/quality-scanner",
    toLabel: "Open AI Quality Scanner",
    icon: ScanLine,
    accentColor: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Live GPS Leaflet Redistribution Tracking",
    badge: "Step 3 of 5 · Logistics",
    description:
      "Track refrigerated vehicles live on an interactive map. Follow active drop points, inspect real-time temperature logs, and review verified digital delivery sign-offs.",
    highlights: [
      "Smooth simulated GPS route tracking with live speeds",
      "Active cold-chain telemetry (<4°C verified safe transit)",
      "Tamper-proof batch digital signatures & chain of custody",
    ],
    to: "/redistribution",
    toLabel: "View Redistribution Map",
    icon: Truck,
    accentColor: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
  },
  {
    title: "IoT Environmental Telemetry Feed",
    badge: "Step 4 of 5 · IoT Sensors",
    description:
      "Continuous telemetry from wireless temperature, humidity, and ethylene gas sensors located across deep-freezers, cold rooms, and ambient pantry racks.",
    highlights: [
      "Sub-second data updates and live signal status",
      "Ethylene gas spoilage alerts for ripening produce",
      "Automated warning triggers when thresholds are breached",
    ],
    to: "/iot-sensors",
    toLabel: "Inspect IoT Telemetry",
    icon: Wifi,
    accentColor: "from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400",
  },
  {
    title: "AI Menu Optimizer & Pickup Calendar",
    badge: "Step 5 of 5 · Circular Kitchen",
    description:
      "Turn surplus ingredients into zero-waste recipes before expiry! Coordinate NGO pickup slots, print gate passes, and celebrate your community impact on the leaderboard.",
    highlights: [
      "Generative culinary recipes for surplus batches",
      "Printable FSSAI batch pickup passes with QR verification",
      "Verified NGO partner network with instant dispatch",
    ],
    to: "/menu-optimizer",
    toLabel: "Explore AI Menu Optimizer",
    icon: ChefHat,
    accentColor: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400",
  },
];

export function OnboardingTour({
  forceOpen,
  onClose,
}: {
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
      return;
    }

    const hasSeenTour = localStorage.getItem("annasetu_tour_completed");
    if (!hasSeenTour) {
      // Small timeout so initial page renders cleanly first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleComplete = () => {
    localStorage.setItem("annasetu_tour_completed", "true");
    setIsOpen(false);
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className={`p-6 bg-gradient-to-br ${step.accentColor} border-b border-border/40 relative`}>
          <button
            type="button"
            onClick={handleComplete}
            className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/40 transition-colors"
            title="Skip tour"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-card/80 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-foreground border border-border/40">
              {step.badge}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-card shadow-md border border-border/60">
              <Icon className="size-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-tight">{step.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Welcome to AnnaSetu Zero-Waste Platform</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground/90 leading-relaxed">{step.description}</p>

          <div className="rounded-xl border border-border/70 bg-muted/40 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Capabilities</p>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              {step.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link
              to={step.to}
              onClick={handleComplete}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <span>{step.toLabel}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Footer controls & step dots */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/20">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                title={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="size-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-xs"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Step"}</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TourButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border border-border bg-card/80 hover:bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shadow-2xs ${className}`}
      title="Take Feature Tour"
    >
      <HelpCircle className="size-3.5 text-primary" />
      <span className="hidden sm:inline">Tour</span>
    </button>
  );
}
