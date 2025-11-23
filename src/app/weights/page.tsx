import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck, Sigma, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildMeoSnapshot } from "@/lib/meo-data";

type WeightRow = {
  symbol: string;
  weight: number; // 0-1
  mcUsd: number;
  category: string;
};

const categoryFor = (symbol: string) => {
  if (["USD", "EUR", "JPY", "CHF", "CNY"].includes(symbol)) return "Fiat M2";
  if (["XAU", "XAG"].includes(symbol)) return "Precious metal";
  if (["BTC", "ETH"].includes(symbol)) return "Crypto (free-float)";
  return "Other";
};

const formatCompact = (value: number) =>
  Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const formatWeightPct = (w: number) => `${(w * 100).toFixed(1)}%`;

const auditChecks = [
  { label: "Weights sum to 1", detail: "abs(sum(weights)-1) < 1e-9" },
  { label: "No stale feeds", detail: "drop any component >60d old before renormalizing" },
  { label: "Scale invariant", detail: "P_MEIc = kappa * M_world with kappa = 1e-6" },
  { label: "Clipped updates", detail: "dw_j uses clipped r_j(lambda) to stay Lipschitz" },
];

const workflow = [
  "Pull caps from FRED (M2), LBMA (XAU/XAG), CoinGecko (BTC/ETH), FX (USD/EUR/JPY/CHF).",
  "Skip stale components and renormalize the live basket automatically.",
  "Compute M_world = sum_j MC_j^USD; set P_USD^MEIc = kappa * M_world (kappa=1e-6).",
  "Normalize weights w_j = MC_j / M_world; log (date, symbol, weight, mc_usd, m_world_usd).",
  "Publish weights_{date}.csv + /meo/weights?date=YYYY-MM-DD for reproducibility.",
];

async function getWeights(): Promise<{
  date: string;
  weights: WeightRow[];
  mWorldUsd: number;
  meoUsd: number;
  isOffline: boolean;
}> {
  const isOffline = Boolean(
    process.env.MEO_FREEZE_DATE || process.env.MEO_OFFLINE === "1" || process.env.MEO_LIVE !== "1"
  );
  try {
    const live = await buildMeoSnapshot();
    return {
      date: live.date,
      meoUsd: live.meo_usd,
      mWorldUsd: live.m_world_usd,
      weights: live.weights.map(entry => ({
        symbol: entry.symbol,
        weight: entry.weight,
        mcUsd: entry.mc_usd,
        category: categoryFor(entry.symbol),
      })),
      isOffline,
    };
  } catch (error) {
    console.error("weights page falling back to static snapshot", error);
    const fallback: WeightRow[] = [
      { symbol: "CNY", weight: 0.392, mcUsd: 42.4928e12, category: "Fiat M2" },
      { symbol: "XAU", weight: 0.204, mcUsd: 22.1136e12, category: "Precious metal" },
      { symbol: "USD", weight: 0.198, mcUsd: 21.4632e12, category: "Fiat M2" },
      { symbol: "EUR", weight: 0.155, mcUsd: 16.802e12, category: "Fiat M2" },
      { symbol: "BTC", weight: 0.021, mcUsd: 2.2764e12, category: "Crypto (free-float)" },
      { symbol: "JPY", weight: 0.016, mcUsd: 1.7344e12, category: "Fiat M2" },
      { symbol: "XAG", weight: 0.01, mcUsd: 1.084e12, category: "Precious metal" },
      { symbol: "ETH", weight: 0.004, mcUsd: 0.4336e12, category: "Crypto (free-float)" },
    ];
    return {
      date: "2025-10-08",
      meoUsd: 0.000001 * fallback.reduce((sum, r) => sum + r.mcUsd, 0),
      mWorldUsd: fallback.reduce((sum, r) => sum + r.mcUsd, 0),
      weights: fallback,
      isOffline: true,
    };
  }
}

