export type ViewMode = "kitchen" | "processing";

export type Risk = "fresh" | "near-expiry" | "critical";

export interface FlaggedItem {
  id: string;
  name: string;
  quantityKg: number;
  risk: Risk;
  source: string;
  location: string;
  temperatureC: number;
  humidity: number;
}

export interface ForecastRow {
  id: string;
  item: string;
  predictedDemandKg: number;
  plannedProductionKg: number;
  predictedSurplusKg: number;
  confidence: number;
}

export interface MatchRow {
  id: string;
  item: string;
  quantityKg: number;
  partner: string;
  status: "pending" | "in transit" | "delivered";
}

export interface ViewData {
  label: string;
  unitLabel: string;
  summary: {
    surplusTodayKg: number;
    nearExpiryItems: number;
    activeMatches: number;
    savedThisMonthKg: number;
    co2AvoidedKg: number;
  };
  demandVsActual: { day: string; predicted: number; actual: number }[];
  flagged: FlaggedItem[];
  weeklySurplus: { day: string; [series: string]: number | string }[];
  surplusSeries: string[];
  forecastRows: ForecastRow[];
  storageTrend: { time: string; unitA: number; unitB: number; unitC: number; humA: number; humB: number; humC: number }[];
  dropPoints: { id: string; name: string; x: number; y: number; distanceKm: number }[];
  route: { stops: string[]; distanceKm: number; minutes: number; vehicle: string };
  matches: MatchRow[];
  sustainability: {
    foodSavedKg: number;
    mealsRedirected: number;
    co2AvoidedKg: number;
    waterSavedL: number;
    monthly: { month: string; wasteKg: number; savedKg: number }[];
  };
}

const days14 = (offset: number) =>
  Array.from({ length: 14 }, (_, i) => {
    const d = new Date(2026, 8, 8 - (13 - i));
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      predicted: Math.round(320 + offset + Math.sin(i / 2) * 45 + i * 3),
      actual: Math.round(300 + offset + Math.sin(i / 2 + 0.6) * 55 + i * 2),
    };
  });

const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hours = Array.from({ length: 13 }, (_, i) => {
  const h = i * 2;
  return {
    time: `${String(h).padStart(2, "0")}:00`,
    unitA: +(3.2 + Math.sin(i / 2) * 0.8).toFixed(1),
    unitB: +(5.4 + Math.cos(i / 3) * 1.1).toFixed(1),
    unitC: +(-18 + Math.sin(i / 4) * 1.4).toFixed(1),
    humA: Math.round(62 + Math.sin(i / 2) * 6),
    humB: Math.round(70 + Math.cos(i / 2) * 5),
    humC: Math.round(48 + Math.sin(i / 3) * 4),
  };
});

