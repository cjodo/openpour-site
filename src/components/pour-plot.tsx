import { useEffect, useMemo, useRef, useState } from "react";

import { filledCells, type PourProgress, pourProgress, stageCells } from "@/lib/pour-progress";

/*
 * A top-down view of the dripper while OpenPour runs a four-stage V60 recipe.
 * The nozzle traces centre / spiral / circle patterns as classical curves (a
 * rose, a double Archimedean spiral, a hypotrochoid), the arm is drawn from its real pivot
 * (the column), and the gram counter climbs to each stage's target. Demo time
 * is compressed: `dur` is how long a stage plays on screen, `real` is how long
 * it takes at the machine.
 */

type Pattern = "centre" | "spiral" | "circle";

type Stage = {
  name: string;
  pattern: Pattern | null;
  to: number;
  dur: number;
  real: number;
};

const STAGES: Stage[] = [
  { name: "Bloom", pattern: "centre", to: 50, dur: 2.4, real: 10 },
  { name: "Rest", pattern: null, to: 50, dur: 1.6, real: 35 },
  { name: "Second pour", pattern: "spiral", to: 150, dur: 6.4, real: 30 },
  { name: "Third pour", pattern: "circle", to: 250, dur: 3.2, real: 30 },
  { name: "Final pour", pattern: "spiral", to: 320, dur: 5.4, real: 25 },
  { name: "Drawdown", pattern: null, to: 320, dur: 2.8, real: 60 },
];

const LOOP = STAGES.reduce((sum, s) => sum + s.dur, 0);

// Arm pivot sits at the column, up and to the left of the dripper.
const PIVOT = { x: -128, y: -118 };
// 1 SVG unit ≈ 0.53 mm, so the 110-unit rim is a V60-02's 58 mm radius.
const MM_PER_UNIT = 0.53;

// Each stage's pattern is turned by the golden angle from the last, so repeat
// pours land between earlier tracks instead of on top of them (phyllotaxis).
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const TAU = Math.PI * 2;

/*
 * The spiral is Archimedes' r = bθ taken for negative θ as well: two arms that
 * meet in a smooth S at the centre and interleave half a pitch apart. The
 * nozzle goes out along one arm, turns back in a half-circle at the rim, and
 * comes home along the other, so no track crosses another. Archimedes keeps
 * the tracks evenly spaced, and the nozzle moves at a constant speed along
 * the path, so a steady flow lays the same water on every part of the bed.
 */
const SPIRAL_TURNS = 3;
const SPIRAL_RIM = 64;
const SPIRAL = (() => {
  const end = SPIRAL_TURNS * TAU;
  const b = SPIRAL_RIM / end;
  const outer = SPIRAL_RIM;
  const inner = b * (end - Math.PI);
  const mid = (outer + inner) / 2;
  const bend = (outer - inner) / 2;
  const dir = (a: number) => ({ x: Math.cos(a), y: Math.sin(a) });
  const ux = dir(end);
  const uy = dir(end + Math.PI / 2);

  // u runs 0 → 1 out the first arm, 1 → 2 round the bend, 2 → 3 back in.
  const at = (u: number) => {
    if (u <= 1) {
      const a = u * end;
      const d = dir(a);
      return { x: b * a * d.x, y: b * a * d.y };
    }
    if (u <= 2) {
      const f = (u - 1) * Math.PI;
      const c = Math.cos(f) * bend;
      const s = Math.sin(f) * bend;
      return { x: ux.x * (mid + c) + uy.x * s, y: ux.y * (mid + c) + uy.y * s };
    }
    const a = (3 - u) * (end - Math.PI);
    const d = dir(a + Math.PI);
    return { x: b * a * d.x, y: b * a * d.y };
  };

  // Tabulate arc length so the pattern can be walked at a constant speed.
  const samples = 4000;
  const points = Array.from({ length: samples + 1 }, (_, i) => at((i / samples) * 3));
  const lengths = [0];
  for (let i = 1; i <= samples; i++) {
    const p = points[i]!;
    const q = points[i - 1]!;
    lengths.push(lengths[i - 1]! + Math.hypot(p.x - q.x, p.y - q.y));
  }
  return { points, lengths };
})();

function spiralPoint(p: number) {
  const { points, lengths } = SPIRAL;
  const target = Math.min(1, Math.max(0, p)) * lengths.at(-1)!;
  let lo = 0;
  let hi = lengths.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (lengths[m]! < target) lo = m;
    else hi = m;
  }
  const span = lengths[hi]! - lengths[lo]!;
  const f = span > 0 ? (target - lengths[lo]!) / span : 0;
  const a = points[lo]!;
  const z = points[hi]!;
  return { x: a.x + (z.x - a.x) * f, y: a.y + (z.y - a.y) * f };
}

