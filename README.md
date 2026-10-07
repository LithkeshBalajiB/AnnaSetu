# 🌾 AnnaSetu (अन्नसेतु) — AI Food Waste Management & Redistribution Platform

> **Anna Setu** — *Anna* (food/grain) + *Setu* (bridge) → **"The Intelligent Bridge for Food."**  
> An enterprise-grade sustainability operating system uniting institutional kitchens, cold-chain logistics, and food-rescue charities into a zero-waste circular ecosystem.

---

## 🌟 Executive Overview

**AnnaSetu** addresses the dual crisis of food waste and food insecurity. By fusing **Google Gemini Multimodal AI**, **IoT cold-chain telemetry**, **interactive Leaflet GPS fleet tracking**, and **algorithmic demand forecasting**, AnnaSetu empowers cafeterias, catering hubs, and food processing plants to prevent surplus food from ending up in landfills.

---

## 🚀 Key Modules & Features

### 1. 🛰️ Mission Control Dashboard (`/dashboard`)
- **Live Operations Banner**: Real-time status ticker monitoring active cold-chains, fleet transit, and sensor integrity.
- **Dynamic Demand Forecasting**: Recharts visualization contrasting ML-predicted meal demand against actual consumption trends.
- **Immediate Triage Actions**: 1-click routing for flagged near-expiry stock (*Dispatch to NGO* or *Repurpose in Kitchen*).
- **Environmental Impact KPIs**: Continuous tracking of rescued food (kg), meals generated, avoided CO₂e, and tree equivalents.

### 2. 🔬 AI Vision Quality Scanner (`/quality-scanner`)
- **Google Gemini Multimodal Inspection**: Instant freshness analysis from webcam feeds or uploaded photo crates.
- **Genuine Food Verification**: Rejects non-food objects (faces, documents, electronics) before safety scoring.
- **FSSAI Grading System**: Classifies food into **Grade A (Optimal)**, **Grade B (Safe - Urgent)**, **Grade C (Sub-Standard)**, or **Grade D (Spoiled / Unsafe)**.
- **Bounding Box Defect Detection**: Visual overlays identifying localized bruising, mold spores, or discoloration with confidence ratings.
- **Automated Routing**: Generates immediate shelf-life estimates and recommended redistribution channels.

### 3. 📋 Scan Audit History & Analytics (`/scan-history`)
- **Persistent Audit Log**: Historical scan archive saved with browser persistence.
- **Grade & Category Analytics**: Interactive Pie charts and Bar charts tracking food category degradation rates.
- **One-Click Export**: Download verified inspection logs in standard CSV format for food safety compliance.

### 4. 🚚 Live Leaflet GPS Redistribution Tracking (`/redistribution`)
- **Interactive Multi-Layer Map**: 100% open-source Leaflet engine supporting OpenStreetMap (OSM), Esri Light Gray Canvas, and Esri World Imagery (Satellite).
- **Animated Truck Movement**: Real-time vehicle marker simulating live transit across waypoints between the Kitchen Dispatch Hub and beneficiary drop points.
- **Dynamic Telemetry HUD**: Fluctuating speed indicator (`28–42 km/h`), live cargo hold temperature (`3.1°C–3.4°C Safe Cold Chain`), and pause/resume simulation controls.
- **Chain of Custody & Traceability**: Digital batch sign-offs with cryptographic hash, recipient timestamps, and delivery verification.

### 5. 🤝 Verified NGO Partner Registry (`/ngo-registry`)
- **Verified Charity Directory**: Profiles of vetted food banks, shelters, and community kitchens across Bengaluru.
- **Filterable Network**: Categorize by dietary acceptance (Cooked Meals, Raw Produce, Bakery, Dairy) and logistics radius.
- **Capacity & Impact Metrics**: Live status indicators showing daily capacity and meals served.

### 6. 📅 Batch Pickup Calendar & Gate Pass (`/pickup-calendar`)
- **Interactive Slot Scheduling**: Schedule food pickups with preferred dates, time slots, and assigned logistics partners.
- **Printable FSSAI Gate Passes**: Print-optimized dispatch sheets complete with batch QR codes, inspection sign-offs, and driver credentials.

### 7. 📡 IoT Environmental Sensor Telemetry (`/iot-sensors`)
- **Real-Time Telemetry Feed**: Live data streaming from wireless temperature, humidity, and ethylene gas sensors located across deep-freezers, cold rooms, and ambient pantry racks.
- **Cold Chain Breaches**: Automated alerts when temperatures exceed safe FSSAI thresholds (>4°C chilled, >-18°C frozen).

