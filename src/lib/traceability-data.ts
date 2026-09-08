export type DietaryType = "Vegetarian" | "Vegan" | "Non-Vegetarian" | "Jain";

export type FoodCategory =
  | "Cooked Meal"
  | "Raw Produce"
  | "Bakery & Grains"
  | "Dairy & Desserts"
  | "Processed Bulk";

export type BatchStatus =
  | "Prepared & Logged"
  | "QC & Safety Passed"
  | "Dispatched & In-Transit"
  | "Delivered & Verified";

export interface TempStageLog {
  tempC: number;
  time: string;
  passed: boolean;
  notes?: string | undefined;
}

export interface ColdChainChecklist {
  packagingIntact: boolean;
  temperatureInSafeZone: boolean;
  foodGradeContainers: boolean;
  vehicleCleanAndInsulated: boolean;
  verifiedBy: string;
  verifiedAt: string;
}

export interface ProofOfDelivery {
  recipientName?: string | undefined;
  recipientDesignation?: string | undefined;
  recipientPhone?: string | undefined;
  signatureUrl?: string | undefined;
  photoProofUrl?: string | undefined;
  otpCode?: string | undefined;
  otpVerified?: boolean | undefined;
  deliveredAt?: string | undefined;
  deliveryNotes?: string | undefined;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  hash: string;
}

export interface TraceableBatch {
  id: string; // e.g. "AS-2026-K101"
  itemName: string;
  category: FoodCategory;
  dietaryType: DietaryType;
  quantityKg: number;
  servingsCount: number;
  donorSource: string;
  donorSupervisor: string;
  preparedAt: string;
  bestBefore: string;
  expiryHoursLeft: number;
  targetHoldingTemp: string;
  temperatureStages: {
    packaging: TempStageLog;
    inTransit?: TempStageLog;
    delivery?: TempStageLog;
  };
  allergens: string[];
  reheatingInstructions: string;
  checklist: ColdChainChecklist;
  matchedPartner: {
    id: string;
    name: string;
    type: "NGO" | "Shelter" | "Community Kitchen" | "Secondary Buyer";
    contactPerson: string;
    phone: string;
    address: string;
  };
  proofOfDelivery: ProofOfDelivery;
  status: BatchStatus;
  auditTrail: AuditLogEntry[];
}

export const COMMON_ALLERGENS = [
  "Dairy / Milk",
  "Gluten / Wheat",
  "Peanuts / Tree Nuts",
  "Soy / Soybeans",
  "Mustard",
  "Sesame Seeds",
  "Eggs",
  "Shellfish",
];

