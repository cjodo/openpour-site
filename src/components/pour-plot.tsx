import { useEffect, useMemo, useRef, useState } from "react";

/*
 * A top-down view of the dripper while OpenPour runs a four-stage V60 recipe.
 * The nozzle traces the same centre / spiral / circle patterns the firmware
 * uses, the arm is drawn from its real pivot (the column), and the gram
 * counter climbs to each stage's target. Demo time is compressed: `dur` is how
 * long a stage plays on screen, `real` is how long it takes at the machine.
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
  { name: "Second pour", pattern: "spiral", to: 150, dur: 3.6, real: 30 },
  { name: "Third pour", pattern: "circle", to: 250, dur: 3.2, real: 30 },
  { name: "Final pour", pattern: "spiral", to: 320, dur: 2.6, real: 25 },
  { name: "Drawdown", pattern: null, to: 320, dur: 2.8, real: 60 },
];

const LOOP = STAGES.reduce((sum, s) => sum + s.dur, 0);

// Arm pivot sits at the column, up and to the left of the dripper.
const PIVOT = { x: -128, y: -118 };
// 1 SVG unit ≈ 0.53 mm, so the 110-unit rim is a V60-02's 58 mm radius.
const MM_PER_UNIT = 0.53;

function patternPoint(pattern: Pattern, p: number): { x: number; y: number } {
  let r: number;
  let turns: number;
  switch (pattern) {
    case "centre":
      r = 7;
      turns = 3;
      break;
    case "circle":
      r = 52;
      turns = 4;
      break;
    case "spiral":
      // Out to the edge of the bed and back in again.
      r = 12 + 52 * (p < 0.5 ? p * 2 : (1 - p) * 2);
      turns = 5;
      break;
  }
  const a = p * turns * Math.PI * 2 - Math.PI / 2;
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

function tracePath(pattern: Pattern, upTo: number): string {
  const steps = Math.max(2, Math.round(260 * upTo));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const { x, y } = patternPoint(pattern, (i / steps) * upTo);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

type Snapshot = {
  index: number;
  progress: number;
  grams: number;
  clock: number;
  nozzle: { x: number; y: number };
};

function snapshotAt(t: number): Snapshot {
  let start = 0;
  let from = 0;
  let realStart = 0;
  let nozzle = { x: 0, y: 0 };
  for (let index = 0; index < STAGES.length; index++) {
    const stage = STAGES[index]!;
    if (t < start + stage.dur || index === STAGES.length - 1) {
      const progress = Math.min(1, (t - start) / stage.dur);
      if (stage.pattern) nozzle = patternPoint(stage.pattern, progress);
      return {
        index,
        progress,
        grams: from + (stage.to - from) * progress,
        clock: realStart + stage.real * progress,
        nozzle,
      };
    }
    if (stage.pattern) nozzle = patternPoint(stage.pattern, 1);
    start += stage.dur;
    from = stage.to;
    realStart += stage.real;
  }
  throw new Error("unreachable");
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

  const snap = snapshotAt(t);
  const active = STAGES[snap.index]!;
  const pouring = active.pattern !== null && snap.progress < 1;

  // Finished stages never change, so only the live one is re-traced per frame.
  const finishedPaths = useMemo(
    () =>
      STAGES.slice(0, snap.index)
        .filter((s): s is Stage & { pattern: Pattern } => s.pattern !== null)
        .map((s) => tracePath(s.pattern, 1)),
    [snap.index],
  );
  const livePath = active.pattern ? tracePath(active.pattern, snap.progress) : null;

  const dx = snap.nozzle.x - PIVOT.x;
  const dy = snap.nozzle.y - PIVOT.y;
  const armAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const carriage = Math.hypot(dx, dy) * MM_PER_UNIT;

  return (
    <figure className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-center">
      <div className="relative mx-auto w-full max-w-[30rem]">
        <svg
          viewBox="-150 -150 300 300"
          className="block w-full"
          role="img"
          aria-label={`Top-down view of the dripper. ${active.name}, ${Math.round(snap.grams)} grams poured.`}
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
            x2={snap.nozzle.x}
            y2={snap.nozzle.y}
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
            cx={snap.nozzle.x}
            cy={snap.nozzle.y}
            r={pouring ? 5 : 3.5}
            className={pouring ? "fill-water" : "fill-ember"}
          />
        </svg>
      </div>

      <figcaption className="figures">
        <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
          <span className="wide text-5xl text-brass" aria-hidden="true">
            {Math.round(snap.grams)}
            <span className="ml-1 text-2xl text-husk">g</span>
          </span>
          <span className="text-lg text-husk" aria-hidden="true">
            {formatClock(snap.clock)}
          </span>
        </div>

        <ol className="mt-3 text-sm" aria-label="Recipe stages">
          {STAGES.map((stage, i) => {
            const isActive = i === snap.index;
            const done = i < snap.index;
            return (
              <li
                key={stage.name}
                className={`relative grid grid-cols-[1fr_auto] gap-x-3 py-1.5 ${
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
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 h-px bg-water"
                    style={{ width: `${snap.progress * 100}%` }}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-rule pt-3 text-xs text-husk">
          <span>
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
