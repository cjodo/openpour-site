/*
 * Where a pour is, given how long it has been running. Everything here is in
 * real seconds at the machine, so a progress bar, a countdown or a gram
 * readout can all be driven from the one `pourProgress` call.
 */

export type RecipeStage = {
  /** Cumulative grams in the cup once this stage finishes. */
  to: number;
  /** How long the stage takes at the machine, in seconds. */
  real: number;
};

export type StageProgress = {
  index: number;
  /** 0 → 1 through this stage. */
  fraction: number;
  elapsed: number;
  remaining: number;
};

export type PourProgress = {
  /** The stage running now; the last stage once the pour is done. */
  stage: StageProgress;
  /** 0 → 1 for every stage: 1 once finished, 0 before it starts. */
  stages: number[];
  /** 0 → 1 through the whole recipe, by time. */
  fraction: number;
  elapsed: number;
  remaining: number;
  total: number;
  grams: number;
  targetGrams: number;
  done: boolean;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function recipeDuration(stages: readonly RecipeStage[]) {
  return stages.reduce((sum, s) => sum + s.real, 0);
}

export function pourProgress(stages: readonly RecipeStage[], elapsed: number): PourProgress {
  if (stages.length === 0) throw new Error("pourProgress: recipe has no stages");

  const total = recipeDuration(stages);
  const clock = Math.min(total, Math.max(0, elapsed));
  const fractions: number[] = [];
  let stage: StageProgress | null = null;
  let grams = 0;
  let start = 0;
  let from = 0;

  for (let index = 0; index < stages.length; index++) {
    const { to, real } = stages[index]!;
    // A zero-length stage is finished the moment it is reached.
    const fraction = real > 0 ? clamp01((clock - start) / real) : clock >= start ? 1 : 0;
    fractions.push(fraction);
    if (fraction > 0) grams = from + (to - from) * fraction;
    if (!stage && (fraction < 1 || index === stages.length - 1)) {
      stage = { index, fraction, elapsed: real * fraction, remaining: real * (1 - fraction) };
    }
    start += real;
    from = to;
  }

  return {
    stage: stage!,
    stages: fractions,
    fraction: total > 0 ? clock / total : 1,
    elapsed: clock,
    remaining: total - clock,
    total,
    grams,
    targetGrams: stages.at(-1)!.to,
    done: clock >= total,
  };
}

/** Whole cells to fill for a bar `cells` wide at `fraction` (0 → 1). */
export function filledCells(fraction: number, cells: number) {
  return Math.round(clamp01(fraction) * cells);
}

/**
 * Split a bar `cells` wide across the stages in proportion to their time:
 * largest remainder, and at least one cell each so short stages stay visible.
 */
export function stageCells(stages: readonly RecipeStage[], cells: number) {
  const total = recipeDuration(stages);
  const exact = stages.map((s) => (total > 0 ? (s.real / total) * cells : cells / stages.length));
  const out = exact.map((x) => Math.max(1, Math.floor(x)));
  const byRemainder = exact.map((x, i) => ({ i, r: x - Math.floor(x) })).sort((a, b) => b.r - a.r);
  for (let k = 0; out.reduce((a, b) => a + b, 0) < cells; k++) {
    out[byRemainder[k % byRemainder.length]!.i]! += 1;
  }
  return out;
}
