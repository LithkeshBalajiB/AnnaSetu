import { useEffect, useRef, useState } from "react";
import type * as LType from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  RotateCcw,
  ThermometerSnowflake,
  Truck,
  Play,
  Pause,
  Gauge,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RouteDropPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  assignedKg: number;
  category: string;
  status: "delivered" | "in transit" | "pending";
  eta: string;
}

const DEFAULT_STOPS: RouteDropPoint[] = [
  {
    id: "d1",
    name: "Seva Shelter Home",
    address: "Austin Town, Bengaluru",
    lat: 12.961,
    lng: 77.616,
    distanceKm: 3.2,
    assignedKg: 36,
    category: "Steamed Rice & Curries",
    status: "in transit",
    eta: "12:15 PM (15m away)",
  },
  {
    id: "d2",
    name: "Annapurna Food Bank",
    address: "Indiranagar, Bengaluru",
    lat: 12.9784,
    lng: 77.6408,
    distanceKm: 5.6,
    assignedKg: 42,
    category: "Vegetable Biryani & Dal",
    status: "pending",
    eta: "12:45 PM",
  },
  {
    id: "d3",
    name: "Hope Children Home",
    address: "Fraser Town, Bengaluru",
    lat: 12.998,
    lng: 77.614,
    distanceKm: 8.3,
    assignedKg: 28,
    category: "Fresh Bread & Fruits",
    status: "pending",
    eta: "01:20 PM",
  },
  {
    id: "d4",
    name: "GreenFeed Organic Piggery",
    address: "Yeshwanthpur, Bengaluru",
    lat: 13.028,
    lng: 77.54,
    distanceKm: 14.8,
    assignedKg: 16,
    category: "Organic Bakery Trim (Compost)",
    status: "pending",
    eta: "02:10 PM",
  },
];

const HUB_LOCATION = {
  name: "AnnaSetu Kitchen Dispatch Hub",
  address: "Koramangala 4th Block, Bengaluru",
  lat: 12.9352,
  lng: 77.6245,
};

function generateWaypoints(): [number, number][] {
  const anchors: [number, number][] = [
    [12.9352, 77.6245], // Hub (Koramangala)
    [12.942, 77.621],
    [12.948, 77.62],
    [12.954, 77.618],
    [12.961, 77.616], // Stop 1 (Austin Town)
    [12.965, 77.622],
    [12.971, 77.631],
    [12.9784, 77.6408], // Stop 2 (Indiranagar)
    [12.985, 77.632],
    [12.991, 77.622],
    [12.998, 77.614], // Stop 3 (Fraser Town)
    [13.008, 77.59],
    [13.018, 77.565],
    [13.028, 77.54], // Stop 4 (Yeshwanthpur)
  ];

  const result: [number, number][] = [];
  const stepsPerLeg = 5;

  for (let i = 0; i < anchors.length - 1; i++) {
    const [lat1, lng1] = anchors[i];
    const [lat2, lng2] = anchors[i + 1];
    for (let step = 0; step < stepsPerLeg; step++) {
      const ratio = step / stepsPerLeg;
      result.push([
        Number((lat1 + (lat2 - lat1) * ratio).toFixed(5)),
        Number((lng1 + (lng2 - lng1) * ratio).toFixed(5)),
      ]);
    }
  }
  result.push(anchors[anchors.length - 1]);
  return result;
}

const ALL_WAYPOINTS = generateWaypoints();

