/**
 * Metior (MEO) — Offline Snapshot Exporter (2025-10-08)
 * -----------------------------------------------------
 * DEMO MODE: Returns a static MEO snapshot; no external HTTP calls.
 *
 * Finance/FX math (first principles):
 *  - MC_j^USD = P_j^USD * Q_j
 *      fiat: Q_j = M2 (local units), P_j^USD = FX (USD per unit)
 *      metals: Q_j = above-ground stock (oz), P_j^USD = spot (USD/oz)
 *      crypto: Q_j = circulating supply, P_j^USD = coin USD price
 *  - M_world = sum_j MC_j^USD
 *  - P_USD^{MEO} = kappa * M_world, with kappa = 1e-6
 *  - w_j = MC_j^USD / M_world
 *
 * Invariants enforced:
 *  - |sum w - 1| < EPS_SUM
 *  - |P_meo - kappa*M| / P_meo < EPS_PRICE
 */

import snapshotWire from "@/data/weights_2025-10-08.json";

export const KAPPA = 1e-6;
const EPS_SUM = 1e-9;
const EPS_PRICE = 1e-6;

export type MeoWeight = {
  symbol: string;
  mc_usd: number;
  w: number;
};

export type MeoSnapshot = {
  date: string;
  m_world_usd: number;
  meo_usd: number;
  weights: MeoWeight[];
};

export function normalizeSnapshot(raw: any): MeoSnapshot {
  if (!raw || typeof raw !== "object") throw new Error("MEO snapshot: missing or invalid JSON object");

  const date = String(raw.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`MEO snapshot: invalid date '${raw.date}'`);

  if (!Array.isArray(raw.weights) || raw.weights.length === 0) {
    throw new Error("MEO snapshot: weights array is empty");
  }

  const comps: MeoWeight[] = raw.weights.map((r: any) => {
    const symbol = String(r.symbol ?? r.s ?? "");
    const mc = Number(r.mc_usd);
    if (!symbol) throw new Error("MEO snapshot: component missing symbol");
    if (!Number.isFinite(mc) || mc < 0) throw new Error(`MEO snapshot: invalid mc_usd for '${symbol}': ${r.mc_usd}`);
    return { symbol, mc_usd: mc, w: 0 };
  });

  const mWorld = comps.reduce((acc, c) => acc + c.mc_usd, 0);
  const meoPrice = KAPPA * mWorld;

  comps.forEach(c => {
    c.w = mWorld === 0 ? 0 : c.mc_usd / mWorld;
  });

  const sumW = comps.reduce((acc, c) => acc + c.w, 0);
  if (Math.abs(sumW - 1) > EPS_SUM) {
    throw new Error(`MEO invariant: sum weights = ${sumW.toPrecision(12)} (expected 1 ± ${EPS_SUM})`);
  }

  if (raw.m_world_usd) {
    const relCapErr = Math.abs(Number(raw.m_world_usd) - mWorld) / mWorld;
    if (relCapErr > EPS_PRICE) {
      throw new Error(`MEO invariant: m_world_usd mismatch rel=${relCapErr.toExponential()} > ${EPS_PRICE}`);
    }
  }

  if (raw.meo_usd) {
    const relPriceErr = Math.abs(Number(raw.meo_usd) - meoPrice) / meoPrice;
    if (relPriceErr > EPS_PRICE) {
      throw new Error(`MEO invariant: |P - kappa*M|/P = ${relPriceErr.toExponential()} > ${EPS_PRICE}`);
    }
  }

  return { date, m_world_usd: mWorld, meo_usd: meoPrice, weights: comps };
}

export async function getMeoSnapshot(): Promise<MeoSnapshot> {
  console.info("[MEO] Serving offline snapshot 2025-10-08; external APIs disabled.");
  return normalizeSnapshot(snapshotWire);
}

export function fromCaps(
  date: string,
  caps: Array<{ symbol: string; mc_usd: number }>
): MeoSnapshot {
  const m_world_usd = caps.reduce((s, c) => s + c.mc_usd, 0);
  const weights: MeoWeight[] = caps.map(c => ({
    symbol: c.symbol,
    mc_usd: c.mc_usd,
    w: m_world_usd === 0 ? 0 : c.mc_usd / m_world_usd,
  }));
  const sumW = weights.reduce((s, c) => s + c.w, 0);
  if (Math.abs(sumW - 1) > EPS_SUM) {
    throw new Error(`fromCaps invariant: sum w=${sumW} not within ${EPS_SUM}`);
  }
  return { date, m_world_usd, meo_usd: KAPPA * m_world_usd, weights };
}