function patternPoint(pattern: Pattern, p: number, phase = 0): { x: number; y: number } {
  let x: number;
  let y: number;
  switch (pattern) {
    case "centre": {
      // Rhodonea r = cos(4θ/3): eight petals that close after three turns.
      const a = p * 3 * TAU;
      const r = 9 * Math.cos((4 / 3) * a);
      x = r * Math.cos(a);
      y = r * Math.sin(a);
      break;
    }
    case "circle": {
      // Hypotrochoid: a ring at r = 48 carrying a 9-unit epicycle, closed after
      // four turns into a 17-loop band that wets the bed from r = 39 to 57.
      const a = p * 4 * TAU;
      x = 48 * Math.cos(a) + 9 * Math.cos((21 / 4) * a);
      y = 48 * Math.sin(a) + 9 * Math.sin((21 / 4) * a);
      break;
    }
    case "spiral":
      ({ x, y } = spiralPoint(p));
      break;
  }
  // Start at twelve o'clock, then turn by the stage's phase.
  const turn = phase - Math.PI / 2;
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  return { x: x * c - y * s, y: x * s + y * c };
}

function phaseOf(index: number) {
  return index * GOLDEN_ANGLE;
}

function tracePath(pattern: Pattern, upTo: number, phase: number): string {
  const steps = Math.max(2, Math.round(720 * upTo));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const { x, y } = patternPoint(pattern, (i / steps) * upTo, phase);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

// Map compressed demo time onto real seconds at the machine.
function clockAt(t: number) {
  let start = 0;
  let realStart = 0;
  for (const stage of STAGES) {
    if (t < start + stage.dur) return realStart + stage.real * ((t - start) / stage.dur);
    start += stage.dur;
    realStart += stage.real;
  }
  return realStart;
}

// The nozzle rests where the latest pattern it has started left it.
function nozzleAt(progress: PourProgress) {
  let nozzle = { x: 0, y: 0 };
  STAGES.forEach((stage, i) => {
    const fraction = progress.stages[i]!;
    if (stage.pattern && fraction > 0) nozzle = patternPoint(stage.pattern, fraction, phaseOf(i));
  });
  return nozzle;
}

function formatClock(seconds: number) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// Box-drawing glyphs are 0.606em in Paper Mono, so 19 at text-lg fill the 13rem column.
const BAR_CELLS = 19;

// Each pattern draws its bar in its own line style; rests are dotted.
const GLYPHS: Record<Pattern | "rest", { fill: string; empty: string }> = {
  centre: { fill: "━", empty: "─" },
  spiral: { fill: "╍", empty: "┄" },
  circle: { fill: "═", empty: "─" },
  rest: { fill: "┅", empty: "┄" },
};

function glyphsFor(stage: Stage) {
  return GLYPHS[stage.pattern ?? "rest"];
}

const barClass = "overflow-hidden font-mono text-lg leading-none whitespace-nowrap";

function Cells({ stage, filled, empty }: { stage: Stage; filled: number; empty: number }) {
  const { fill, empty: rest } = glyphsFor(stage);
  return (
    <>
      <span className={stage.pattern ? "text-water" : "text-husk"}>{fill.repeat(filled)}</span>
      <span className="text-rule">{rest.repeat(empty)}</span>
    </>
  );
}

function ProgressBar({ stage, fraction }: { stage: Stage; fraction: number }) {
  const filled = filledCells(fraction, BAR_CELLS);
  return (
    <span className={`col-span-2 mt-1.5 ${barClass}`} aria-hidden="true">
      <Cells stage={stage} filled={filled} empty={BAR_CELLS - filled} />
    </span>
  );
}

// The whole recipe in one bar: each stage gets cells in proportion to its real
// time (largest remainder, at least one cell), drawn in its own glyph.
const STAGE_CELLS = stageCells(STAGES, BAR_CELLS);

function RecipeBar({ fraction }: { fraction: number }) {
  const filled = filledCells(fraction, BAR_CELLS);
  let start = 0;
  return (
    <div className={`mt-2 ${barClass}`} aria-hidden="true">
      {STAGES.map((stage, i) => {
        const cells = STAGE_CELLS[i]!;
        const done = Math.min(cells, Math.max(0, filled - start));
        start += cells;
        return <Cells key={stage.name} stage={stage} filled={done} empty={cells - done} />;
      })}
    </div>
  );
}

// With motion reduced, hold on the moment every pattern has been drawn.
const STILL_FRAME = LOOP - STAGES.at(-1)!.dur + 0.01;

export function PourPlot() {
  const reducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [t, setT] = useState(0);
  const tRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setT(STILL_FRAME);
      return;
    }
    if (paused) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      tRef.current = (tRef.current + (now - last) / 1000) % LOOP;
      last = now;
      setT(tRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, reducedMotion]);

  const progress = pourProgress(STAGES, clockAt(t));
  const { index, fraction } = progress.stage;
  const active = STAGES[index]!;
  const pouring = active.pattern !== null && fraction < 1;
  const nozzle = nozzleAt(progress);

  // Finished stages never change, so only the live one is re-traced per frame.
  const finishedPaths = useMemo(
    () =>
      STAGES.slice(0, index).flatMap((s, i) =>
        s.pattern ? [tracePath(s.pattern, 1, phaseOf(i))] : [],
      ),
    [index],
  );
  const livePath = active.pattern ? tracePath(active.pattern, fraction, phaseOf(index)) : null;

  const dx = nozzle.x - PIVOT.x;
  const dy = nozzle.y - PIVOT.y;
  const armAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const carriage = Math.hypot(dx, dy) * MM_PER_UNIT;

  return (
    <figure className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-center">
      <div className="relative mx-auto w-full max-w-[30rem]">
        <svg
          viewBox="-150 -150 300 300"
          className="block w-full"
          role="img"
          aria-label={`Top-down view of the dripper. ${active.name}, ${Math.round(progress.grams)} grams poured.`}
        >
          {/* Polar grid: the arm moves in angle and radius, so this is its native frame. */}
          <g className="stroke-rule" fill="none" strokeWidth="0.75">
            {[22, 44, 66, 88].map((r) => (
              <circle key={r} r={r} strokeDasharray="1.5 3" />
            ))}
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * Math.PI) / 6;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * 22}
                  y1={Math.sin(a) * 22}
                  x2={Math.cos(a) * 110}
                  y2={Math.sin(a) * 110}
                  strokeDasharray="1.5 3"
                />
              );
            })}
          </g>

          {/* Dripper rim and coffee bed. */}
          <circle r="110" fill="none" className="stroke-husk" strokeWidth="1.5" />
          <circle r="72" className="fill-grounds" />

          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {finishedPaths.map((d, i) => (
              <path key={i} d={d} className="stroke-water-deep" strokeWidth="1.6" />
            ))}
            {livePath && <path d={livePath} className="stroke-water" strokeWidth="2.2" />}
          </g>

          {/* Arm from the column pivot to the nozzle. */}
          <line
            x1={PIVOT.x}
            y1={PIVOT.y}
            x2={nozzle.x}
            y2={nozzle.y}
            className="stroke-crema/50"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle
            cx={PIVOT.x}
            cy={PIVOT.y}
            r="9"
            className="fill-roast-shade-2 stroke-crema/60"
            strokeWidth="2"
          />
          <circle
            cx={nozzle.x}
            cy={nozzle.y}
            r={pouring ? 5 : 3.5}
            className={pouring ? "fill-water" : "fill-ember"}
          />
        </svg>
      </div>

      <figcaption className="figures">
        <div className="flex items-baseline justify-between gap-4">
          <span className="wide text-5xl text-brass" aria-hidden="true">
            {Math.round(progress.grams)}
            <span className="ml-1 text-2xl text-husk">g</span>
          </span>
          <span className="text-lg text-husk" aria-hidden="true">
            {formatClock(progress.elapsed)}
          </span>
        </div>
        <RecipeBar fraction={progress.fraction} />

        <ol className="mt-3 text-sm" aria-label="Recipe stages">
          {STAGES.map((stage, i) => {
            const isActive = i === index;
            const done = i < index;
            return (
              <li
                key={stage.name}
                className={`grid grid-cols-[1fr_auto] gap-x-3 py-1.5 ${
                  isActive ? "text-crema" : done ? "text-husk" : "text-husk/60"
                }`}
              >
                <span>
                  {stage.name}
                  <span
                    className={`block text-xs ${isActive && stage.pattern ? "text-water" : "text-husk"}`}
                  >
                    {stage.pattern ?? "no water"}
                  </span>
                </span>
                <span>{stage.pattern ? `${stage.to} g` : `${stage.real} s`}</span>
                {isActive && <ProgressBar stage={stage} fraction={fraction} />}
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-rule pt-3 text-xs text-husk">
          <span className="whitespace-nowrap">
            arm {armAngle.toFixed(1)}° &nbsp; carriage {carriage.toFixed(0)} mm
          </span>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="rounded-sm px-1.5 py-0.5 text-crema underline decoration-rule underline-offset-4 hover:decoration-water"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
