import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  ScanLine,
  ClipboardList,
  ThermometerSnowflake,
  Truck,
  Users,
  CalendarDays,
  Wifi,
  ChefHat,
  Trophy,
  Leaf,
  SlidersHorizontal,
  History,
  Command,
  Sun,
  Moon,
  Compass,
  ArrowRight,
  X,
} from "lucide-react";
import { useTheme } from "@/components/theme-toggle";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: "Navigation" | "Quick Action" | "Intelligence";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({
  isOpen,
  onClose,
  onStartTour,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define commands
  const commands: CommandItem[] = useMemo(() => [
    {
      id: "nav-overview",
      title: "Dashboard Overview",
      description: "Mission control with surplus forecast and live metrics",
      category: "Navigation",
      icon: LayoutDashboard,
      action: () => {
        navigate({ to: "/dashboard" });
        onClose();
      },
      keywords: ["home", "main", "metrics", "stats"],
    },
    {
      id: "nav-scanner",
      title: "AI Vision Quality Scanner",
      description: "Scan batches with computer vision to inspect freshness",
      category: "Navigation",
      icon: ScanLine,
      action: () => {
        navigate({ to: "/quality-scanner" });
        onClose();
      },
      keywords: ["camera", "freshness", "grade", "inspect", "upload"],
    },
    {
      id: "nav-history",
      title: "Scan Audit History",
      description: "View past food quality scans and export CSV reports",
      category: "Navigation",
      icon: ClipboardList,
      action: () => {
        navigate({ to: "/scan-history" });
        onClose();
      },
      keywords: ["logs", "past scans", "records", "audit"],
    },
    {
      id: "nav-redistribution",
      title: "Redistribution & Live GPS Map",
      description: "Real-time dispatch route, cold-chain telemetry and drop points",
      category: "Navigation",
      icon: Truck,
      action: () => {
        navigate({ to: "/redistribution" });
        onClose();
      },
      keywords: ["map", "truck", "gps", "fleet", "delivery", "route", "leaflet"],
    },
    {
      id: "nav-calendar",
      title: "Batch Pickup Calendar",
      description: "Schedule NGO food pickups and print gate passes",
      category: "Navigation",
      icon: CalendarDays,
      action: () => {
        navigate({ to: "/pickup-calendar" });
        onClose();
      },
      keywords: ["schedule", "booking", "dispatch", "slots", "date"],
    },
    {
      id: "nav-ngos",
      title: "Verified NGO Registry",
      description: "Directory of beneficiary food banks and partner charities",
      category: "Navigation",
      icon: Users,
      action: () => {
        navigate({ to: "/ngo-registry" });
        onClose();
      },
      keywords: ["partners", "charity", "food bank", "beneficiaries"],
    },
    {
      id: "nav-sensors",
      title: "IoT Sensor Telemetry",
      description: "Live cold room temperature, humidity and ethylene gas feeds",
      category: "Intelligence",
      icon: Wifi,
      action: () => {
        navigate({ to: "/iot-sensors" });
        onClose();
      },
      keywords: ["temperature", "humidity", "sensors", "iot", "cold chain"],
    },
    {
      id: "nav-optimizer",
      title: "AI Menu Optimizer",
      description: "Smart repurposing recipes for surplus kitchen stock",
      category: "Intelligence",
      icon: ChefHat,
      action: () => {
        navigate({ to: "/menu-optimizer" });
        onClose();
      },
      keywords: ["recipes", "cooking", "repurpose", "prep sheet", "chef"],
    },
    {
      id: "nav-forecast",
      title: "Surplus & Demand Forecast",
      description: "Machine learning demand prediction and surplus mitigation",
      category: "Intelligence",
      icon: TrendingUp,
      action: () => {
        navigate({ to: "/surplus-forecast" });
        onClose();
      },
      keywords: ["prediction", "trends", "analytics", "surplus"],
    },
    {
      id: "nav-impact",
      title: "Impact Wall & Leaderboard",
      description: "Meals saved, carbon reduction and community hall of fame",
      category: "Intelligence",
      icon: Trophy,
      action: () => {
        navigate({ to: "/impact-wall" });
        onClose();
      },
      keywords: ["achievements", "leaderboard", "esg", "badges"],
    },
    {
      id: "nav-sustainability",
      title: "Sustainability ESG Report",
      description: "CO2e, water and landfill diversion metrics with certificate",
      category: "Navigation",
      icon: Leaf,
      action: () => {
        navigate({ to: "/sustainability" });
        onClose();
      },
      keywords: ["esg", "carbon", "environment", "report"],
    },
    {
      id: "nav-alerts",
      title: "Quality & Expiry Alerts",
      description: "Active threshold alerts for critical inventory items",
      category: "Navigation",
      icon: ThermometerSnowflake,
      action: () => {
        navigate({ to: "/quality-alerts" });
        onClose();
      },
      keywords: ["warnings", "critical", "spoilage"],
    },
    {
      id: "act-theme",
      title: isDark ? "Switch to Light Theme" : "Switch to Dark Theme",
      description: "Toggle high-contrast daylight or sleek dark aesthetics",
      category: "Quick Action",
      icon: isDark ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      },
      keywords: ["mode", "theme", "dark", "light", "color"],
    },
    {
      id: "act-tour",
      title: "Start Welcome Onboarding Tour",
      description: "Take an interactive walkthrough of all AnnaSetu features",
      category: "Quick Action",
      icon: Compass,
      action: () => {
        onClose();
        onStartTour?.();
      },
      keywords: ["help", "guide", "tutorial", "walkthrough", "onboarding"],
    },
  ], [navigate, isDark, toggleTheme, onClose, onStartTour]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase().trim();
    return commands.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(lower);
      const matchDesc = c.description.toLowerCase().includes(lower);
      const matchCat = c.category.toLowerCase().includes(lower);
      const matchKey = c.keywords?.some((k) => k.toLowerCase().includes(lower));
      return matchTitle || matchDesc || matchCat || matchKey;
    });
  }, [commands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-foreground/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-border px-4 py-3 bg-muted/20">
          <Search className="size-5 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tools, or actions... (Esc to close)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
              <span>ESC</span>
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No matching pages or commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-primary"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {item.title}
                          </p>
                          <span
                            className={`rounded-sm px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider ${
                              isSelected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            isSelected ? "text-primary-foreground/85" : "text-muted-foreground"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`size-4 shrink-0 ml-2 transition-transform ${
                        isSelected ? "translate-x-0.5 opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/30 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigate</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border border-border">↑↓</kbd>
            <span>Select</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border border-border">↵</kbd>
          </div>
          <div className="flex items-center gap-1.5">
            <Command className="size-3" />
            <span>AnnaSetu Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommandPaletteTrigger({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/50 hover:bg-muted px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shadow-2xs ${className}`}
      title="Search system (Ctrl+K or ⌘K)"
    >
      <Search className="size-3.5" />
      <span className="font-medium">Quick search...</span>
      <kbd className="flex items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
        <span>⌘</span>
        <span>K</span>
      </kbd>
    </button>
  );
}