### 8. 👨‍🍳 AI Menu Optimizer (`/menu-optimizer`)
- **Circular Kitchen AI**: Generative chef copilot that converts surplus inventory into zero-waste recipes.
- **Kitchen Prep Sheets**: Complete ingredient breakdowns, portion calculations, and waste reduction figures.

### 9. 🏆 Impact Wall & Leaderboard (`/impact-wall`)
- **Community ESG Hall of Fame**: Recognizes top culinary teams, food heroes, and partner organizations.
- **Gamified Sustainability Badges**: Milestones for 1,000 kg diverted, zero cold-chain breaches, and rapid redistribution.

### 10. 🌙 Dark Mode & Global UI Enhancements
- **Theme Toggle**: Persistent Daylight / Sleek Dark mode switch in the header.
- **⌘K Spotlight Command Palette**: Universal fuzzy search modal (`Ctrl+K` / `⌘K`) to jump between pages and trigger actions instantly.
- **Onboarding Feature Tour**: 5-step guided interactive walkthrough for first-time visitors.
- **AI Copilot Chatbot**: Always-accessible floating assistant for instant food safety and redistribution guidance.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | [TanStack Start](https://tanstack.com/start) & [React 19](https://react.dev) |
| **Routing** | [TanStack Router](https://tanstack.com/router) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com) with OKLCH Color Tokens |
| **Icons & Micro-Interactions** | [Lucide React](https://lucide.dev) |
| **Interactive Mapping** | [Leaflet](https://leafletjs.com) (SSR-Safe Dynamic Integration) |
| **Data Visualizations** | [Recharts](https://recharts.org) |
| **Multimodal Vision & LLM** | [Google Gemini 2.5 / 1.5 Flash API](https://ai.google.dev/) |
| **Build Engine** | [Vite 8](https://vitejs.dev) / [Rolldown](https://rolldown.rs) |

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` or `bun`

### 1. Clone & Install
```bash
git clone https://github.com/LithkeshBalajiB/AnnaSetu.git
cd AnnaSetu
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no API key is provided, the platform automatically switches to high-fidelity browser heuristic fallback modes for full demo capability.)*

### 3. Launch Development Server
```bash
npm run dev
```
Navigate to **`http://localhost:8080/`** in your browser.

### 4. Build for Production
```bash
npm run build
```
This builds both the client bundle and the SSR server environment.

---

## 📂 Project Architecture

```
AnnaSetu/
├── src/
│   ├── components/
│   │   ├── ai-chatbot.tsx          # Floating Gemini assistant copilot
│   │   ├── command-palette.tsx     # ⌘K / Ctrl+K spotlight search modal
│   │   ├── dashboard-layout.tsx    # Responsive shell with sidebar & header
│   │   ├── dashboard-ui.tsx        # Standardized cards, badges & tables
│   │   ├── live-route-map.tsx      # Leaflet GPS map with animated truck
│   │   ├── notification-center.tsx # Toast & telemetry alert drawer
│   │   ├── onboarding-tour.tsx     # 5-step interactive feature tour
│   │   ├── theme-toggle.tsx        # Dark / Light mode switcher & hook
│   │   └── traceability-modal.tsx  # Digital batch handover modal
│   ├── routes/
│   │   ├── dashboard.tsx           # Mission Control & primary overview
│   │   ├── quality-scanner.tsx     # AI Vision freshness scanner
│   │   ├── scan-history.tsx        # Historical scan audit log & CSV export
│   │   ├── redistribution.tsx      # Live GPS fleet tracking & drop points
│   │   ├── ngo-registry.tsx        # Verified partner NGO directory
│   │   ├── pickup-calendar.tsx     # Batch pickup booking & gate pass
│   │   ├── iot-sensors.tsx         # Real-time cold room sensor feed
│   │   ├── menu-optimizer.tsx      # Generative zero-waste menu planner
│   │   ├── impact-wall.tsx         # ESG leaderboard & achievements
│   │   ├── surplus-forecast.tsx    # ML demand variance predictions
│   │   └── sustainability.tsx      # Carbon & water savings ESG reporting
│   ├── lib/
│   │   ├── mock-data.ts            # Baseline telemetry & route seeds
│   │   └── utils.ts                # Class merging & formatting helpers
│   └── styles.css                  # Tailwind v4 theme definitions
├── package.json
└── vite.config.ts
```

---

## 📜 License & Compliance
Built in accordance with **FSSAI (Food Safety and Standards Authority of India)** surplus food handling norms and **UN Sustainable Development Goal 12.3** (Halving global food waste by 2030).
