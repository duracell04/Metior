import { fetchJson } from "./http";

const KAPPA = 1e-6;

const M2_SERIES: Record<string, string> = {
  USD: "M2SL",
  EUR: "MYAGM2EZM196N",
  JPY: "MYAGM2JPM196N",
  CHF: "MYAGM2CHM196N",
};

const FX_FRED: Record<string, string> = {
  EUR: "DEXUSEU",
  CHF: "DEXSZUS",
  JPY: "DEXJPUS",
};

const GOLD_SERIES = "GOLDAMGBD228NLBM";
const SILVER_SERIES = "SLVPRUSD";
const GOLD_STOCK_OZ = 205_000 * 32_150.7;
const SILVER_STOCK_OZ = 1_600_000 * 32_150.7;

const fredBase = "https://api.stlouisfed.org/fred/series/observations";
const fredKey = process.env.FRED_API_KEY || "";
const isValidFredKey = (key: string | undefined | null): key is string =>
  typeof key === "string" && /^[a-z0-9]{32}$/.test(key);
let warnedFredKey = false;

type FredResponse = { observations?: { value: string }[] };

const lastFredValue = async (series: string) => {
  // If the key is missing/invalid, skip FRED entirely to avoid 400s.
  if (!isValidFredKey(fredKey)) {
    if (!warnedFredKey) {
      console.warn("[FRED] FRED_API_KEY missing/invalid — skipping FRED calls (rate-limited demo only).");
      warnedFredKey = true;
    }
    return null;
  }

  const params: Record<string, string | number | undefined> = {
    series_id: series,
    sort_order: "desc",
    limit: 1,
    file_type: "json",
  };

  params.api_key = fredKey;

  const data = await fetchJson<FredResponse>(fredBase, {
    params,
    cacheKey: `fred:${series}`,
    ttlMs: 1000 * 60 * 60 * 12,
  });
  const v = data.observations?.[0]?.value;
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

type YahooChart = { chart?: { result?: { indicators?: { quote?: { close?: number[] }[] }[] }[] } };

const yahooFx = async (ccy: string) => {
  if (ccy === "USD") return 1;
  const pair = `${ccy}USD=X`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}`;
  const data = await fetchJson<YahooChart>(url, { cacheKey: `yahoo:${pair}`, ttlMs: 1000 * 60 * 60 * 6 });
  const close = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(n => Number.isFinite(n));
  if (close && close.length) return close[close.length - 1] as number;
  return null;
};

const fxRate = async (ccy: string) => {
  const yahoo = await yahooFx(ccy);
  if (yahoo && yahoo > 0) return yahoo;

  const fallbackSeries = FX_FRED[ccy];
  if (fallbackSeries) {
    const fred = await lastFredValue(fallbackSeries);
    if (fred && fred > 0) return fred;
  }

  return null;
};

type CoinGeckoMarket = { symbol?: string; market_cap?: number }[];

const coingeckoCaps = async () => {
  const data = await fetchJson<CoinGeckoMarket>("https://api.coingecko.com/api/v3/coins/markets", {
    params: { vs_currency: "usd", ids: "bitcoin,ethereum" },
    cacheKey: "cg:btceth",
    ttlMs: 1000 * 60 * 15,
    timeoutMs: 12_000,
  });
  const out: Record<string, number> = {};
  data.forEach(d => {
    if (d.symbol && Number.isFinite(d.market_cap)) {
      out[d.symbol.toUpperCase()] = d.market_cap as number;
    }
  });
  return out;
};

export async function buildMeoSnapshot() {
  const rows: { symbol: string; mc_usd: number }[] = [];

  await Promise.all(
    Object.entries(M2_SERIES).map(async ([ccy, series]) => {
      const m2 = await lastFredValue(series);
      const rate = await fxRate(ccy);
      if (m2 && rate) {
        rows.push({ symbol: ccy, mc_usd: m2 * rate });
      }
    })
  );

  const gold = await lastFredValue(GOLD_SERIES);
  if (gold) rows.push({ symbol: "XAU", mc_usd: gold * GOLD_STOCK_OZ });
  const silver = await lastFredValue(SILVER_SERIES);
  if (silver) rows.push({ symbol: "XAG", mc_usd: silver * SILVER_STOCK_OZ });

  const caps = await coingeckoCaps();
  if (caps.BTC) rows.push({ symbol: "BTC", mc_usd: caps.BTC });
  if (caps.ETH) rows.push({ symbol: "ETH", mc_usd: caps.ETH });

  if (!rows.length) {
    throw new Error("no components available");
  }

  const total = rows.reduce((s, r) => s + r.mc_usd, 0);
  const weights = rows
    .map(r => ({ ...r, weight: r.mc_usd / total }))
    .sort((a, b) => b.weight - a.weight);

  return {
    date: new Date().toISOString().slice(0, 10),
    meo_usd: KAPPA * total,
    m_world_usd: total,
    weights,
  };
}
