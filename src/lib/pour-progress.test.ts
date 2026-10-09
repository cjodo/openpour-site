import { describe, expect, it } from "vitest";

import { filledCells, pourProgress, stageCells } from "@/lib/pour-progress";

const RECIPE = [
  { to: 50, real: 10 },
  { to: 50, real: 30 },
  { to: 150, real: 20 },
];

describe("pourProgress", () => {
  it("starts at the first stage with nothing poured", () => {
    const p = pourProgress(RECIPE, 0);
    expect(p.stage).toEqual({ index: 0, fraction: 0, elapsed: 0, remaining: 10 });
    expect(p.grams).toBe(0);
    expect(p.fraction).toBe(0);
    expect(p.done).toBe(false);
  });

  it("tracks the stage and recipe mid-pour", () => {
    const p = pourProgress(RECIPE, 50);
    expect(p.stage).toEqual({ index: 2, fraction: 0.5, elapsed: 10, remaining: 10 });
    expect(p.stages).toEqual([1, 1, 0.5]);
    expect(p.grams).toBe(100);
    expect(p.fraction).toBeCloseTo(50 / 60);
    expect(p.remaining).toBe(10);
    expect(p.targetGrams).toBe(150);
  });

  it("moves to the next stage exactly at a boundary", () => {
    const p = pourProgress(RECIPE, 10);
    expect(p.stage.index).toBe(1);
    expect(p.stage.fraction).toBe(0);
    expect(p.grams).toBe(50);
  });

  it("clamps past the end and holds on the last stage", () => {
    const p = pourProgress(RECIPE, 999);
    expect(p.stage).toMatchObject({ index: 2, fraction: 1 });
    expect(p.fraction).toBe(1);
    expect(p.grams).toBe(150);
    expect(p.done).toBe(true);
  });
});

describe("bar helpers", () => {
  it("rounds and clamps filled cells", () => {
    expect(filledCells(0.5, 19)).toBe(10);
    expect(filledCells(-1, 19)).toBe(0);
    expect(filledCells(2, 19)).toBe(19);
  });

  it("splits a bar by stage time, at least one cell each", () => {
    const cells = stageCells([{ to: 0, real: 1 }, ...RECIPE], 19);
    expect(cells.reduce((a, b) => a + b, 0)).toBe(19);
    expect(Math.min(...cells)).toBeGreaterThanOrEqual(1);
  });
});
