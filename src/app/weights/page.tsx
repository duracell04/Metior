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
}> {
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
    };
  } catch (error) {
    console.error("weights page falling back to static snapshot", error);
    const fallback: WeightRow[] = [
      { symbol: "CNY", weight: 0.392, mcUsd: 42.5e12, category: "Fiat M2" },
      { symbol: "XAU", weight: 0.204, mcUsd: 22.1e12, category: "Precious metal" },
      { symbol: "USD", weight: 0.198, mcUsd: 21.5e12, category: "Fiat M2" },
      { symbol: "EUR", weight: 0.155, mcUsd: 16.8e12, category: "Fiat M2" },
      { symbol: "BTC", weight: 0.021, mcUsd: 2.28e12, category: "Crypto (free-float)" },
      { symbol: "JPY", weight: 0.016, mcUsd: 1.73e12, category: "Fiat M2" },
      { symbol: "XAG", weight: 0.01, mcUsd: 1.08e12, category: "Precious metal" },
      { symbol: "ETH", weight: 0.004, mcUsd: 0.43e12, category: "Crypto (free-float)" },
    ];
    return {
      date: "2024-11-21",
      meoUsd: 0.000001 * fallback.reduce((sum, r) => sum + r.mcUsd, 0),
      mWorldUsd: fallback.reduce((sum, r) => sum + r.mcUsd, 0),
      weights: fallback,
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
                As of {snapshot.date}
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
                <p className="text-sm text-muted-foreground">Market-cap weighted; normalized to 1.000</p>
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
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <svg viewBox="0 0 320 200" className="w-full h-auto text-foreground">
                    <defs>
                      <linearGradient id="meoFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <g fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="20" y="20" width="80" height="40" rx="6" />
                      <rect x="130" y="20" width="160" height="40" rx="6" />
                      <rect x="20" y="90" width="270" height="90" rx="10" fill="url(#meoFill)" />
                      <line x1="100" y1="40" x2="130" y2="40" markerEnd="url(#arrow)" />
                      <line x1="160" y1="60" x2="60" y2="110" markerEnd="url(#arrow)" />
                      <line x1="200" y1="60" x2="135" y2="120" markerEnd="url(#arrow)" />
                      <line x1="240" y1="60" x2="210" y2="130" markerEnd="url(#arrow)" />
                      <line x1="280" y1="60" x2="270" y2="150" markerEnd="url(#arrow)" />
                    </g>
                    <g fill="currentColor" fontSize="11" fontFamily="Inter, system-ui, sans-serif">
                      <text x="60" y="46" textAnchor="middle">$1</text>
                      <text x="210" y="46" textAnchor="middle">{"1 / P_USD^{MEΩ}"}</text>
                      <text x="55" y="118">CNY 39.2%</text>
                      <text x="140" y="128">XAU 20.4%</text>
                      <text x="215" y="138">USD 19.8%</text>
                      <text x="250" y="158">EUR 15.5%</text>
                      <text x="90" y="168">BTC 2.1%</text>
                    </g>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
                      </marker>
                    </defs>
                  </svg>
                </div>

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