export const INITIAL_BATCHES: TraceableBatch[] = [
  {
    id: "AS-2026-K101",
    itemName: "Vegetable Dum Biryani",
    category: "Cooked Meal",
    dietaryType: "Vegetarian",
    quantityKg: 24,
    servingsCount: 60,
    donorSource: "Main Cafeteria Kitchen (Block A)",
    donorSupervisor: "Chef Raman Verma (ID #K-402)",
    preparedAt: "Today, 11:30 AM",
    bestBefore: "Today, 04:30 PM (5 hr safe window)",
    expiryHoursLeft: 4.5,
    targetHoldingTemp: "Hot Hold > 65°C",
    temperatureStages: {
      packaging: { tempC: 68.4, time: "11:45 AM", passed: true, notes: "Sealed in insulated SS containers" },
      inTransit: { tempC: 66.1, time: "12:15 PM", passed: true, notes: "Thermal box insulation checked" },
      delivery: { tempC: 65.0, time: "12:45 PM", passed: true, notes: "Arrived hot and fresh" },
    },
    allergens: ["Dairy / Milk", "Mustard"],
    reheatingInstructions: "Reheat thoroughly to core temperature ≥ 75°C before serving. Do not refreeze.",
    checklist: {
      packagingIntact: true,
      temperatureInSafeZone: true,
      foodGradeContainers: true,
      vehicleCleanAndInsulated: true,
      verifiedBy: "QC Lead Meera Nair",
      verifiedAt: "11:50 AM",
    },
    matchedPartner: {
      id: "ngo-1",
      name: "Akshaya Shelter Foundation",
      type: "Shelter",
      contactPerson: "Anita Roy (Shelter In-Charge)",
      phone: "+91 98450 12345",
      address: "12th Cross, Indiranagar, Bengaluru",
    },
    proofOfDelivery: {
      recipientName: "Anita Roy",
      recipientDesignation: "Shelter Operations Lead",
      recipientPhone: "+91 98450 12345",
      otpCode: "4829",
      otpVerified: true,
      deliveredAt: "Today, 12:45 PM",
      deliveryNotes: "All 60 meal portions verified and distributed to resident children.",
      signatureUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M10 40 Q 50 10 90 35 T 180 25' stroke='%23064e3b' stroke-width='3' fill='none'/></svg>",
      photoProofUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
    },
    status: "Delivered & Verified",
    auditTrail: [
      {
        id: "aud-1",
        timestamp: "11:30 AM",
        actor: "Chef Raman Verma",
        role: "Head Chef",
        action: "Batch Registered & Allergen Declared",
        details: "Surplus 24kg logged with Dairy/Mustard allergen disclosure.",
        hash: "0x8f2a1c...e409",
      },
      {
        id: "aud-2",
        timestamp: "11:50 AM",
        actor: "QC Meera Nair",
        role: "Food Safety Officer",
        action: "Cold-Chain Checklist Approved",
        details: "Temp verified 68.4°C. Tamper-evident seals applied to 4 containers.",
        hash: "0x91bc4e...a712",
      },
      {
        id: "aud-3",
        timestamp: "12:10 PM",
        actor: "Driver Suresh Rao",
        role: "Logistics Partner",
        action: "Dispatched from Kitchen Dock",
        details: "Loaded into Insulated Van #KA-03-FA-8821 with OTP challenge #4829.",
        hash: "0x33ef90...c014",
      },
      {
        id: "aud-4",
        timestamp: "12:45 PM",
        actor: "Anita Roy",
        role: "Recipient (Akshaya Shelter)",
        action: "Digital POD Signed & Handover Complete",
        details: "Received 24kg at 65.0°C. Verified via OTP & digital signature.",
        hash: "0x77ab12...d891",
      },
    ],
  },
  {
    id: "AS-2026-K102",
    itemName: "Paneer Butter Masala",
    category: "Cooked Meal",
    dietaryType: "Vegetarian",
    quantityKg: 12,
    servingsCount: 35,
    donorSource: "Main Cafeteria Kitchen (Block A)",
    donorSupervisor: "Chef Raman Verma (ID #K-402)",
    preparedAt: "Today, 11:45 AM",
    bestBefore: "Today, 04:00 PM (4 hr safe window)",
    expiryHoursLeft: 3.2,
    targetHoldingTemp: "Hot Hold > 65°C",
    temperatureStages: {
      packaging: { tempC: 67.2, time: "12:00 PM", passed: true, notes: "Vacuum seal foil pans" },
      inTransit: { tempC: 64.8, time: "12:20 PM", passed: true, notes: "Thermal blankets active" },
    },
    allergens: ["Dairy / Milk", "Peanuts / Tree Nuts"],
    reheatingInstructions: "Heat in shallow pans to 75°C. Consume within 60 minutes after reheat.",
    checklist: {
      packagingIntact: true,
      temperatureInSafeZone: true,
      foodGradeContainers: true,
      vehicleCleanAndInsulated: true,
      verifiedBy: "QC Lead Meera Nair",
      verifiedAt: "12:05 PM",
    },
    matchedPartner: {
      id: "ngo-2",
      name: "Robin Hood Army - East Chapter",
      type: "NGO",
      contactPerson: "Karthik Sundaram",
      phone: "+91 99001 55667",
      address: "Community Distribution Hub, Koramangala",
    },
    proofOfDelivery: {
      otpCode: "9134",
    },
    status: "Dispatched & In-Transit",
    auditTrail: [
      {
        id: "aud-10",
        timestamp: "11:45 AM",
        actor: "Chef Raman Verma",
        role: "Head Chef",
        action: "Batch Registered & Allergen Declared",
        details: "12kg logged. Allergens: Dairy, Tree Nuts (Cashew paste).",
        hash: "0x12a9bc...ff31",
      },
      {
        id: "aud-11",
        timestamp: "12:05 PM",
        actor: "QC Meera Nair",
        role: "Food Safety Officer",
        action: "Cold-Chain Checklist Approved",
        details: "Temp verified 67.2°C. Batch QR generated.",
        hash: "0x44dc1a...2299",
      },
      {
        id: "aud-12",
        timestamp: "12:20 PM",
        actor: "Driver Suresh Rao",
        role: "Logistics Partner",
        action: "Dispatched & En Route",
        details: "Van #KA-03-FA-8821 ETA 15 mins to Koramangala Hub.",
        hash: "0x89ee11...9041",
      },
    ],
  },
  {
    id: "AS-2026-P203",
    itemName: "Whole Wheat Bread Loaves",
    category: "Bakery & Grains",
    dietaryType: "Vegan",
    quantityKg: 18,
    servingsCount: 45,
    donorSource: "Central Bakery Line 2",
    donorSupervisor: "Production Lead John Mathew",
    preparedAt: "Today, 06:00 AM",
    bestBefore: "Tomorrow, 08:00 PM (36 hr shelf life)",
    expiryHoursLeft: 32.0,
    targetHoldingTemp: "Dry Ambient (18°C - 24°C)",
    temperatureStages: {
      packaging: { tempC: 22.1, time: "07:30 AM", passed: true, notes: "Individual food grade wrapper" },
    },
    allergens: ["Gluten / Wheat", "Sesame Seeds"],
    reheatingInstructions: "Ready to eat. Store in a cool, dry place.",
    checklist: {
      packagingIntact: true,
      temperatureInSafeZone: true,
      foodGradeContainers: true,
      vehicleCleanAndInsulated: true,
      verifiedBy: "QC Inspector David Lee",
      verifiedAt: "07:45 AM",
    },
    matchedPartner: {
      id: "ngo-3",
      name: "St. Jude Child Care Center",
      type: "NGO",
      contactPerson: "Sister Maria",
      phone: "+91 94480 33221",
      address: "Old Airport Road, Bengaluru",
    },
    proofOfDelivery: {
      otpCode: "3051",
    },
    status: "QC & Safety Passed",
    auditTrail: [
      {
        id: "aud-20",
        timestamp: "06:00 AM",
        actor: "Production Lead John Mathew",
        role: "Bakery Line Supervisor",
        action: "Batch Registered",
        details: "18kg fresh sandwich loaves produced and bagged.",
        hash: "0x55ac88...11ee",
      },
      {
        id: "aud-21",
        timestamp: "07:45 AM",
        actor: "QC Inspector David Lee",
        role: "Food Safety Officer",
        action: "Batch Label & QR Issued",
        details: "Inspected wrapper seals and expiry tags. Ready for courier pickup.",
        hash: "0x77ba33...44aa",
      },
    ],
  },
  {
    id: "AS-2026-P204",
    itemName: "Steamed Jasmine Rice & Dal",
    category: "Cooked Meal",
    dietaryType: "Vegan",
    quantityKg: 36,
    servingsCount: 90,
    donorSource: "Campus Cafeteria 2",
    donorSupervisor: "Chef Tenzin Norbu",
    preparedAt: "Today, 12:00 PM",
    bestBefore: "Today, 05:00 PM (5 hr safe window)",
    expiryHoursLeft: 4.8,
    targetHoldingTemp: "Hot Hold > 65°C",
    temperatureStages: {
      packaging: { tempC: 71.0, time: "12:15 PM", passed: true, notes: "Sealed containers" },
    },
    allergens: ["Mustard"],
    reheatingInstructions: "Keep hot above 65°C or reheat above 75°C before serving.",
    checklist: {
      packagingIntact: true,
      temperatureInSafeZone: true,
      foodGradeContainers: true,
      vehicleCleanAndInsulated: true,
      verifiedBy: "QC Lead Meera Nair",
      verifiedAt: "12:20 PM",
    },
    matchedPartner: {
      id: "ngo-4",
      name: "FeedTheNeed Community Kitchen",
      type: "Community Kitchen",
      contactPerson: "Sunil Hegde",
      phone: "+91 97410 88990",
      address: "Shivajinagar Relief Camp, Bengaluru",
    },
    proofOfDelivery: {
      otpCode: "7742",
    },
    status: "Prepared & Logged",
    auditTrail: [
      {
        id: "aud-30",
        timestamp: "12:00 PM",
        actor: "Chef Tenzin Norbu",
        role: "Sous Chef",
        action: "Batch Registered & Allergen Tagged",
        details: "36kg excess rice & yellow dal logged after lunch service.",
        hash: "0xaa4411...99bb",
      },
    ],
  },
];
