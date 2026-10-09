import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { CodeBlock } from "@/components/code-block";
import { EspressifMark } from "@/components/espressif-mark";
import { GithubMark } from "@/components/github-mark";
import { MachineDiagram } from "@/components/machine-diagram";
import { PartsDiagram } from "@/components/parts-diagram";
import { PourPlot } from "@/components/pour-plot";
import { RustMark } from "@/components/rust-mark";

const DESCRIPTION =
  "OpenPour is an open-source automatic pour-over coffee machine: 3D-printed parts, commodity electronics and ESP32 firmware written in Rust.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenPour: open-source automatic pour-over" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "OpenPour" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

const REPO = "https://github.com/cjodo/openpour";
const repoPath = (path: string) => `${REPO}/tree/main/${path}`;

// The machine repo's LICENSE file.
const LICENCE = { name: "GPL-3.0", href: `${REPO}/blob/main/LICENSE` };

const repoTree = [
  { path: "hardware/cad/", note: "OpenSCAD model; config.scad holds every dimension" },
  { path: "firmware/", note: "ESP32 firmware in Rust, plus a host simulator" },
  { path: "web/", note: "control app, embedded in the firmware at build time" },
  { path: "docs/", note: "bill of materials, wiring, assembly, calibration" },
];

const firmwareParts = [
  {
    name: "pourcore",
    body: "The brewing logic: recipes, pour patterns, pump control and the stop-on-target maths. No hardware dependencies, so it runs anywhere Rust does.",
  },
  {
    name: "ESP32 target",
    body: "Drives the two steppers, the pump and the flow meter, reads the DS18B20, and serves the control app over Wi-Fi.",
  },
  {
    name: "Simulator",
    body: "Runs the real pourcore logic against simulated hardware on your PC, so you can work on the firmware without a machine.",
  },
];

const buildSteps: { title: string; body: ReactNode }[] = [
  {
    title: "Print",
    body: (
      <>
        Set your cup and dripper heights in <Code>config.scad</Code>, run <Code>make</Code> to
        export STLs, and print in PETG or ASA.
      </>
    ),
  },
  {
    title: "Buy",
    body: "Parts are estimated at US$170–210, mostly from the 3D-printer aisle. The BOM is in docs/.",
  },
  {
    title: "Wire",
    body: "Two NEMA17 steppers, a peristaltic pump, a flow meter and a DS18B20 probe, per the wiring guide.",
  },
  {
    title: "Flash",
    body: (
      <>
        <Code>cargo run --release</Code> builds the app and firmware, flashes the ESP32 and opens
        the serial monitor.
      </>
    ),
  },
  {
    title: "Calibrate",
    body: "Join the OpenPour Wi-Fi network, open the app, and calibrate the flow meter against a kitchen scale.",
  },
];

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-sm bg-grounds px-1 py-0.5 font-mono text-[0.9em] text-water">
      {children}
    </code>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-rule py-16 sm:py-20">
      <h2 className="wide text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

const link = "text-crema underline decoration-rule underline-offset-4 hover:decoration-water";