export function LiveRouteMap({
  className,
  onSelectStop,
}: {
  className?: string;
  onSelectStop?: (stop: RouteDropPoint) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const truckMarkerRef = useRef<LType.Marker | null>(null);
  const trailPolylineRef = useRef<LType.Polyline | null>(null);

  const [activeLayer, setActiveLayer] = useState<"osm" | "clean" | "satellite">("osm");
  const [, setSelectedStop] = useState<RouteDropPoint | null>(null);
  const [waypointIndex, setWaypointIndex] = useState(2);
  const [isSimulating, setIsSimulating] = useState(true);
  const [speed, setSpeed] = useState(34);
  const [temp, setTemp] = useState("3.2°C");
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic telemetry interval
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setWaypointIndex((prev) => {
        const next = (prev + 1) % ALL_WAYPOINTS.length;
        return next;
      });

      setSpeed(Math.floor(28 + Math.random() * 12));
      setTemp((3.1 + Math.random() * 0.3).toFixed(1) + "°C");
    }, 2200);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Update marker & trail position
  useEffect(() => {
    if (!mapInstanceRef.current || !truckMarkerRef.current) return;

    const currentCoords = ALL_WAYPOINTS[waypointIndex];
    if (currentCoords) {
      truckMarkerRef.current.setLatLng(currentCoords);

      if (trailPolylineRef.current) {
        const traversed = ALL_WAYPOINTS.slice(0, waypointIndex + 1);
        trailPolylineRef.current.setLatLngs(traversed);
      }
    }
  }, [waypointIndex]);

  // SSR-Safe Leaflet initialization
  useEffect(() => {
    let cancelled = false;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;
      if (cancelled || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 12,
        zoomControl: false,
      });

      mapInstanceRef.current = map;
      L.control.zoom({ position: "topright" }).addTo(map);

      let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      let attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      if (activeLayer === "clean") {
        tileUrl =
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
        attribution = "&copy; Esri, HERE, Garmin";
      } else if (activeLayer === "satellite") {
        tileUrl =
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        attribution = "&copy; Esri, Maxar, Earthstar Geographics";
      }

      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      // Route outline polyline
      const routeLine = L.polyline(ALL_WAYPOINTS, {
        color: "#059669",
        weight: 3.5,
        opacity: 0.6,
        dashArray: "6, 8",
        lineCap: "round",
      }).addTo(map);

      // Traversed trail polyline
      const initialTraversed = ALL_WAYPOINTS.slice(0, waypointIndex + 1);
      const trailLine = L.polyline(initialTraversed, {
        color: "#10b981",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
      }).addTo(map);
      trailPolylineRef.current = trailLine;

      // Hub Icon
      const hubIcon = L.divIcon({
        className: "custom-hub-marker",
        html: `
          <div style="display:flex;align-items:center;gap:6px;background:#059669;color:#ffffff;padding:6px 12px;border-radius:9999px;font-size:11px;font-weight:700;box-shadow:0 4px 14px rgba(5,150,105,0.45);border:2px solid #ffffff;white-space:nowrap;transform:translate(-50%,-50%);cursor:pointer;">
            <span style="font-size:13px;">🏢</span>
            <span>Kitchen Hub</span>
          </div>
        `,
        iconSize: [0, 0],
      });

      const hubMarker = L.marker([HUB_LOCATION.lat, HUB_LOCATION.lng], { icon: hubIcon }).addTo(map);
      hubMarker.bindPopup(`
        <div style="font-family:sans-serif;padding:4px;">
          <h4 style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#0f172a;">${HUB_LOCATION.name}</h4>
          <p style="margin:0 0 6px 0;font-size:11px;color:#64748b;">${HUB_LOCATION.address}</p>
          <div style="background:#ecfdf5;color:#047857;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:600;display:inline-block;">
            ✓ Certified FSSAI Dispatch Dock
          </div>
        </div>
      `);

      // Stops Pins
      DEFAULT_STOPS.forEach((stop, index) => {
        const isDelivered = stop.status === "delivered";
        const isTransit = stop.status === "in transit";
        const badgeBg = isDelivered ? "#10b981" : isTransit ? "#f59e0b" : "#3b82f6";

        const stopIcon = L.divIcon({
          className: `custom-stop-marker-${stop.id}`,
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
              <div style="background:${badgeBg};color:#ffffff;border:2px solid #ffffff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;box-shadow:0 3px 10px rgba(0,0,0,0.3);">
                ${index + 1}
              </div>
              <div style="background:#0f172a;color:#ffffff;padding:1px 6px;border-radius:4px;font-size:9px;font-weight:600;margin-top:2px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.15);">
                ${stop.name.length > 16 ? stop.name.slice(0, 14) + "…" : stop.name}
              </div>
            </div>
          `,
          iconSize: [0, 0],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);

        marker.on("click", () => {
          setSelectedStop(stop);
          onSelectStop?.(stop);
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;min-width:190px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="background:${badgeBg};color:#fff;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;">Stop #${index + 1}</span>
              <span style="font-size:10px;color:#64748b;font-weight:600;">${stop.distanceKm} km from Hub</span>
            </div>
            <h4 style="margin:0 0 2px 0;font-size:13px;font-weight:700;color:#0f172a;">${stop.name}</h4>
            <p style="margin:0 0 6px 0;font-size:11px;color:#64748b;">${stop.address}</p>
            <div style="border-top:1px solid #e2e8f0;padding-top:6px;font-size:11px;">
              <div style="color:#0f172a;font-weight:600;margin-bottom:2px;">📦 ${stop.category} (${stop.assignedKg} kg)</div>
              <div style="color:#059669;font-weight:600;">⏱️ ETA: ${stop.eta}</div>
            </div>
          </div>
        `);
      });

      // Animated Truck Icon
      const truckIcon = L.divIcon({
        className: "custom-animated-truck-marker",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;transform:translate(-50%,-50%);cursor:pointer;">
            <div style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(37,99,235,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="display:flex;align-items:center;gap:5px;background:#2563eb;color:#ffffff;padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:700;box-shadow:0 4px 16px rgba(37,99,235,0.5);border:2px solid #ffffff;white-space:nowrap;position:relative;z-index:10;">
              <span style="font-size:12px;">🚚</span>
              <span>Live Truck</span>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const initialPos = ALL_WAYPOINTS[waypointIndex] || [12.948, 77.62];
      const truckMarker = L.marker(initialPos, { icon: truckIcon }).addTo(map);
      truckMarkerRef.current = truckMarker;

      map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      setIsLoaded(true);
    }

    initLeaflet();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      truckMarkerRef.current = null;
      trailPolylineRef.current = null;
    };
  }, [activeLayer]);

  const handleResetView = async () => {
    if (!mapInstanceRef.current) return;
    const L = (await import("leaflet")).default;
    mapInstanceRef.current.fitBounds(L.latLngBounds(ALL_WAYPOINTS), { padding: [50, 50] });
  };

  const handleRewind = () => {
    setWaypointIndex(0);
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border shadow-sm bg-card",
        className
      )}
    >
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="h-80 w-full z-0 transition-opacity duration-300"
        style={{ background: "#f8fafc" }}
      />

      {/* Floating Control HUD Overlays (Top Left) */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/80 shadow-md text-xs font-semibold">
        <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-foreground">Leaflet Live GPS</span>
        <span className="text-muted-foreground text-[10px] font-normal">
          · Real-time Movement
        </span>
      </div>

      {/* Floating Control HUD Overlays (Top Right) */}
      <div className="absolute top-3 right-12 z-[1000] flex items-center gap-1.5 bg-background/90 backdrop-blur-md p-1 rounded-lg border border-border/80 shadow-md">
        <div className="flex items-center bg-muted/60 rounded-md p-0.5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveLayer("osm")}
            className={cn(
              "px-2 py-0.5 rounded transition-colors",
              activeLayer === "osm"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            OSM
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("clean")}
            className={cn(
              "px-2 py-0.5 rounded transition-colors",
              activeLayer === "clean"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Clean
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("satellite")}
            className={cn(
              "px-2 py-0.5 rounded transition-colors",
              activeLayer === "satellite"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Satellite
          </button>
        </div>
        <button
          type="button"
          onClick={handleResetView}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Recenter Route"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Bottom Live Telemetry & Simulation Controls Banner */}
      <div className="relative z-[1000] bg-background/95 backdrop-blur-md border-t border-border px-3 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
            <Truck className="size-3.5" />
            <span>TN-09-KL-4412</span>
          </div>

          <div className="flex items-center gap-1 text-foreground font-medium bg-muted/60 px-2 py-0.5 rounded">
            <Gauge className="size-3 text-primary" />
            <span>{speed} km/h</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
            <ThermometerSnowflake className="size-3" />
            <span>{temp} Safe Cold Chain</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSimulating((prev) => !prev)}
            className="flex items-center gap-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-[11px] font-semibold transition-colors"
            title={isSimulating ? "Pause live simulation" : "Resume live simulation"}
          >
            {isSimulating ? (
              <>
                <Pause className="size-3" />
                <span>Pause GPS</span>
              </>
            ) : (
              <>
                <Play className="size-3" />
                <span>Resume GPS</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRewind}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Restart route from Hub"
          >
            <RotateCcw className="size-3" />
          </button>

          <span className="text-[11px] text-muted-foreground hidden lg:inline">
            Waypoints: {waypointIndex + 1}/{ALL_WAYPOINTS.length}
          </span>
        </div>
      </div>
    </div>
  );
}