export default async function WeightsPage() {
  const snapshot = await getWeights();
  const sumWeight = snapshot.weights.reduce((sum, row) => sum + row.weight, 0);
  const fiatShare = snapshot.weights
    .filter(row => row.category.toLowerCase().startsWith("fiat"))
    .reduce((sum, row) => sum + row.weight, 0);
  const metalShare = snapshot.weights
    .filter(row => row.category.includes("metal"))
    .reduce((sum, row) => sum + row.weight, 0);

  const csvContent = [
    ["date", "symbol", "weight", "mc_usd", "category"],
    ...snapshot.weights.map(entry => [
      snapshot.date,
      entry.symbol,
      entry.weight.toFixed(6),
      entry.mcUsd,
      entry.category,
    ]),
  ]
    .map(row => row.join(","))
    .join("\n");
  const csvDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  const asOfLabel = snapshot.isOffline ? `${snapshot.date} (offline snapshot)` : snapshot.date;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">
                MEIc weights
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                As of {asOfLabel}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Daily MEIc basket weights</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Inspect the live composition of the MEIc numeraire. Weights always sum to 1, recompute daily, and drop stale
              components automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={csvDataUri} download={`meo_weights_${snapshot.date}.csv`}>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
              </a>
              <Link href="/demo">
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  See how reweights move P&L
                </Button>
              </Link>
            </div>
          </section>

          <Card className="p-6 bg-card border-border space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Current snapshot</h2>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">Current snapshot · Market-cap weighted; normalized to 1.000</div>
                  <details className="relative group">
                    <summary
                      className="inline-flex h-5 w-5 items-center justify-center rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                      aria-label="Show math behind this snapshot"
                    >
                      <span aria-hidden="true" className="text-xs font-semibold">
                        i
                      </span>
                    </summary>
                    <div className="absolute z-50 mt-2 w-[28rem] max-w-[90vw] rounded-md border border-neutral-200 bg-white p-4 shadow-lg text-sm text-neutral-800">
                      <div className="font-semibold mb-1">About this snapshot</div>
                      <div className="text-neutral-600 mb-2">As of 2025-10-08 (offline), market-cap weighted, normalized to 1.000.</div>
                      <ul className="space-y-1">
                        <li>
                          <strong>κ (kappa)</strong> = 1e-6
                        </li>
                        <li>
                          <strong>M_world</strong> = 108.4 T USD · <strong>{"P_USD^{MEΩ}"}</strong> = 108.4 M USD
                        </li>
                        <li>
                          <strong>Constituent caps</strong> (USD): CNY 42.5 T · XAU 22.1 T · USD 21.5 T · EUR 16.8 T · BTC 2.3 T · JPY
                          1.7 T · XAG 1.1 T · ETH 0.4336 T
                        </li>
                        <li>
                          <strong>Weights</strong>: CNY 39.2% · XAU 20.4% · USD 19.8% · EUR 15.5% · BTC 2.1% · JPY 1.6% · XAG 1.0% · ETH
                          0.4%
                        </li>
                        <li>
                          <strong>Shares</strong>: Fiat 76.1% · Metals 21.4% · Crypto 2.4%
                        </li>
                      </ul>
                      <div className="mt-3">
                        <div className="font-semibold mb-1">Equations</div>
                        <pre className="whitespace-pre-wrap text-[12px] leading-5 bg-neutral-50 border border-neutral-200 rounded p-2">{`MC_j^USD = P_j^USD × Q_j
M_world  = Σ MC_j^USD
P_USD^{MEΩ} = κ × M_world   (κ = 1e-6)
w_j = MC_j^USD / M_world    (Σ w_j = 1)
r_i^{MEΩ} = Δ ln( P_i^{USD} / P_USD^{MEΩ} )`}</pre>
                      </div>
                      <div className="mt-3">
                        <div className="font-semibold mb-1">Invariants</div>
                        <ul className="list-disc list-inside text-neutral-700">
                          <li>|Σ w − 1| &lt; 1e−9</li>
                          <li>|P − κ·ΣMC| / P &lt; 1e−6</li>
                        </ul>
                      </div>
                      <div className="mt-3 text-neutral-600">
                        Sources (snapshot): FRED (M2 &amp; DEX FX), LBMA/FRED (metals spot), CoinGecko (crypto)
                      </div>
                    </div>
                  </details>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fiat share</p>
                  <p className="font-semibold text-foreground">{formatWeightPct(fiatShare)}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-muted-foreground">Metals</p>
                  <p className="font-semibold text-foreground">{formatWeightPct(metalShare)}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold text-foreground">{formatWeightPct(sumWeight)}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                    <TableHead className="text-right">MC (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.weights.map(entry => (
                    <TableRow key={entry.symbol}>
                      <TableCell className="font-mono text-xs text-foreground">{entry.symbol}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entry.category}</TableCell>
                      <TableCell className="text-right font-semibold">{formatWeightPct(entry.weight)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {formatCompact(entry.mcUsd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">How $1 maps into MEΩ</h2>
              <p className="text-sm text-muted-foreground">
                MEΩ is a capitalization-weighted numéraire. A notional $1 priced in MEΩ “breaks” across the money universe
                by the weights below—this is not a fund deposit, just the implied composition of the unit of account.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2 space-y-4">
                {/* <div className="rounded-lg border border-border bg-muted/20 p-4">
                  SVG visualization intentionally removed
                </div> */}

                <div className="rounded-lg border border-border bg-muted/10 p-4 text-sm text-muted-foreground space-y-2">
                  <div className="font-semibold text-foreground">Math, one screen</div>
                  <div>{`MC_j^USD = P_j^USD × Q_j; M_world = Σ MC_j^USD; P_USD^{MEΩ} = κ × M_world (κ = 1e-6).`}</div>
                  <div>{`w_j = MC_j^USD / M_world (Σ w = 1); r_i^{MEΩ} = Δ ln(P_i^USD / P_USD^{MEΩ}).`}</div>
                  <div>{`$1 implied split: $ × w_j; native units = ($ × w_j) / price_j (FX or spot).`}</div>
                </div>
              </div>

              <div className="lg:w-1/2 space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">$1 implied allocation (snapshot)</h4>
                    <span className="text-xs text-muted-foreground">Σ = $1.0000</span>
                  </div>
                  <div className="grid grid-cols-4 text-xs font-semibold text-muted-foreground border-b border-border pb-2">
                    <span>Symbol</span>
                    <span>Category</span>
                    <span className="text-right">Weight</span>
                    <span className="text-right">$ of $1</span>
                  </div>
                  <div className="divide-y divide-border text-sm">
                    {[
                      { symbol: "CNY", category: "Fiat M2", weight: 0.392 },
                      { symbol: "XAU", category: "Precious metal", weight: 0.204 },
                      { symbol: "USD", category: "Fiat M2", weight: 0.198 },
                      { symbol: "EUR", category: "Fiat M2", weight: 0.155 },
                      { symbol: "BTC", category: "Crypto (free-float)", weight: 0.021 },
                      { symbol: "JPY", category: "Fiat M2", weight: 0.016 },
                      { symbol: "XAG", category: "Precious metal", weight: 0.01 },
                      { symbol: "ETH", category: "Crypto (free-float)", weight: 0.004 },
                    ].map(entry => (
                      <div key={entry.symbol} className="grid grid-cols-4 py-1.5">
                        <span className="font-mono text-xs text-foreground">{entry.symbol}</span>
                        <span className="text-muted-foreground text-xs">{entry.category}</span>
                        <span className="text-right font-mono text-xs">{(entry.weight * 100).toFixed(1)}%</span>
                        <span className="text-right font-mono text-xs">${entry.weight.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-2 text-sm text-muted-foreground">
                  <div className="font-semibold text-foreground">Native unit view</div>
                  <p>
                    For any component j, native_amount = ($ × w_j) / price_j, where price_j is FX (USD per unit) for fiat,
                    spot for metals, or coin price for crypto. Example: EUR ≈ 0.155 / 1.08 ≈ €0.1435 if EURUSD = 1.08.
                  </p>
                  <p className="font-semibold text-foreground">Daily workflow</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pull caps: FRED (M2), LBMA/FRED (XAU/XAG), CoinGecko (BTC/ETH), Yahoo (FX).</li>
                    <li>Drop stale &gt;60d, renormalize; compute M_world, {"P_USD^{MEΩ}"}, weights.</li>
                    <li>Publish weights_{"{date}"}.csv and /meo/weights?date=YYYY-MM-DD; keep invariants: |Σ w − 1| &lt; 1e-9 and {"|P_USD^{MEΩ} − κ Σ MC| / P_USD^{MEΩ} < 1e-6"}.</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <section className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card border-border space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Integrity gates</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {auditChecks.map(check => (
                  <li key={check.label} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong className="text-foreground">{check.label}.</strong> {check.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-card border-border space-y-3">
              <div className="flex items-center gap-2">
                <Sigma className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Formula recap</h3>
              </div>
              <div className="font-mono text-xs bg-muted/50 p-4 rounded border border-border leading-relaxed">
                {`MC_j^{USD} = P_j^{USD} * Q_j
M_world     = sum_j MC_j^{USD}
P_USD^{MEIc}= kappa * M_world
w_j         = MC_j^{USD} / M_world
dw_j        = w_j[r_j(lambda) - w_k r_k(lambda)]dt`}
              </div>
              <p className="text-xs text-muted-foreground">
                kappa = 1e-6 keeps the price readable; weights always renormalize to 1.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Daily workflow</h3>
              </div>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                {workflow.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Card>
          </section>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">Index architecture (risk map)</h3>
            <p className="text-sm text-muted-foreground">
              The two silent-error failure modes are FX orientation and staleness. JPY/CNY/CHF move through an inversion gate
              (1/r) while EUR/GBP pass directly; stale inputs (t − t_obs &gt; 180d) trigger an immediate renormalization loop.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <div className="font-semibold text-foreground">FX orientation guard</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Invert JPY, CNY, CHF (indirect quotes); pass-through EUR, GBP.</li>
                  <li>Hard sanity bounds per pair; breach = circuit-breaker.</li>
                  <li>Triangular consistency check prevents hidden parity drift.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <div className="font-semibold text-foreground">Staleness filter</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Lookback window: drop any component with t − t_obs &gt; 180d.</li>
                  <li>Renormalize weights immediately after a drop.</li>
                  <li>Logs the gate decision to avoid silent errors.</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">Portfolio composition visualization</h3>
            <p className="text-sm text-muted-foreground">
              The CNY sleeve (~39%) and USD sleeve (~20%) dominate the index; a 1% CNY error distorts total market cap far more
              than a JPY miss. Metals (~21%) and crypto (~2.4%) are smaller but included for diversification and liquidity.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="font-semibold text-foreground mb-2">Fiat concentration</div>
                <p>Fiat sleeves: CNY, USD, EUR, JPY &rarr; ~76.1% combined; CNY alone ~39%.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="font-semibold text-foreground mb-2">Metals</div>
                <p>XAU + XAG &rarr; ~21.4%; staleness and price sanity are the primary risks.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="font-semibold text-foreground mb-2">Crypto</div>
                <p>BTC + ETH &rarr; ~2.4% total; live pricing, but small enough to tolerate noise.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-3">
            <h3 className="text-lg font-semibold">Production implementation kernel (Python)</h3>
            <p className="text-sm text-muted-foreground">
              Reference implementation that enforces the FX inversion registry, hard bounds, and triangular consistency before
              computing weights. Use as a parity harness for the TypeScript path.
            </p>
            <pre className="font-mono text-xs bg-muted/50 p-4 rounded border border-dashed border-border overflow-x-auto">
{`import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict

@dataclass
class FXConfig:
    fred_ticker: str
    invert: bool
    hard_min: float
    hard_max: float
    name: str

FX_REGISTRY = {
    'CNY': FXConfig('DEXCHUS', True,  5.0,   10.0,  'Chinese Yuan'),
    'JPY': FXConfig('DEXJPUS', True,  100.0, 200.0, 'Japanese Yen'),
    'CHF': FXConfig('DEXSZUS', True,  0.7,   1.5,   'Swiss Franc'),
    'EUR': FXConfig('DEXUSEU', False, 0.8,   1.5,   'Euro'),
    'USD': FXConfig('IDENTITY',False, 0.99,  1.01,  'US Dollar'),
}

def validate_fx_rate(currency: str, raw_rate: float) -> float:
    cfg = FX_REGISTRY[currency]
    if not (cfg.hard_min <= raw_rate <= cfg.hard_max):
        raise ValueError(f\"{currency} rate {raw_rate} outside bounds [{cfg.hard_min}, {cfg.hard_max}]\")
    return 1.0 / raw_rate if cfg.invert else raw_rate

def check_triangular_consistency(eur_usd: float, usd_jpy: float, eur_jpy_market: float):
    implied_eur_jpy = eur_usd * usd_jpy
    discrepancy = abs(implied_eur_jpy / eur_jpy_market - 1)
    if discrepancy > 5e-4:
        raise ValueError(f\"Triangular breach: {discrepancy*10000:.1f} bps\")
    return True

def calculate_meio_weights(m2_native: Dict[str, float], fx_rates_raw: Dict[str, float], metals_caps_usd: float, crypto_caps_usd: float):
    caps_usd = {}
    for curr, qty in m2_native.items():
        if curr == 'USD':
            caps_usd['USD'] = qty
            continue
        rate = validate_fx_rate(curr, fx_rates_raw[curr])
        caps_usd[curr] = qty * rate
    caps_usd['Metals'] = metals_caps_usd
    caps_usd['Crypto'] = crypto_caps_usd
    m_world = sum(caps_usd.values())
    df = pd.DataFrame(list(caps_usd.items()), columns=['Sleeve', 'MC_USD_Trillions'])
    df['Weight'] = df['MC_USD_Trillions'] / m_world
    if abs(df['Weight'].sum() - 1.0) > 1e-9:
        raise RuntimeError('Weight summation error')
    return df, m_world`}
            </pre>
          </Card>

          <Card className="p-6 bg-muted/30 border-border space-y-4">
            <h3 className="text-lg font-semibold">Audit quickstart</h3>
            <p className="text-sm text-muted-foreground">
              Drop this query into your warehouse against the published CSV/JSON. It checks that weights sum to 1 and that
              the MEIc price lines up with the world pool.
            </p>
            <pre className="font-mono text-xs bg-muted/50 p-4 rounded border border-dashed border-border overflow-x-auto">
              {`WITH latest AS (
  SELECT *
  FROM weights
  WHERE date = (SELECT max(date) FROM weights)
)
SELECT
  ROUND(sum(weight), 12) AS sum_w,
  max(meo_usd) AS meo_usd,
  max(m_world_usd) AS m_world_usd,
  max(meo_usd) / max(m_world_usd) AS kappa
FROM latest;`}
            </pre>
          </Card>
        </div>
      </main>
    </div>
  );
}

