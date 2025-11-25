import { describe, it, expect } from "vitest";

import { normalizeSnapshot, KAPPA } from "@/lib/meo-data";
import snapshot from "@/data/weights_2025-10-08.json";

describe("MEO snapshot invariants", () => {
  it("validates Σw≈1 and P≈κ·M for 2025-10-08", () => {
    const s = normalizeSnapshot(snapshot);
    const sumW = s.weights.reduce((a, c) => a + c.w, 0);
    const rel = Math.abs(s.meo_usd - KAPPA * s.m_world_usd) / (KAPPA * s.m_world_usd);
    expect(Math.abs(sumW - 1)).toBeLessThan(1e-9);
    expect(rel).toBeLessThan(1e-6);
  });

  it("catches broken caps/weights with a good error", () => {
    const bad = structuredClone(snapshot) as any;
    bad.weights[0].mc_usd = 123; // break it on purpose
    expect(() => normalizeSnapshot(bad)).toThrow(/invariant/i);
  });
});