function Index() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-crema focus:px-3 focus:py-2 focus:text-roast"
      >
        Skip to content
      </a>

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-8">
        <a href="#main" className="wide text-lg">
          OpenPour
        </a>
        <nav aria-label="Sections" className="flex items-center gap-5 text-sm sm:gap-8">
          <a href="#open" className="hidden text-husk hover:text-water sm:inline">
            What&rsquo;s open
          </a>
          <a href="#rust" className="hidden text-husk hover:text-water sm:inline">
            Firmware
          </a>
          <a href="#build" className="hidden text-husk hover:text-water sm:inline">
            Build
          </a>
          <a href={REPO} className="inline-flex items-center gap-2 text-crema hover:text-water">
            <GithubMark className="size-4" />
            GitHub
          </a>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 sm:px-8">
        <section className="grid gap-12 pt-8 pb-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14 lg:pt-14 lg:pb-20">
          <div>
            <h1 className="wide text-[clamp(2.75rem,6vw,4.75rem)] text-balance">
              Poured to the gram.
            </h1>
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-husk">
              OpenPour is an open-source automatic pour-over machine. Print the parts, wire up
              commodity electronics, and flash Rust firmware that pours each stage of your recipe to
              the gram. Every file you need is in the repo.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href={REPO}
                className="inline-flex items-center gap-2.5 rounded-sm bg-water-deep px-5 py-3 font-semibold text-white hover:bg-water-deeper"
              >
                <GithubMark className="size-4" />
                cjodo/openpour
              </a>
              <a href={repoPath("docs")} className={link}>
                Read the build guides
              </a>
            </div>
            <p className="mt-9 max-w-[34rem] border-l-2 border-ember pl-4 text-sm leading-relaxed text-husk">
              <strong className="font-semibold text-crema">Early prototype.</strong> The design is
              still changing. Expect rough edges, and open an issue when you hit one.
            </p>
          </div>
          <PourPlot />
        </section>

        <Section id="open" title="What’s open">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div className="max-w-[34rem] space-y-4 leading-relaxed text-husk">
              <p>
                All of it. The CAD, the firmware, the control app and the build guides live together
                in one repository, so a hardware change and the code that drives it land in the same
                commit.
              </p>
              <p>
                The model is parametric, the electronics are off the shelf, and nothing phones home.
                Fork it, resize it for your dripper, and send your changes back.
              </p>
              <p>
                Licence:{" "}
                <a href={LICENCE.href} className={link}>
                  {LICENCE.name}
                </a>
                .
              </p>
            </div>
            <div className="self-start overflow-x-auto rounded-sm border border-rule bg-grounds p-5 font-mono text-sm leading-loose">
              <a href={REPO} className="text-crema hover:text-water">
                openpour/
              </a>
              <ul>
                {repoTree.map((row, i) => (
                  <li
                    key={row.path}
                    className="grid grid-cols-[auto_8.5rem_1fr] gap-x-2 whitespace-nowrap sm:whitespace-normal"
                  >
                    <span className="text-rule" aria-hidden="true">
                      {i === repoTree.length - 1 ? "└──" : "├──"}
                    </span>
                    <a href={repoPath(row.path)} className="text-water hover:text-crema">
                      {row.path}
                    </a>
                    <span className="text-husk">{row.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section id="rust" title="Firmware in Rust">
          <p className="max-w-[40rem] leading-relaxed text-husk">
            A hundred times a second, the firmware turns the pour pattern from dripper-centred
            coordinates into an arm angle and a carriage radius. Both steppers run in velocity mode,
            so the nozzle follows a spiral smoothly. The pump runs feed-forward from its calibrated
            rate, is trimmed by the flow it measures, and is cut just early enough that coast-down
            lands on the gram target.
          </p>
          <dl className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {firmwareParts.map((part) => (
              <div key={part.name} className="border-t border-rule pt-4">
                <dt className="font-mono text-brass">{part.name}</dt>
                <dd className="mt-2 leading-relaxed text-husk">{part.body}</dd>
              </div>
            ))}
          </dl>
          <CodeBlock
            className="mt-10"
            comment="builds the web app and firmware, flashes the ESP32, opens the monitor"
            commands={["cargo run --release"]}
          />
          <p className="mt-4 text-sm text-husk">
            Toolchain setup and simulator instructions are in{" "}
            <a href={repoPath("firmware")} className={link}>
              firmware/
            </a>
            . Built on the{" "}
            <a href="https://www.rust-lang.org" className={link}>
              <RustMark className="mr-1.5 inline size-[1.1em] align-[-0.2em] text-crema" />
              Rust
            </a>{" "}
            toolchain for Espressif's{" "}
            <a href="https://www.espressif.com/en/products/socs/esp32" className={link}>
              <EspressifMark className="mr-1.5 inline size-[1.1em] align-[-0.2em] text-crema" />
              ESP32
            </a>
            .
          </p>
        </Section>

        <Section id="how" title="How it works">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <ul className="max-w-[34rem] space-y-5 leading-relaxed text-husk">
              <li>
                <span className="font-semibold text-water">Water.</span> You fill an insulated
                reservoir from your own kettle. A peristaltic pump moves it through a flow meter to
                the nozzle; 1 mL is 1 g. The machine never heats water.
              </li>
              <li>
                <span className="font-semibold text-water">Motion.</span> A two-axis polar arm, with
                a direct-drive NEMA17 for angle and a belt-driven one for radius, traces centre,
                circle and spiral patterns over the dripper.
              </li>
              <li>
                <span className="font-semibold text-water">Control.</span> The ESP32 serves the app
                itself. Open a browser on any phone or laptop, on the machine&rsquo;s own Wi-Fi or
                yours. Recipes are edited there and stored on the machine.
              </li>
            </ul>
            <MachineDiagram />
          </div>
        </Section>

        <Section id="build" title="Build one">
          <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {buildSteps.map((s, i) => (
              <li key={s.title}>
                <span className="wide figures text-3xl text-brass" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-husk">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14">
            <PartsDiagram />
          </div>
        </Section>

        <Section id="contribute" title="Contribute">
          <p className="max-w-[40rem] leading-relaxed text-husk">
            OpenPour gets better with every machine built. Report what broke, share your prints and
            tweaks, or pick up an issue. Pull requests to the CAD, the firmware and the docs are all
            welcome.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
            <a href={`${REPO}/issues`} className={link}>
              Browse open issues
            </a>
            <a href={REPO} className={link}>
              Star the repo
            </a>
          </div>
        </Section>
      </main>

      <footer className="border-t border-rule bg-grounds">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-husk sm:flex-row sm:justify-between sm:px-8">
          <div className="space-y-1">
            <p>OpenPour is open-source hardware and software.</p>
            <p className="text-xs">
              Rust is a trademark of the Rust Foundation. ESP32 is a trademark of Espressif Systems.
              OpenPour is not affiliated with or endorsed by either.
            </p>
          </div>
          <a href={REPO} className="self-start hover:text-water">
            github.com/cjodo/openpour
          </a>
        </div>
      </footer>
    </>
  );
}
