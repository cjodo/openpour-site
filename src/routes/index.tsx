import { createFileRoute } from "@tanstack/react-router";
import {
  Github,
  Droplets,
  Gauge,
  RotateCw,
  Wifi,
  FlaskConical,
  Printer,
  ShoppingCart,
  Cable,
  Cpu,
  Wrench,
  ArrowRight,
  Code2,
  Wind,
} from "lucide-react";
import heroImg from "@/assets/openpour-hero.jpg";
import detailImg from "@/assets/openpour-detail.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenPour — The open-source automatic pour-over machine" },
      {
        name: "description",
        content:
          "OpenPour is an open-source, 3D-printed automatic pour-over coffee machine. A polar arm traces barista patterns, a flow meter pours by the gram, and an ESP32 serves the control app — no cloud, no app store.",
      },
      { property: "og:title", content: "OpenPour — open-source automatic pour-over" },
      {
        property: "og:description",
        content:
          "3D-printed body, commodity parts, ESP32 firmware in Rust, and a browser app served by the machine itself. Build one for about $170–210.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const GITHUB_URL = "https://github.com/cjodo/openpour";

const features = [
  {
    icon: RotateCw,
    title: "Pours like a barista",
    body: "A two-axis polar arm traces centre, circle and spiral patterns over the dripper — the same motions a careful hand would make.",
  },
  {
    icon: Droplets,
    title: "Pours by the gram",
    body: "An inline flow meter counts every millilitre, and 1 mL of water is 1 g. Each stage stops on its gram target whatever the pump does.",
  },
  {
    icon: FlaskConical,
    title: "Configurable recipes",
    body: "Stages, water, flow rate, pattern, radius, speed and bloom times are all editable in the app and stored on the machine.",
  },
  {
    icon: Wind,
    title: "Low voltage only",
    body: "You fill an insulated reservoir from your own kettle. The machine pumps, meters and measures temperature — it never heats water.",
  },
  {
    icon: Wifi,
    title: "No app store, no cloud",
    body: "The ESP32 serves the control app itself. Open a browser on any phone or laptop, on the machine's own Wi-Fi or yours.",
  },
  {
    icon: Wrench,
    title: "Parametric by design",
    body: "Set your cup and dripper heights in one OpenSCAD file and the column length, head position and parts follow.",
  },
];

const buildSteps = [
  {
    icon: Printer,
    step: "01",
    title: "Print",
    body: "Edit config.scad, run make, and print the parts in PETG or ASA.",
  },
  {
    icon: ShoppingCart,
    step: "02",
    title: "Buy",
    body: "The bill of materials comes to about US$170–210 — commodity parts from the 3D-printer aisle.",
  },
  {
    icon: Cable,
    step: "03",
    title: "Wire",
    body: "Follow the wiring guide: two NEMA17 steppers, a peristaltic pump, a flow meter and a DS18B20 probe.",
  },
  {
    icon: Cpu,
    step: "04",
    title: "Flash",
    body: "cargo run --release builds the web app and firmware, flashes the ESP32 and opens the monitor.",
  },
  {
    icon: Gauge,
    step: "05",
    title: "Calibrate",
    body: "Join the OpenPour Wi-Fi network, open the app, and calibrate the meter against a scale.",
  },
];

const repoRows = [
  ["hardware/cad/", "OpenSCAD model — config.scad holds every dimension; make exports STLs"],
  ["firmware/", "ESP32 firmware in Rust — pourcore logic, esp32 target, and a PC simulator"],
  ["web/", "The control app — TypeScript bundled with esbuild, embedded in the firmware"],
  ["docs/", "BOM, wiring, assembly and calibration guides"],
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Droplets className="h-4.5 w-4.5 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              OpenPour
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#build" className="transition-colors hover:text-foreground">
              Build it
            </a>
          </nav>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">cjodo/openpour</span>
            <span className="sm:hidden">GitHub</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="blueprint-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.78_0.13_75/0.08),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-primary">
                <Code2 className="h-3.5 w-3.5" />
                Open source · Open hardware · Repeatable
              </div>
              <h1 className="font-display text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                The pour-over machine{" "}
                <span className="text-primary">you build yourself.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                OpenPour is an automatic pour-over coffee machine with a
                3D-printed body and commodity parts. A polar arm traces barista
                patterns, a flow meter pours by the gram, and the whole thing
                is controlled from any browser — no app store, no cloud.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="glow-amber inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  <Github className="h-4 w-4" />
                  Build one — it's open source
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  How it works
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono-code text-xs text-muted-foreground">
                <span>
                  <span className="text-primary">$</span> cargo run --release
                </span>
                <span>
                  <span className="text-primary">≈</span> US$170–210 in parts
                </span>
                <span>
                  <span className="text-primary">◦</span> ESP32 · Rust · OpenSCAD
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="glow-amber overflow-hidden rounded-xl border border-border">
                <img
                  src={heroImg}
                  alt="The OpenPour machine pouring a spiral of water into a V60 dripper"
                  width={1600}
                  height={1008}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 left-6 rounded-md border border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 font-mono-code text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-muted-foreground">stage 2/4 · spiral ·</span>
                  <span className="text-primary">312 g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-primary">
              How it works
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Water, metered. Motion, planned.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The firmware converts each pattern from dripper-centred
              coordinates into arm angle and carriage radius 100 times a
              second. Both steppers run in velocity mode so the nozzle follows
              spirals smoothly, and the pump's speed is trimmed by the measured
              flow — cut just early enough that coast-down lands on target.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={detailImg}
                alt="Exploded engineering view of the OpenPour arm, pump and fluid system"
                width={1200}
                height={912}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-4">
              <div className="rounded-lg border border-border bg-background p-5 font-mono-code text-[13px] leading-relaxed">
                <div className="text-muted-foreground"># fluid path</div>
                <div>
                  <span className="text-primary">reservoir</span> ──►{" "}
                  peristaltic pump ──► flow meter ──► nozzle
                </div>
                <div className="mt-3 text-muted-foreground"># motion</div>
                <div>
                  <span className="text-primary">arm</span> ──► radial axis
                  (belt, pancake NEMA17)
                </div>
                <div>
                  <span className="text-primary">arm</span> ──► theta axis
                  (direct-drive NEMA17)
                </div>
                <div className="mt-3 text-muted-foreground"># control</div>
                <div>
                  <span className="text-primary">ESP32</span> ◄── pulses ──
                  Wi-Fi ──► browser app
                </div>
              </div>
              <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  The pump's speed is feed-forward from its calibrated rate,
                  trimmed by the measured flow in real time.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  The web app is embedded in the firmware at build time — the
                  machine serves it itself.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  A host simulator runs the real firmware logic against
                  simulated hardware, so you can develop without a machine.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-primary">
              Features
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Everything a good pour needs. Nothing it doesn't.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Build it */}
      <section id="build" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-primary">
              Build it
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              From filament to first pour in five steps.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {buildSteps.map((s) => (
              <div
                key={s.step}
                className="relative rounded-xl border border-border bg-background p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-primary" />
                  <span className="font-mono-code text-xs text-muted-foreground">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-display font-semibold">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Repo table */}
          <div className="mt-14 overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border bg-background px-5 py-3.5">
              <span className="font-mono-code text-xs text-muted-foreground">
                github.com/<span className="text-foreground">cjodo/openpour</span>
              </span>
            </div>
            <div className="divide-y divide-border bg-card/60">
              {repoRows.map(([path, desc]) => (
                <div
                  key={path}
                  className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6"
                >
                  <span className="font-mono-code text-[13px] text-primary">
                    {path}
                  </span>
                  <span className="text-sm text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/60">
        <div className="blueprint-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <Droplets className="animate-drip mx-auto mb-6 h-8 w-8 text-primary" />
          <h2 className="font-display mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-5xl">
            Better coffee through open hardware.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Every dimension, every line of firmware, every guide — in the repo.
            Print it, flash it, hack it, pour with it.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="glow-amber mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <Github className="h-4 w-4" />
            Star cjodo/openpour on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">
              OpenPour
            </span>
            <span>· open source, repeatable, delicious</span>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Github className="h-4 w-4" />
            github.com/cjodo/openpour
          </a>
        </div>
      </footer>
    </div>
  );
}
