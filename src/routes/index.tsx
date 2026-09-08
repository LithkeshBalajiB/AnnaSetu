import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Leaf,
  ArrowRight,
  Brain,
  ThermometerSnowflake,
  HeartHandshake,
  Route as RouteIcon,
  BarChart3,
  BellRing,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AnnaSetu — Predict, Rescue and Redistribute Food Surplus" },
      {
        name: "description",
        content:
          "AnnaSetu predicts food surplus before it happens, flags near-expiry stock from sensor data, matches it to NGOs and buyers, and reports the sustainability impact.",
      },
      {
        property: "og:title",
        content: "AnnaSetu — Predict, Rescue and Redistribute Food Surplus",
      },
      {
        property: "og:description",
        content:
          "AI surplus forecasting, quality alerts, NGO matching and ESG reporting for institutional kitchens and food processing units.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Brain,
    title: "Surplus forecasting",
    text: "Predicts tomorrow's surplus per menu item or product batch, with a confidence score on every line.",
  },
  {
    icon: ThermometerSnowflake,
    title: "Quality & expiry alerts",
    text: "Sensor and vision signals flag stock that is warming up, too humid or nearing expiry — before it spoils.",
  },
  {
    icon: HeartHandshake,
    title: "NGO & buyer matching",
    text: "Surplus is matched to food banks, shelters and secondary buyers based on volume, distance and urgency.",
  },
  {
    icon: RouteIcon,
    title: "Route optimisation",
    text: "One pickup run, ordered stops, distance and time estimates, and the right vehicle assigned.",
  },
  {
    icon: BarChart3,
    title: "Sustainability reporting",
    text: "Food saved, meals redirected, CO₂e avoided and water savings — exportable as an ESG summary.",
  },
  {
    icon: BellRing,
    title: "Threshold notifications",
    text: "Set temperature, humidity and freshness limits, and get an in-app alert the moment they are breached.",
  },
];

const steps = [
  ["Sense", "Kitchen and line data, storage sensors and vision checks stream in continuously."],
  ["Predict", "Models compare expected demand to planned production and flag surplus days ahead."],
  ["Match", "Surplus is offered to nearby partners and routed for a single efficient pickup."],
  ["Report", "Every rescued kilogram rolls up into audit-ready sustainability numbers."],
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">AnnaSetu</p>
            <p className="text-xs text-muted-foreground">Bridging Surplus to Sustenance</p>
          </div>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            <a href="#features" className="hidden text-muted-foreground hover:text-foreground sm:block">
              Features
            </a>
            <a href="#impact" className="hidden text-muted-foreground hover:text-foreground sm:block">
              Impact
            </a>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open dashboard <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border bg-accent/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Leaf className="size-3.5" /> AI food waste management
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Stop food surplus before it becomes waste.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              AnnaSetu gives institutional kitchens and processing units one control room:
              forecast surplus days ahead, catch near-expiry stock from live sensor readings, match
              it to NGOs and buyers, and prove the impact with ESG-ready reporting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Open dashboard <ArrowRight className="size-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                See how it works
              </a>
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "Works for kitchens and processing units",
                "No hardware swap required",
                "Alerts on your own thresholds",
                "Exportable ESG summary",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Sample month · campus kitchen
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["2,340 kg", "Food rescued"],
                ["5,580", "Meals redirected"],
                ["5,850 kg", "CO₂e avoided"],
                ["1,170 kL", "Water saved"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-muted/60 p-4">
                  <p className="text-2xl font-semibold tracking-tight">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                ["Paneer Butter Masala", "Critical", "bg-danger/15 text-danger"],
                ["Vegetable Biryani", "Near expiry", "bg-warning/25 text-warning-foreground"],
                ["Steamed Rice", "Fresh", "bg-success/15 text-success"],
              ].map(([item, status, cls]) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>{item}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Illustrative sample data from the demo dashboard.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Everything from prediction to proof
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Five connected views that take a surplus signal all the way to a delivered meal and a
          reported number.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="impact" className="border-y border-border bg-accent/30">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Proven in the numbers</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Six months of operation at a mid-size campus kitchen and its partner processing unit.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["38%", "Less waste sent to disposal"],
              ["10,200 kg", "Surplus food rescued"],
              ["24,300", "Meals redirected to people"],
              ["25.5 t", "CO₂e avoided"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-3xl font-semibold tracking-tight text-primary">{v}</p>
                <p className="mt-1 text-sm text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map(([title, text], i) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5">
                <span className="text-xs font-semibold text-primary">Step {i + 1}</span>
                <h3 className="mt-1 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <blockquote className="mt-8 rounded-xl border border-border bg-card p-6 text-sm leading-relaxed">
            “We used to find out about surplus when we were scraping trays. Now we know two days
            ahead, and the food goes to the shelter down the road instead of the bin.”
            <footer className="mt-3 text-xs text-muted-foreground">
              Illustrative quote — Food Services Manager, sample deployment
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          See the whole operation in one dashboard
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Explore the live demo with sample data for both a campus kitchen and a food processing
          unit.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Open dashboard <ArrowRight className="size-4" />
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        AnnaSetu · AI Food Redistribution & Surplus Platform
      </footer>
    </div>
  );
}