export const DATA: Record<ViewMode, ViewData> = {
  kitchen: {
    label: "Kitchen view",
    unitLabel: "Menu item",
    summary: {
      surplusTodayKg: 148,
      nearExpiryItems: 12,
      activeMatches: 5,
      savedThisMonthKg: 2340,
      co2AvoidedKg: 5850,
    },
    demandVsActual: days14(0),
    flagged: [
      { id: "k1", name: "Vegetable Biryani", quantityKg: 24, risk: "near-expiry", source: "Main Cafeteria", location: "Hot hold A", temperatureC: 58.2, humidity: 44 },
      { id: "k2", name: "Paneer Butter Masala", quantityKg: 12, risk: "critical", source: "Main Cafeteria", location: "Chiller 2", temperatureC: 9.4, humidity: 71 },
      { id: "k3", name: "Mixed Green Salad", quantityKg: 8, risk: "near-expiry", source: "Salad Bar", location: "Cold display", temperatureC: 6.1, humidity: 78 },
      { id: "k4", name: "Steamed Rice", quantityKg: 36, risk: "fresh", source: "Main Cafeteria", location: "Hot hold B", temperatureC: 63.5, humidity: 40 },
      { id: "k5", name: "Fruit Cups", quantityKg: 15, risk: "near-expiry", source: "Grab & Go", location: "Chiller 1", temperatureC: 4.8, humidity: 69 },
      { id: "k6", name: "Chapati", quantityKg: 18, risk: "fresh", source: "Bakery Line", location: "Ambient rack", temperatureC: 24.0, humidity: 52 },
    ],
    weeklySurplus: week.map((day, i) => ({
      day,
      Biryani: Math.round(20 + Math.sin(i) * 8 + i),
      Curries: Math.round(14 + Math.cos(i) * 6 + i * 0.5),
      Rice: Math.round(28 + Math.sin(i / 2) * 9),
      Salads: Math.round(9 + Math.cos(i / 2) * 4),
    })),
    surplusSeries: ["Biryani", "Curries", "Rice", "Salads"],
    forecastRows: [
      { id: "f1", item: "Vegetable Biryani", predictedDemandKg: 180, plannedProductionKg: 220, predictedSurplusKg: 40, confidence: 0.92 },
      { id: "f2", item: "Paneer Butter Masala", predictedDemandKg: 95, plannedProductionKg: 110, predictedSurplusKg: 15, confidence: 0.88 },
      { id: "f3", item: "Steamed Rice", predictedDemandKg: 240, plannedProductionKg: 300, predictedSurplusKg: 60, confidence: 0.95 },
      { id: "f4", item: "Mixed Green Salad", predictedDemandKg: 45, plannedProductionKg: 52, predictedSurplusKg: 7, confidence: 0.81 },
      { id: "f5", item: "Chapati", predictedDemandKg: 130, plannedProductionKg: 138, predictedSurplusKg: 8, confidence: 0.9 },
      { id: "f6", item: "Dal Tadka", predictedDemandKg: 88, plannedProductionKg: 122, predictedSurplusKg: 34, confidence: 0.86 },
      { id: "f7", item: "Fruit Cups", predictedDemandKg: 60, plannedProductionKg: 66, predictedSurplusKg: 6, confidence: 0.79 },
    ],
    storageTrend: hours,
    dropPoints: [
      { id: "d1", name: "Annapurna Food Bank", x: 26, y: 30, distanceKm: 3.2 },
      { id: "d2", name: "Seva Shelter Home", x: 62, y: 22, distanceKm: 5.6 },
      { id: "d3", name: "Hope Community Kitchen", x: 74, y: 58, distanceKm: 7.9 },
      { id: "d4", name: "GreenFeed Piggery Co-op", x: 40, y: 74, distanceKm: 9.4 },
    ],
    route: {
      stops: ["Campus Kitchen (pickup)", "Annapurna Food Bank", "Seva Shelter Home", "Hope Community Kitchen", "GreenFeed Co-op"],
      distanceKm: 26.1,
      minutes: 72,
      vehicle: "Refrigerated Van · TN-09-KL-4412",
    },
    matches: [
      { id: "m1", item: "Vegetable Biryani", quantityKg: 24, partner: "Annapurna Food Bank", status: "in transit" },
      { id: "m2", item: "Steamed Rice", quantityKg: 36, partner: "Seva Shelter Home", status: "pending" },
      { id: "m3", item: "Mixed Green Salad", quantityKg: 8, partner: "Hope Community Kitchen", status: "delivered" },
      { id: "m4", item: "Fruit Cups", quantityKg: 15, partner: "Seva Shelter Home", status: "pending" },
      { id: "m5", item: "Chapati", quantityKg: 18, partner: "Annapurna Food Bank", status: "delivered" },
    ],
    sustainability: {
      foodSavedKg: 2340,
      mealsRedirected: 5580,
      co2AvoidedKg: 5850,
      waterSavedL: 1170000,
      monthly: [
        { month: "Apr", wasteKg: 980, savedKg: 1420 },
        { month: "May", wasteKg: 910, savedKg: 1610 },
        { month: "Jun", wasteKg: 845, savedKg: 1780 },
        { month: "Jul", wasteKg: 760, savedKg: 1990 },
        { month: "Aug", wasteKg: 690, savedKg: 2185 },
        { month: "Sep", wasteKg: 612, savedKg: 2340 },
      ],
    },
  },
  processing: {
    label: "Processing unit view",
    unitLabel: "Product batch",
    summary: {
      surplusTodayKg: 412,
      nearExpiryItems: 19,
      activeMatches: 7,
      savedThisMonthKg: 7860,
      co2AvoidedKg: 19650,
    },
    demandVsActual: days14(420),
    flagged: [
      { id: "p1", name: "Batch #A-2291 Pasteurised Milk", quantityKg: 120, risk: "near-expiry", source: "Dairy Line 1", location: "Cold room 1", temperatureC: 5.2, humidity: 66 },
      { id: "p2", name: "Batch #B-1180 Tomato Puree", quantityKg: 84, risk: "critical", source: "Sauce Line", location: "Ambient bay 3", temperatureC: 27.8, humidity: 58 },
      { id: "p3", name: "Batch #C-0442 Frozen Peas", quantityKg: 260, risk: "fresh", source: "Freezing Line", location: "Freezer C", temperatureC: -18.4, humidity: 47 },
      { id: "p4", name: "Batch #A-2304 Paneer Blocks", quantityKg: 96, risk: "near-expiry", source: "Dairy Line 2", location: "Cold room 2", temperatureC: 6.4, humidity: 72 },
      { id: "p5", name: "Batch #D-0031 Bread Loaves", quantityKg: 58, risk: "critical", source: "Bakery Line", location: "Ambient bay 1", temperatureC: 25.1, humidity: 61 },
      { id: "p6", name: "Batch #E-7714 Fruit Pulp", quantityKg: 140, risk: "fresh", source: "Pulping Line", location: "Cold room 3", temperatureC: 3.9, humidity: 64 },
    ],
    weeklySurplus: week.map((day, i) => ({
      day,
      "Dairy Line": Math.round(60 + Math.sin(i) * 20 + i * 2),
      "Sauce Line": Math.round(42 + Math.cos(i) * 14),
      "Bakery Line": Math.round(35 + Math.sin(i / 2) * 12),
      "Pulping Line": Math.round(28 + Math.cos(i / 2) * 10),
    })),
    surplusSeries: ["Dairy Line", "Sauce Line", "Bakery Line", "Pulping Line"],
    forecastRows: [
      { id: "pf1", item: "Batch #A-2291 Milk", predictedDemandKg: 640, plannedProductionKg: 760, predictedSurplusKg: 120, confidence: 0.93 },
      { id: "pf2", item: "Batch #B-1180 Tomato Puree", predictedDemandKg: 310, plannedProductionKg: 394, predictedSurplusKg: 84, confidence: 0.84 },
      { id: "pf3", item: "Batch #C-0442 Frozen Peas", predictedDemandKg: 520, plannedProductionKg: 548, predictedSurplusKg: 28, confidence: 0.91 },
      { id: "pf4", item: "Batch #A-2304 Paneer", predictedDemandKg: 280, plannedProductionKg: 376, predictedSurplusKg: 96, confidence: 0.87 },
      { id: "pf5", item: "Batch #D-0031 Bread", predictedDemandKg: 220, plannedProductionKg: 258, predictedSurplusKg: 38, confidence: 0.8 },
      { id: "pf6", item: "Batch #E-7714 Fruit Pulp", predictedDemandKg: 410, plannedProductionKg: 432, predictedSurplusKg: 22, confidence: 0.89 },
      { id: "pf7", item: "Batch #F-5520 Yoghurt", predictedDemandKg: 190, plannedProductionKg: 214, predictedSurplusKg: 24, confidence: 0.76 },
    ],
    storageTrend: hours,
    dropPoints: [
      { id: "pd1", name: "Regional Food Bank Hub", x: 22, y: 36, distanceKm: 6.1 },
      { id: "pd2", name: "City Shelter Network", x: 58, y: 18, distanceKm: 11.3 },
      { id: "pd3", name: "Discount Retail Buyer", x: 78, y: 48, distanceKm: 14.7 },
      { id: "pd4", name: "Animal Feed Processor", x: 46, y: 78, distanceKm: 18.2 },
      { id: "pd5", name: "Biogas Plant", x: 12, y: 66, distanceKm: 21.5 },
    ],
    route: {
      stops: ["Processing Unit 2 (pickup)", "Regional Food Bank Hub", "City Shelter Network", "Discount Retail Buyer", "Animal Feed Processor", "Biogas Plant"],
      distanceKm: 58.4,
      minutes: 134,
      vehicle: "Reefer Truck · TN-11-BC-8830",
    },
    matches: [
      { id: "pm1", item: "Pasteurised Milk", quantityKg: 120, partner: "Regional Food Bank Hub", status: "in transit" },
      { id: "pm2", item: "Paneer Blocks", quantityKg: 96, partner: "City Shelter Network", status: "pending" },
      { id: "pm3", item: "Tomato Puree", quantityKg: 84, partner: "Discount Retail Buyer", status: "pending" },
      { id: "pm4", item: "Bread Loaves", quantityKg: 58, partner: "Animal Feed Processor", status: "delivered" },
      { id: "pm5", item: "Fruit Pulp", quantityKg: 140, partner: "Regional Food Bank Hub", status: "delivered" },
      { id: "pm6", item: "Frozen Peas", quantityKg: 60, partner: "City Shelter Network", status: "in transit" },
    ],
    sustainability: {
      foodSavedKg: 7860,
      mealsRedirected: 18720,
      co2AvoidedKg: 19650,
      waterSavedL: 3930000,
      monthly: [
        { month: "Apr", wasteKg: 3200, savedKg: 4900 },
        { month: "May", wasteKg: 3010, savedKg: 5480 },
        { month: "Jun", wasteKg: 2740, savedKg: 6120 },
        { month: "Jul", wasteKg: 2380, savedKg: 6840 },
        { month: "Aug", wasteKg: 2115, savedKg: 7390 },
        { month: "Sep", wasteKg: 1880, savedKg: 7860 },
      ],
    },
  },
};

export const SURPLUS_THRESHOLD_KG = 30;

export const riskLabel: Record<Risk, string> = {
  fresh: "Fresh",
  "near-expiry": "Nearing expiry",
  critical: "Spoiled / critical",
};
