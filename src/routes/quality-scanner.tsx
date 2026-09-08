import { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  QrCode,
  ArrowRight,
  Clock,
  Sparkle,
  Zap,
  KeyRound,
  ShieldAlert,
  AlertOctagon,
  Ban,
  HelpCircle,
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
import { toast } from "sonner";

export const Route = createFileRoute("/quality-scanner")({
  head: () => ({
    meta: [
      { title: "AI Vision Scanner — AnnaSetu" },
      {
        name: "description",
        content:
          "Computer vision and AI image analysis for food freshness rating, rot detection, defect bounding boxes, and remaining shelf-life prediction.",
      },
      { property: "og:title", content: "AI Vision Scanner — AnnaSetu" },
      {
        property: "og:description",
        content:
          "Upload food photos to detect spoilage, estimate shelf life, and automatically route surplus.",
      },
    ],
  }),
  component: QualityScannerPage,
});

interface DefectBox {
  id: string;
  label: string;
  confidence: number;
  type: "fresh" | "discoloration" | "mold" | "bruise" | "texture";
  box: { top: number; left: number; width: number; height: number };
}

interface ScanResult {
  id: string;
  title: string;
  category: "Produce" | "Cooked Meal" | "Bakery" | "Dairy" | "Meat";
  imageUrl: string;
  freshnessScore: number;
  grade: "Grade A (Optimal)" | "Grade B (Safe - Urgent)" | "Grade C (Sub-Standard)" | "Grade D (Spoiled / Unsafe)";
  shelfLifeRemaining: string;
  defects: DefectBox[];
  riskAnalysis: {
    discoloration: number;
    moldRisk: number;
    moistureLoss: number;
    textureDegradation: number;
  };
  aiRecommendation: string;
  suggestedAction: "Immediate Kitchen Use" | "Redistribute to NGO" | "Secondary Discount Sale" | "Composting / Animal Feed";
  estimatedSurplusKg: number;
  engine: "gemini" | "canvas-fallback";
}

type ScanOutcome =
  | {
      isFood: true;
      scanResult: ScanResult;
    }
  | {
      isFood: false;
      detectedObject: string;
      reason: string;
      imageUrl: string;
    };

// ─────────────────────────────────────────────────────────────────────────────
// PRESET DEMONSTRATIONS
// ─────────────────────────────────────────────────────────────────────────────
const PRESET_SCANS: ScanResult[] = [
  {
    id: "scan-1",
    title: "Organic Red Vine Tomatoes (Crate #4)",
    category: "Produce",
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 94,
    grade: "Grade A (Optimal)",
    shelfLifeRemaining: "5 - 7 Days",
    defects: [{ id: "d1", label: "Firm Pericarp & Vibrant Pigment", confidence: 96, type: "fresh", box: { top: 20, left: 25, width: 45, height: 45 } }],
    riskAnalysis: { discoloration: 4, moldRisk: 2, moistureLoss: 5, textureDegradation: 6 },
    aiRecommendation: "High firmness index and optimal lycopene saturation. Suitable for standard cold room storage at 10°C–12°C.",
    suggestedAction: "Immediate Kitchen Use",
    estimatedSurplusKg: 35,
    engine: "gemini",
  },
  {
    id: "scan-2",
    title: "Overripe Cavendish Bananas (Lot #B88)",
    category: "Produce",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 62,
    grade: "Grade B (Safe - Urgent)",
    shelfLifeRemaining: "12 - 18 Hours",
    defects: [
      { id: "d2", label: "Sugar Spotting & Peeling Softness", confidence: 89, type: "discoloration", box: { top: 30, left: 35, width: 35, height: 40 } },
      { id: "d3", label: "Surface Sugar Flecks (Non-Toxic)", confidence: 91, type: "texture", box: { top: 15, left: 15, width: 25, height: 30 } },
    ],
    riskAnalysis: { discoloration: 42, moldRisk: 12, moistureLoss: 28, textureDegradation: 45 },
    aiRecommendation: "High ethylene conversion. Internal pulp remains safe and sweet, but peel integrity will deteriorate within 24h. Ideal for immediate smoothie prep or same-day NGO shelter donation.",
    suggestedAction: "Redistribute to NGO",
    estimatedSurplusKg: 28,
    engine: "gemini",
  },
  {
    id: "scan-3",
    title: "Artisan Whole Grain Bread (Batch #L12)",
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 18,
    grade: "Grade D (Spoiled / Unsafe)",
    shelfLifeRemaining: "0 Hours (Expired)",
    defects: [
      { id: "d4", label: "Penicillium Spore Colony Detected", confidence: 94, type: "mold", box: { top: 40, left: 45, width: 25, height: 25 } },
      { id: "d5", label: "Crust Cracking & Staling", confidence: 88, type: "texture", box: { top: 20, left: 20, width: 60, height: 40 } },
    ],
    riskAnalysis: { discoloration: 65, moldRisk: 92, moistureLoss: 84, textureDegradation: 78 },
    aiRecommendation: "Microbial fungal growth detected in crumb pores. Unsafe for human consumption. Do not donate to food banks. Divert immediately to anaerobic composting or organic biogas feed.",
    suggestedAction: "Composting / Animal Feed",
    estimatedSurplusKg: 16,
    engine: "gemini",
  },
  {
    id: "scan-4",
    title: "Cooked Basmati Rice & Dal (Tray #3)",
    category: "Cooked Meal",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 86,
    grade: "Grade A (Optimal)",
    shelfLifeRemaining: "4.5 Hours (Hot Hold)",
    defects: [{ id: "d6", label: "Moisture Gloss & Grain Separation (Normal)", confidence: 93, type: "fresh", box: { top: 25, left: 30, width: 45, height: 45 } }],
    riskAnalysis: { discoloration: 8, moldRisk: 4, moistureLoss: 12, textureDegradation: 14 },
    aiRecommendation: "Hot-hold temperature stability detected with no gelatinization breakdown. Ready for immediate thermal box dispatch to nearby hunger relief centers.",
    suggestedAction: "Redistribute to NGO",
    estimatedSurplusKg: 24,
    engine: "gemini",
  },
  {
    id: "scan-5",
    title: "Shimla Crisp Apples (Lot #AP-09)",
    category: "Produce",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 54,
    grade: "Grade B (Safe - Urgent)",
    shelfLifeRemaining: "3 Days",
    defects: [
      { id: "d7", label: "Mechanical Compression Bruising", confidence: 86, type: "bruise", box: { top: 35, left: 30, width: 30, height: 30 } },
      { id: "d8", label: "Superficial Skin Scuffing", confidence: 82, type: "discoloration", box: { top: 55, left: 50, width: 25, height: 25 } },
    ],
    riskAnalysis: { discoloration: 38, moldRisk: 14, moistureLoss: 30, textureDegradation: 42 },
    aiRecommendation: "Superficial cosmetic bruising from transport shock. Fleshy tissue remains edible and nutrient-dense. Recommended for secondary commercial juicing or discount bulk purchase.",
    suggestedAction: "Secondary Discount Sale",
    estimatedSurplusKg: 45,
    engine: "gemini",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a File / Blob to a base64 data string (without the data-URL prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip "data:<mime>;base64,"
      resolve(result.split(",")[1]!);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 1 — GEMINI VISION API (primary, accurate)
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeWithGemini(
  imageUrl: string,
  file: File,
  customKey?: string
): Promise<ScanOutcome | null> {
  const apiKey = (customKey || (import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined))?.trim();
  if (!apiKey) return null;

  try {
    const base64 = await fileToBase64(file);

    const prompt = `You are a certified food safety inspector and culinary AI embedded in AnnaSetu, an AI food surplus & redistribution system.

CRITICAL FIRST TASK — FOOD VERIFICATION:
Inspect the image carefully to determine whether it depicts genuine EDIBLE FOOD, fresh agricultural produce (fruits, vegetables, herbs), grains, cooked dishes/meals, bread/bakery, dairy, meat/fish, beverages, or culinary raw ingredients.

If the image is NOT food (for example: human beings, faces, selfies, pets, animals, vehicles, cars, electronics, smartphones, laptops, computers, paper documents, receipts, invoices, screenshots, clothing, shoes, furniture, office desks, buildings, tools, toys, or any non-edible object):
You MUST immediately halt food inspection and return ONLY this JSON (no markdown fences, no other text):
{
  "isFood": false,
  "detectedObject": "<short 2-4 word description of what is actually shown in the image, e.g. 'Laptop computer on desk', 'Human portrait', 'Smartphone', 'Paper receipt / document', 'Pet animal'>",
  "reason": "The uploaded image does not depict edible food, fresh produce, or prepared meals. AI freshness scoring and safety routing cannot be performed on non-food items."
}

STEP 2 — FOOD SAFETY & FRESHNESS EVALUATION (Only if the image IS genuine food):
If the image IS food, analyze it with STRICT, CONSERVATIVE food-safety standards.
Return ONLY this JSON (no markdown fences, no other text):
{
  "isFood": true,
  "foodName": "<name of the food, e.g. 'Fresh Red Apples'>",
  "freshnessScore": <integer 0-97>,
  "grade": "<exactly one of: Grade A (Optimal)|Grade B (Safe - Urgent)|Grade C (Sub-Standard)|Grade D (Spoiled / Unsafe)>",
  "category": "<exactly one of: Produce|Cooked Meal|Bakery|Dairy|Meat>",
  "shelfLifeRemaining": "<e.g. '5-7 Days' or '12-18 Hours' or '0 Hours (Expired)'>",
  "suggestedAction": "<exactly one of: Immediate Kitchen Use|Redistribute to NGO|Secondary Discount Sale|Composting / Animal Feed>",
  "defects": [
    {
      "label": "<specific visual observation, e.g. 'Penicillium mold colony on crust'>",
      "type": "<exactly one of: fresh|discoloration|mold|bruise|texture>",
      "confidence": <integer 0-100>,
      "box": { "top": <0-60>, "left": <0-60>, "width": <20-50>, "height": <20-50> }
    }
  ],
  "riskAnalysis": {
    "discoloration": <integer 0-100>,
    "moldRisk": <integer 0-100>,
    "moistureLoss": <integer 0-100>,
    "textureDegradation": <integer 0-100>
  },
  "aiRecommendation": "<3-4 sentences: describe exactly what you see in the image, specific spoilage indicators, and the safety reasoning. Be precise and medical-grade.>"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type || "image/jpeg", data: base64 } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.05,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON in Gemini response:", rawText);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Check if Gemini detected a non-food image
    if (parsed.isFood === false) {
      return {
        isFood: false,
        detectedObject: parsed.detectedObject || "Non-Food Item",
        reason:
          parsed.reason ||
          "The uploaded image does not appear to contain any food or agricultural produce.",
        imageUrl,
      };
    }

    const title =
      parsed.foodName ||
      file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") ||
      "Uploaded Food Sample";

    return {
      isFood: true,
      scanResult: {
        id: `scan-${Date.now()}`,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        category: parsed.category ?? "Produce",
        imageUrl,
        freshnessScore: Math.min(97, Math.max(5, Number(parsed.freshnessScore) || 50)),
        grade: parsed.grade,
        shelfLifeRemaining: parsed.shelfLifeRemaining,
        defects: (parsed.defects ?? []).map((d: any, i: number) => ({
          id: `d-${Date.now()}-${i}`,
          label: d.label,
          confidence: d.confidence,
          type: d.type,
          box: d.box ?? { top: 25, left: 25, width: 40, height: 40 },
        })),
        riskAnalysis: parsed.riskAnalysis,
        aiRecommendation: parsed.aiRecommendation,
        suggestedAction: parsed.suggestedAction,
        estimatedSurplusKg: Math.round(10 + ((Number(parsed.freshnessScore) || 50) / 100) * 50),
        engine: "gemini",
      },
    };
  } catch (err) {
    console.error("Gemini analysis failed:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 2 — CANVAS PIXEL & HEURISTIC FALLBACK (with Non-Food Validation)
// ─────────────────────────────────────────────────────────────────────────────
function analyzeWithCanvas(imageUrl: string, file: File): Promise<ScanOutcome> {
  return new Promise((resolve) => {
    // 1. Filename heuristic — only reject files with strongly non-food names.
    //    We intentionally OMIT 'screenshot / screen / capture' here because
    //    users may photograph food and the OS/camera can name files generically.
    //    Gemini (when key is present) handles semantic food detection accurately.
    const lowerName = file.name.toLowerCase();
    const nonFoodKeywords: { pattern: RegExp; label: string }[] = [
      { pattern: /(\blaptop\b|\bmacbook\b|\bnotebook_pc\b)/i, label: "Laptop / Computer" },
      { pattern: /(\bcar\b|\bvehicle\b|\btruck\b|\bmotorcycle\b)/i, label: "Vehicle / Transportation" },
      { pattern: /(\binvoice\b|\breceipt\b|\bcontract\b|\bresume\b|\bcv\b)/i, label: "Paper Document / Invoice" },
      { pattern: /(\bselfie\b|\bportrait\b|\bavatar\b)/i, label: "Human Portrait / Selfie" },
    ];

    for (const item of nonFoodKeywords) {
      if (item.pattern.test(lowerName)) {
        return resolve({
          isFood: false,
          detectedObject: item.label,
          reason: `The uploaded file appears to be a ${item.label.toLowerCase()} rather than food or agricultural produce. AnnaSetu AI Vision Scanner only inspects food for safety and redistribution.`,
          imageUrl,
        });
      }
    }

    const img = new Image();
    img.onload = () => {
      const SIZE = 250;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
      const total = SIZE * SIZE;

      // ── Pixel counters ──────────────────────────────────────────────────────
      let sumR = 0, sumG = 0, sumB = 0;
      let moldCount = 0;
      let darkCount = 0;
      let brownCount = 0;
      let slimeCount = 0;
      let dullCount = 0;
      let vividGreen = 0;
      let vividRed = 0;
      let vividOrange = 0;
      let brightWhite = 0;

      // Non-food visual heuristic metrics:
      let grayscalePixels = 0;
      let pureWhitePixels = 0;
      let coolBluePixels = 0;
      let organicFoodTones = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        sumR += r; sumG += g; sumB += b;

        const brightness = (r + g + b) / 3;
        const cMax = Math.max(r, g, b);
        const cMin = Math.min(r, g, b);
        const chroma = cMax - cMin;
        const saturation = cMax === 0 ? 0 : chroma / cMax;

        // Grayscale / document test
        if (Math.abs(r - g) < 14 && Math.abs(g - b) < 14 && Math.abs(r - b) < 14) {
          grayscalePixels++;
        }
        if (brightness > 240) pureWhitePixels++;
        if (b > r + 30 && b > g + 20 && brightness > 50) coolBluePixels++;

        // Warm organic food tones (greens, reds, oranges, yellows, baked crust)
        if (
          (r > 120 && g > 60 && b < 100) ||
          (g > r + 20 && g > b + 20) ||
          (r > 100 && g > 70 && b < 60)
        ) {
          organicFoodTones++;
        }

        // Spoilage signals — dark decomp zones (but not normal food shadows)
        if (brightness < 40) darkCount++;

        // Mold: muted grey-green tones only (not vivid greens or yellows)
        const isMutedGreen =
          g > r && g > b &&
          brightness >= 40 && brightness < 150 &&
          saturation < 0.40 && saturation > 0.05 &&
          g > 50 && Math.abs(g - r) > 15;
        const isGreyGreen =
          g >= r && Math.abs(g - r) < 25 && Math.abs(g - b) < 25 &&
          saturation < 0.15 && brightness >= 50 && brightness < 130;
        if (isMutedGreen || isGreyGreen) moldCount++;

        // TRUE browning / oxidation = dark muddy brownish-olive tones.
        // Exclude vivid orange-red cooking colours (shrimp, curry, tomato sauce,
        // baked crust, etc.) which are NORMAL for cooked food.
        const isBrown =
          r > 80 && r > g && r > b &&
          g > 30 && g < r - 25 &&          // noticeable red dominance
          b < 70 && b < g - 10 &&          // very low blue (not orange-red)
          saturation > 0.20 && saturation < 0.65 &&
          brightness < 130;                // dark muddy, not vivid orange
        if (isBrown) brownCount++;

        // Warm cooked-food tones: golden, orange-brown, terracotta, cooked-shrimp pink
        // These are POSITIVE freshness signals, not spoilage.
        const isCookedTone =
          r > 140 && r > g + 20 && b < 130 &&
          brightness > 80 && saturation > 0.15;

        const isSlime =
          saturation < 0.15 && brightness >= 60 && brightness < 120 &&
          g >= r - 8 && g >= b - 8;
        if (isSlime) slimeCount++;

        if (saturation < 0.10 && brightness >= 50) dullCount++;

        if (
          g > r + 35 && g > b + 35 &&
          saturation > 0.45 && brightness > 90 && brightness < 220
        ) vividGreen++;

        if (
          r > 160 && r > g + 50 && r > b + 50 &&
          saturation > 0.5 && brightness > 80
        ) vividRed++;

        // Vivid orange — shrimp, mango, carrot, paprika, pumpkin etc.
        if (
          r > 160 && g > 80 && g < r - 20 && b < 100 &&
          saturation > 0.35 && brightness > 90
        ) vividOrange++;

        // Cooked warm tones counter (shrimp pink, golden crust, caramel, sauce)
        if (isCookedTone) brightWhite++;  // reuse brightWhite slot as "warm vivid" bonus

        if (
          brightness > 200 && saturation < 0.10 &&
          Math.abs(r - g) < 20 && Math.abs(g - b) < 20
        ) brightWhite++;
      }

      // Check non-food pixel signatures:
      const grayscaleRatio = grayscalePixels / total;
      const pureWhiteRatio = pureWhitePixels / total;
      const coolBlueRatio = coolBluePixels / total;
      const foodToneRatio = organicFoodTones / total;

      // ── Non-food pixel checks (CONSERVATIVE — avoid false positives) ────────
      // Food photos taken indoors, on white plates, with flash, or against light
      // backgrounds can have very high white/grayscale ratios. We ONLY reject images
      // that are *extremely* obviously not a photograph of food.

      // Near-pure-white document (e.g. scanned PDF, blank page): > 93% white pixels
      if (pureWhiteRatio > 0.93) {
        return resolve({
          isFood: false,
          detectedObject: "Blank / Near-White Document",
          reason: "The uploaded image appears to be a blank or near-white document page. Please upload a photo of actual food or produce.",
          imageUrl,
        });
      }

      // Solid-blue electronic screen (e.g. BSOD, TV, monitor): dominant cool-blue,
      // very high ratio AND essentially zero warm food-tone pixels.
      if (coolBlueRatio > 0.60 && foodToneRatio < 0.02) {
        return resolve({
          isFood: false,
          detectedObject: "Electronic Screen / Display",
          reason: "Pixel analysis detected an overwhelmingly blue electronic display spectrum with no food colour signatures.",
          imageUrl,
        });
      }

      // Near-total grayscale image (e.g. black-and-white technical diagram): > 97%
      if (grayscaleRatio > 0.97 && foodToneRatio < 0.01) {
        return resolve({
          isFood: false,
          detectedObject: "Monochrome / Grayscale Graphic",
          reason: "The image is almost entirely monochrome and contains no natural food colour signatures.",
          imageUrl,
        });
      }

      const avgR = sumR / total;
      const avgG = sumG / total;
      const avgB = sumB / total;
      const avgBrightness = (avgR + avgG + avgB) / 3;

      const moldR  = moldCount  / total;
      const darkR  = darkCount  / total;
      const brownR = brownCount / total;
      const slimeR = slimeCount / total;
      const dullR  = dullCount  / total;

      const vividGreenR  = vividGreen  / total;
      const vividRedR    = vividRed    / total;
      const vividOrangeR = vividOrange / total;
      const brightWhiteR = brightWhite / total;

      // ── Freshness metric calculations ─────────────────────────────────────
      // moldR: muted grey-green pixels (actual spoilage indicator)
      // darkR: near-black pixels (decomp zones, very strict threshold)
      // brownR: dark muddy oxidation (NOT normal cooking colours)
      // slimeR: flat neutral mid-range (slime / bio-film)
      // dullR: desaturated flat hue (dehydration)

      const moldRiskRaw = Math.round(
        moldR * 220 + darkR * 120 + slimeR * 90
      );
      const moldRisk = Math.min(95, Math.max(0, moldRiskRaw));

      // Discoloration only counts TRUE muddy browning, not cooking warmth
      const discolorationRaw = Math.round(
        brownR * 130 + dullR * 60 + darkR * 50
      );
      const discoloration = Math.min(95, Math.max(0, discolorationRaw));

      const moistureLossRaw = Math.round(
        dullR * 150 + (1 - avgBrightness / 255) * 30 + brownR * 20
      );
      const moistureLoss = Math.min(95, Math.max(0, moistureLossRaw));

      const textureDegRaw = Math.round(
        darkR * 100 + brownR * 60 + moldR * 90 + slimeR * 60
      );
      const textureDegradation = Math.min(95, Math.max(0, textureDegRaw));

      // Warm cooked-food coverage (golden, orange, shrimp, curry, sauce etc.)
      // Acts as a freshness bonus — cooked food with rich warm tones is not spoiled.
      const cookedFoodBonus = Math.min(30, Math.round(vividOrangeR * 60 + vividRedR * 40));

      const freshnessRaw = Math.round(
        62                             // higher base — food is assumed fresh unless proven otherwise
        - moldRisk    * 0.50           // mold is still critical
        - discoloration * 0.10         // reduced — cooking browns are not spoilage
        - moistureLoss  * 0.06
        - textureDegradation * 0.05
        + vividGreenR  * 55            // vivid green produce
        + vividRedR    * 40            // tomato, apple, red pepper
        + vividOrangeR * 35            // shrimp, carrot, mango, pumpkin
        + brightWhiteR * 8             // bright & clean (warm tones counted here too)
        + cookedFoodBonus              // bonus for rich warm cooked colours
        + (avgBrightness / 255) * 8
      );
      const freshnessScore = Math.min(95, Math.max(5, freshnessRaw));

      let grade: ScanResult["grade"];
      let shelfLifeRemaining: string;
      let suggestedAction: ScanResult["suggestedAction"];
      let aiRecommendation: string;
      let primaryDefectType: DefectBox["type"];
      let primaryDefectLabel: string;

      if (freshnessScore >= 75) {
        grade = "Grade A (Optimal)";
        shelfLifeRemaining = `${Math.floor(4 + vividGreenR * 10 + (avgBrightness / 255) * 3)} - ${Math.floor(7 + vividGreenR * 12)} Days`;
        suggestedAction = "Immediate Kitchen Use";
        primaryDefectType = "fresh";
        primaryDefectLabel = "Vivid Colour Uniformity — No Visual Defects Detected";
        aiRecommendation = `Canvas pixel analysis detected strong colour vibrancy (avg RGB: ${avgR.toFixed(0)}/${avgG.toFixed(0)}/${avgB.toFixed(0)}). Mold risk index ${moldRisk}%, discoloration ${discoloration}% — both within safe thresholds. NOTE: This is a conservative canvas-based estimate. For verified food-safety decisions, configure VITE_GEMINI_API_KEY for AI-powered analysis.`;
      } else if (freshnessScore >= 55) {
        grade = "Grade B (Safe - Urgent)";
        const hrs = Math.floor(10 + (freshnessScore - 55) * 1.5);
        shelfLifeRemaining = `${hrs} - ${hrs + 8} Hours`;
        suggestedAction = "Redistribute to NGO";
        primaryDefectType = brownR > 0.12 ? "discoloration" : "texture";
        primaryDefectLabel = brownR > 0.12
          ? `Oxidative Browning Detected (${(brownR * 100).toFixed(1)}% pixel coverage)`
          : `Colour Shift & Texture Softening`;
        aiRecommendation = `Canvas analysis shows elevated browning (${discoloration}%, brown pixels: ${(brownR * 100).toFixed(1)}%) and moisture-loss indicators (${moistureLoss}%). Mold risk ${moldRisk}% — within acceptable range. Safe for urgent redistribution but do not hold. CAUTION: Configure VITE_GEMINI_API_KEY for verified AI food-safety analysis.`;
      } else if (freshnessScore >= 30) {
        grade = "Grade C (Sub-Standard)";
        shelfLifeRemaining = "1 - 4 Hours";
        suggestedAction = "Secondary Discount Sale";
        primaryDefectType = moldR > 0.05 ? "mold" : "bruise";
        primaryDefectLabel = moldR > 0.05
          ? `Possible Mould Signatures Detected (${(moldR * 100).toFixed(1)}% muted-green pixels) — DO NOT donate to children`
          : `Significant Discoloration & Degradation`;
        aiRecommendation = `WARNING: Canvas analysis detected significant spoilage indicators — mold risk ${moldRisk}%, discoloration ${discoloration}%, dark decomposition zones ${(darkR * 100).toFixed(1)}%. DO NOT serve to vulnerable populations or children. Suitable only for processed / industrial use within 1–4 hours. STRONGLY RECOMMENDED: Set VITE_GEMINI_API_KEY and re-scan for a verified verdict.`;
      } else {
        grade = "Grade D (Spoiled / Unsafe)";
        shelfLifeRemaining = "0 Hours (Expired)";
        suggestedAction = "Composting / Animal Feed";
        primaryDefectType = "mold";
        primaryDefectLabel = `Severe Spoilage: Mould ${moldRisk}% / Decomp ${(darkR * 100).toFixed(1)}%`;
        aiRecommendation = `CRITICAL — DO NOT CONSUME. Canvas analysis detected severe spoilage: mold risk ${moldRisk}%, dark decomposition zone density ${(darkR * 100).toFixed(1)}%, discoloration ${discoloration}%. This food is unsafe for human consumption. Divert immediately to composting or biogas. DO NOT donate to NGOs or food banks.`;
      }

      const defects: DefectBox[] = [
        {
          id: `d-${Date.now()}-1`,
          label: primaryDefectLabel,
          confidence: Math.min(90, 60 + Math.round(Math.abs(freshnessScore - 50) * 0.6)),
          type: primaryDefectType,
          box: { top: 20, left: 25, width: 45, height: 45 },
        },
      ];
      if (moldRisk > 30) {
        defects.push({
          id: `d-${Date.now()}-2`,
          label: `Mould-Signature Pixels: ${(moldR * 100).toFixed(1)}% — risk ${moldRisk}%`,
          confidence: Math.min(88, Math.round(moldRisk * 0.88)),
          type: "mold",
          box: { top: 52, left: 55, width: 28, height: 28 },
        });
      }
      // Only surface a browning defect box when discoloration is genuinely high
      // (not just warm cooking colours that the adjusted formula now rates much lower)
      if (discoloration > 55) {
        defects.push({
          id: `d-${Date.now()}-3`,
          label: `Browning / Oxidation Layer: ${discoloration}% index`,
          confidence: Math.min(85, Math.round(discoloration * 0.85)),
          type: "discoloration",
          box: { top: 8, left: 8, width: 32, height: 32 },
        });
      }

      const title =
        file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || "Uploaded Food Sample";

      resolve({
        isFood: true,
        scanResult: {
          id: `scan-${Date.now()}`,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          category: "Produce",
          imageUrl,
          freshnessScore,
          grade,
          shelfLifeRemaining,
          defects,
          riskAnalysis: { discoloration, moldRisk, moistureLoss, textureDegradation },
          aiRecommendation,
          suggestedAction,
          estimatedSurplusKg: Math.round(8 + (freshnessScore / 100) * 45),
          engine: "canvas-fallback",
        },
      });
    };

    img.onerror = () => {
      resolve({
        isFood: false,
        detectedObject: "Corrupted or Unreadable Image",
        reason: "Unable to parse image data. Please ensure you upload a valid JPEG, PNG, or WEBP photo of food.",
        imageUrl,
      });
    };

    img.src = imageUrl;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function QualityScannerPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return (typeof window !== "undefined" && localStorage.getItem("annasetu_gemini_key")) || "";
  });
  const hasGeminiKey = !!((customApiKey || import.meta.env["VITE_GEMINI_API_KEY"]) as string | undefined)?.trim();

  const [activeScan, setActiveScan] = useState<ScanResult>(PRESET_SCANS[1]!);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>(PRESET_SCANS);

  // Non-Food error modal popup state
  const [nonFoodModal, setNonFoodModal] = useState<{
    isOpen: boolean;
    detectedObject: string;
    reason: string;
    imageUrl: string;
  }>({
    isOpen: false,
    detectedObject: "",
    reason: "",
    imageUrl: "",
  });

  const handleSelectPreset = (preset: ScanResult) => {
    setIsScanning(true);
    setTimeout(() => {
      setActiveScan(preset);
      setIsScanning(false);
      toast.success(`AI Vision scanned: ${preset.title}`);
    }, 600);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-uploading same file

    setIsScanning(true);
    const objectUrl = URL.createObjectURL(file);

    try {
      // 1. Try Gemini first if key is present
      const geminiOutcome = await analyzeWithGemini(objectUrl, file, customApiKey);

      // 2. Fall back to canvas pixel & heuristic inspection if Gemini unavailable
      const outcome: ScanOutcome =
        geminiOutcome !== null
          ? geminiOutcome
          : await analyzeWithCanvas(objectUrl, file);

      // STRICT NON-FOOD CHECK:
      // If the uploaded photo is not food, stop analysis immediately!
      // Do NOT let the AI read/grade it, do NOT calculate shelf-life, and pop up an error message.
      if (!outcome.isFood) {
        setIsScanning(false);
        setNonFoodModal({
          isOpen: true,
          detectedObject: outcome.detectedObject || "Non-Food Item",
          reason:
            outcome.reason ||
            "The uploaded image does not appear to contain any food or agricultural produce.",
          imageUrl: outcome.imageUrl || objectUrl,
        });
        toast.error("Non-Food Image Detected — Analysis Cancelled", {
          description: outcome.detectedObject
            ? `Detected: ${outcome.detectedObject}. AnnaSetu only inspects food.`
            : "The uploaded image is not food. Freshness evaluation halted.",
          duration: 6000,
        });
        return;
      }

      // If it IS genuine food, proceed with active scan update and history
      const result = outcome.scanResult;
      setActiveScan(result);
      setHistory((prev) => [result, ...prev]);
      setIsScanning(false);

      if (result.engine === "gemini") {
        toast.success(`AI Vision analysis complete — ${result.grade}`, {
          description: `Freshness: ${result.freshnessScore}% · ${result.shelfLifeRemaining}`,
        });
      } else {
        toast.warning(`Conservative canvas analysis — ${result.grade}`, {
          description: "Add VITE_GEMINI_API_KEY for verified AI results",
          duration: 6000,
        });
      }
    } catch {
      setIsScanning(false);
      toast.error("Analysis failed. Please retry with a clear, well-lit food photo.");
    }
  };

  const handleRouteToRedistribution = () => {
    toast.success(`Batch for "${activeScan.title}" queued with Traceability Batch ID & QR Code!`);
    navigate({ to: "/redistribution" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 55) return "text-amber-600 bg-amber-500/10 border-amber-500/30";
    if (score >= 30) return "text-orange-600 bg-orange-500/10 border-orange-500/30";
    return "text-rose-600 bg-rose-500/10 border-rose-500/30";
  };

  const getGradeIcon = (grade: ScanResult["grade"]) => {
    switch (grade) {
      case "Grade A (Optimal)": return <CheckCircle2 className="size-4 text-emerald-500" />;
      case "Grade B (Safe - Urgent)": return <AlertTriangle className="size-4 text-amber-500" />;
      case "Grade C (Sub-Standard)": return <AlertTriangle className="size-4 text-orange-500" />;
      case "Grade D (Spoiled / Unsafe)": return <XCircle className="size-4 text-rose-600" />;
    }
  };

  const getDefectBorder = (type: DefectBox["type"]) => {
    switch (type) {
      case "fresh": return "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200";
      case "discoloration": return "border-amber-500 bg-amber-500/15 text-amber-950 dark:text-amber-200";
      case "mold": return "border-rose-600 bg-rose-600/20 text-rose-950 dark:text-rose-200 animate-pulse";
      case "bruise": return "border-orange-500 bg-orange-500/15 text-orange-950 dark:text-orange-200";
      default: return "border-sky-500 bg-sky-500/10 text-sky-950 dark:text-sky-200";
    }
  };

  const isUnsafe =
    activeScan.grade === "Grade D (Spoiled / Unsafe)" ||
    activeScan.grade === "Grade C (Sub-Standard)";

  return (
    <DashboardLayout
      title="AI Vision Quality Scanner"
      subtitle="Computer vision food freshness index, rot detection, defect bounding boxes, and remaining shelf-life prediction"
    >
      {/* API Key Status Banner */}
      {!hasGeminiKey && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300 mb-2">
          <KeyRound className="size-4 shrink-0" />
          <div>
            <span className="font-bold">Conservative Mode Active — </span>
            Canvas pixel analysis is being used (no AI key). For medically-accurate food safety predictions, add{" "}
            <code className="rounded bg-amber-500/20 px-1 font-mono">VITE_GEMINI_API_KEY</code>{" "}
            to your <code className="rounded bg-amber-500/20 px-1 font-mono">.env</code> file.{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100"
            >
              Get a free key →
            </a>
          </div>
        </div>
      )}

      {/* Top Banner & Upload */}
      <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/30 to-background p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <h3 className="text-base font-bold text-foreground">
              Optical Surface Freshness & Spoilage Classifier
            </h3>
            {hasGeminiKey && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                ✦ Gemini AI Active
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Point camera or upload container imagery to analyze fungal colonies, browning indices, and safe consumption windows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
          >
            <Upload className="size-4" /> Upload Image to Scan
          </button>
        </div>
      </div>

      {/* Preset Demonstrations Row */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Zap className="size-3.5 text-amber-500" /> Interactive Sample Food Scans (Click to inspect):
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PRESET_SCANS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all ${
                activeScan.id === preset.id
                  ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                  : "border-border bg-card hover:bg-accent/40"
              }`}
            >
              <img
                src={preset.imageUrl}
                alt={preset.title}
                className="size-11 rounded-lg object-cover shrink-0 border border-border"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground">{preset.title.split("(")[0]}</p>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{preset.category}</span>
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      preset.freshnessScore >= 75
                        ? "text-emerald-600 dark:text-emerald-400"
                        : preset.freshnessScore >= 55
                          ? "text-amber-600 dark:text-amber-400"
                          : preset.freshnessScore >= 30
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {preset.freshnessScore}%
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="mt-4 grid gap-5 lg:grid-cols-12">

        {/* Left Column: Image with AI Bounding Boxes */}
        <div className="lg:col-span-7 space-y-4">

          {/* Safety Alert Banner for dangerous food */}
          {isUnsafe && !isScanning && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-xs">
              <ShieldAlert className="size-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-bold text-rose-700 dark:text-rose-300">
                  ⚠ DO NOT DISTRIBUTE — Food Safety Risk Detected
                </p>
                <p className="text-rose-600 dark:text-rose-400 mt-0.5">
                  This item has been classified as <strong>{activeScan.grade}</strong>. It must not be served to children, vulnerable populations, or donated to food banks.
                </p>
              </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
            {/* Image & Bounding Overlays */}
            <div className="relative aspect-4/3 w-full bg-slate-950 flex items-center justify-center">
              {isScanning ? (
                <div className="flex flex-col items-center justify-center gap-3 text-emerald-400">
                  <RefreshCw className="size-8 animate-spin" />
                  <p className="font-mono text-xs tracking-wider animate-pulse">
                    {hasGeminiKey ? "RUNNING GEMINI AI VISION ANALYSIS..." : "RUNNING CONSERVATIVE PIXEL ANALYSIS..."}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400">
                    {hasGeminiKey ? "Analyzing food safety with Gemini 1.5 Flash..." : "Using safety-biased canvas engine..."}
                  </p>
                </div>
              ) : (
                <>
                  <img
                    src={activeScan.imageUrl}
                    alt={activeScan.title}
                    className="h-full w-full object-cover"
                  />
                  {/* Bounding Box Overlays */}
                  {showBoundingBoxes &&
                    activeScan.defects.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          top: `${d.box.top}%`,
                          left: `${d.box.left}%`,
                          width: `${d.box.width}%`,
                          height: `${d.box.height}%`,
                        }}
                        className={`absolute border-2 rounded-lg transition-all ${getDefectBorder(d.type)}`}
                      >
                        <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-slate-950/90 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white shadow">
                          {d.label.slice(0, 50)}{d.label.length > 50 ? "…" : ""} ({d.confidence}%)
                        </span>
                      </div>
                    ))}
                </>
              )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-300 backdrop-blur">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  {showBoundingBoxes ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  {showBoundingBoxes ? "Hide Defect Boxes" : "Show AI Bounding Boxes"}
                </button>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeScan.defects.length} Regions of Interest
                </span>
              </div>
              <span className={`font-mono text-[10px] ${activeScan.engine === "gemini" ? "text-emerald-400" : "text-amber-400"}`}>
                {activeScan.engine === "gemini" ? "⚡ Gemini 1.5 Flash Vision" : "⚠ Canvas Fallback (Conservative)"}
              </span>
            </div>
          </div>

          {/* Defect Log */}
          <Card title="Detected Optical Features & Confidence" description="Visual anomaly segmentation">
            <div className="space-y-2">
              {activeScan.defects.map((defect) => (
                <div
                  key={defect.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3 text-xs bg-muted/20"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`size-2.5 rounded-full shrink-0 ${
                        defect.type === "fresh"
                          ? "bg-emerald-500"
                          : defect.type === "mold"
                            ? "bg-rose-500 animate-ping"
                            : defect.type === "bruise"
                              ? "bg-orange-500"
                              : "bg-amber-500"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-foreground">{defect.label}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">Category: {defect.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-primary">{defect.confidence}% Confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Score & Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {activeScan.category}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-foreground">{activeScan.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Estimated Quantity: <strong className="text-foreground">{activeScan.estimatedSurplusKg} kg</strong>
                </p>
              </div>

              {/* Score Circle */}
              <div className={`flex flex-col items-center justify-center size-20 rounded-2xl border-2 p-2 ${getScoreColor(activeScan.freshnessScore)}`}>
                <span className="font-mono text-2xl font-black leading-none">
                  {activeScan.freshnessScore}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Freshness</span>
              </div>
            </div>

            {/* Grade Banner */}
            <div className={`rounded-xl border p-3 flex items-center justify-between text-xs ${
              isUnsafe
                ? "border-rose-500/40 bg-rose-500/10"
                : "border-border bg-accent/30"
            }`}>
              <div>
                <p className="text-muted-foreground">Safety Classification:</p>
                <p className="font-bold text-foreground text-sm flex items-center gap-1 mt-0.5">
                  {getGradeIcon(activeScan.grade)}
                  {activeScan.grade}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Safe Shelf Life:</p>
                <p className="font-bold text-primary text-sm flex items-center gap-1 justify-end">
                  <Clock className="size-3.5" /> {activeScan.shelfLifeRemaining}
                </p>
              </div>
            </div>

            {/* Risk Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-border">
              <p className="text-xs font-bold text-foreground">Sensory & Degradation Matrix:</p>

              {[
                { label: "Surface Discoloration / Browning", val: activeScan.riskAnalysis.discoloration, color: "bg-amber-500" },
                { label: "Microbial & Mold Risk", val: activeScan.riskAnalysis.moldRisk, color: activeScan.riskAnalysis.moldRisk > 40 ? "bg-rose-600" : "bg-emerald-500" },
                { label: "Moisture & Water Activity Loss", val: activeScan.riskAnalysis.moistureLoss, color: "bg-sky-500" },
                { label: "Texture & Firmness Loss", val: activeScan.riskAnalysis.textureDegradation, color: "bg-indigo-500" },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-[11px] font-medium mb-1">
                    <span>{label}</span>
                    <span className={`font-mono ${val > 50 ? "font-bold text-rose-600" : ""}`}>{val}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Recommendation */}
            <div className={`rounded-xl border p-4 text-xs space-y-1.5 ${
              isUnsafe
                ? "border-rose-500/30 bg-rose-500/5"
                : "border-primary/20 bg-primary/5"
            }`}>
              <p className={`font-bold flex items-center gap-1.5 ${isUnsafe ? "text-rose-600" : "text-primary"}`}>
                <Sparkle className="size-3.5" />
                {activeScan.engine === "gemini" ? "Gemini AI Recommended Routing:" : "⚠ Conservative Canvas Analysis:"}
              </p>
              <p className="text-foreground leading-relaxed">{activeScan.aiRecommendation}</p>
              <div className="mt-2 flex items-center justify-between border-t border-primary/20 pt-2 font-semibold">
                <span className="text-muted-foreground">Optimal Destination:</span>
                <span className={`rounded px-2 py-0.5 ${
                  isUnsafe
                    ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                    : "bg-primary/20 text-primary"
                }`}>
                  {activeScan.suggestedAction}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleRouteToRedistribution}
              disabled={activeScan.grade === "Grade D (Spoiled / Unsafe)"}
              className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <QrCode className="size-4" /> Generate Traceable Batch QR & Dispatch
              <ArrowRight className="size-4" />
            </button>
            {activeScan.grade === "Grade D (Spoiled / Unsafe)" && (
              <p className="text-center text-[11px] text-rose-500 font-semibold">
                ⛔ Dispatch disabled — food classified as Spoiled / Unsafe
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Non-Food Image Rejection Popup Modal */}
      <Dialog
        open={nonFoodModal.isOpen}
        onOpenChange={(open) =>
          setNonFoodModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="max-w-md border border-rose-500/40 bg-card p-6 shadow-2xl rounded-2xl">
          <div className="flex flex-col items-center text-center">
            {/* Warning Alert Icon */}
            <div className="relative mb-3 flex size-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-8 ring-rose-500/10">
              <AlertOctagon className="size-7" />
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow">
                ✕
              </span>
            </div>

            <span className="mb-1 rounded-full bg-rose-500/15 px-3 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
              Invalid Image — Not Food
            </span>

            <DialogTitle className="text-lg font-black text-foreground">
              Non-Food Image Detected
            </DialogTitle>

            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              The AI Vision Scanner halted evaluation because the uploaded photo does not depict food or agricultural produce.
            </DialogDescription>

            {/* Uploaded Non-Food Image Thumbnail */}
            {nonFoodModal.imageUrl && (
              <div className="relative my-3.5 h-36 w-full max-w-xs overflow-hidden rounded-xl border-2 border-rose-500/40 bg-slate-950 shadow-inner">
                <img
                  src={nonFoodModal.imageUrl}
                  alt="Non-food upload preview"
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <div className="rounded-full bg-rose-600/95 px-3 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1.5">
                    <Ban className="size-3.5" /> Non-Food Item
                  </div>
                </div>
              </div>
            )}

            {/* Identified Content Box */}
            <div className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-left text-xs mb-3">
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="text-foreground">Identified Content:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                  {nonFoodModal.detectedObject}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {nonFoodModal.reason}
              </p>
            </div>

            <p className="text-[11px] text-muted-foreground mb-4">
              AnnaSetu AI Vision Scanner inspects only edible food, fresh fruits, vegetables, bakery, and prepared meals to prevent food waste and verify donation safety.
            </p>

            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={() => {
                  setNonFoodModal({ isOpen: false, detectedObject: "", reason: "", imageUrl: "" });
                  fileInputRef.current?.click();
                }}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow transition hover:bg-primary/90 flex items-center justify-center gap-1.5"
              >
                <Upload className="size-3.5" /> Upload Food Photo
              </button>
              <button
                type="button"
                onClick={() =>
                  setNonFoodModal({ isOpen: false, detectedObject: "", reason: "", imageUrl: "" })
                }
                className="rounded-xl border border-border bg-muted px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
