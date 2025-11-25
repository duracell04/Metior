import Link from "next/link";
import { Download, ShieldCheck, Sigma, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMeoSnapshot } from "@/lib/meo-data";

type WeightRow = { symbol: string; w: number; mcUsd: number; category: string };

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
  { label: "Scale invariant", detail: "P_MEIc = kappa * M_world with kappa = 1e-6" },
  { label: "No stale feeds (live mode)", detail: "drop any component >60d old before renormalizing" },
  { label: "Clipped updates", detail: "dw_j uses clipped r_j(lambda) to stay Lipschitz" },
];

const workflow = [
  "Offline demo: MEO_OFFLINE / MEO_FREEZE_DATE are set, so no network is used.",
  "Snapshot is frozen at 2025-10-08 from the bundled JSON/CSV in the repo.",
  "Compute M_world = sum_j MC_j^USD; P_USD^{MEIc} = kappa * M_world (kappa = 1e-6).",
  "Normalize weights w_j = MC_j / M_world; publish weights_2025-10-08.(json|csv).",
  "When live mode returns, the same math runs against FRED/LBMA/CoinGecko feeds.",
];

async function loadSnapshot(): Promise<{
  date: string;
  weights: WeightRow[];
  mWorldUsd: number;
  meoUsd: number;
}> {
  const snapshot = await getMeoSnapshot();
  return {
    date: snapshot.date,
    meoUsd: snapshot.meo_usd,
    mWorldUsd: snapshot.m_world_usd,
    weights: snapshot.weights.map(entry => ({
      symbol: entry.symbol,
      w: entry.w,
      mcUsd: entry.mc_usd,
      category: categoryFor(entry.symbol),
    })),
  };
}

export default async function WeightsPage() {
  const snapshot = await loadSnapshot();
  const sumWeight = snapshot.weights.reduce((sum, row) => sum + row.w, 0);
  const fiatShare = snapshot.weights
    .filter(row => row.category.toLowerCase().startsWith("fiat"))
    .reduce((sum, row) => sum + row.w, 0);
  const metalShare = snapshot.weights
    .filter(row => row.category.includes("metal"))
    .reduce((sum, row) => sum + row.w, 0);
  const cryptoShare = snapshot.weights
    .filter(row => row.category.startsWith("Crypto"))
    .reduce((sum, row) => sum + row.w, 0);
  const oneDollarRows = snapshot.weights.map(entry => ({
    symbol: entry.symbol,
    category: entry.category,
    weight: entry.w,
  }));

  const csvHref = "/weights_2025-10-08.csv";
  const asOfLabel = `${snapshot.date} - Offline Demo`;

  return (
    <div className="min-h-screen bg-background">
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
              <Badge variant="destructive" className="font-mono text-xs">
                Offline demo (no network)
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Daily MEIc basket weights</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Frozen snapshot from 2025-10-08. Everything shown below is read from the bundled JSON/CSV, so Next.js cannot hit
              the network or mutate live data while in demo mode.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={csvHref} download="weights_2025-10-08.csv">
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Offline snapshot, market-cap weighted, normalized to 1.000.
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded border border-border bg-muted/30">
                  <p className="text-muted-foreground">MEIc price (USD)</p>
                  <p className="font-semibold text-foreground">
                    {Intl.NumberFormat().format(snapshot.meoUsd)}
                  </p>
                </div>
                <div className="p-3 rounded border border-border bg-muted/30">
                  <p className="text-muted-foreground">World money M_world</p>
                  <p className="font-semibold text-foreground">
                    {Intl.NumberFormat().format(snapshot.mWorldUsd)}
                  </p>
                </div>
                <div className="p-3 rounded border border-border bg-muted/30">
                  <p className="text-muted-foreground">Sum of weights</p>
                  <p className="font-semibold text-foreground">{sumWeight.toFixed(6)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                Snapshot date {snapshot.date} (offline). kappa = 1e-6, so P_USD^MEIc = kappa * M_world. Sources for this bundle:
                FRED (M2 + DEX FX), LBMA/FRED (metals), CoinGecko (BTC/ETH).
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
                      <TableCell className="text-right font-semibold">{formatWeightPct(entry.w)}</TableCell>
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
              <h2 className="text-2xl font-semibold">How $1 maps into MEIc</h2>
              <p className="text-sm text-muted-foreground">
                A notional $1 priced in MEIc splits across the 2025-10-08 basket by the weights below. This is implied composition, not a
                fund deposit.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2 space-y-4">
                <div className="rounded-lg border border-border bg-muted/10 p-4 text-sm text-muted-foreground space-y-2">
                  <div className="font-semibold text-foreground">Math, one screen</div>
                  <div>{`MC_j^USD = P_j^USD * Q_j; M_world = sum_j MC_j^USD; P_USD^{MEIc} = kappa * M_world (kappa = 1e-6).`}</div>
                  <div>{`w_j = MC_j^USD / M_world (sum w = 1); r_i^{MEIc} = ln(P_i^USD / P_USD^{MEIc}).`}</div>
                  <div>{`$1 implied split: $ * w_j; native units = ($ * w_j) / price_j (FX or spot).`}</div>
                </div>
              </div>

              <div className="lg:w-1/2 space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">$1 implied allocation (snapshot)</h4>
                    <span className="text-xs text-muted-foreground">1.0000 MEIc</span>
                  </div>
                  <div className="grid grid-cols-4 text-xs font-semibold text-muted-foreground border-b border-border pb-2">
                    <span>Symbol</span>
                    <span>Category</span>
                    <span className="text-right">Weight</span>
                    <span className="text-right">$ of $1</span>
                  </div>
                  <div className="divide-y divide-border text-sm">
                    {oneDollarRows.map(entry => (
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
                    For any component j, native_amount = ($ * w_j) / price_j, where price_j is FX (USD per unit) for fiat, spot for metals,
                    or coin price for crypto. Example: EUR: $ * 0.155 / 1.08 ~= EUR 0.1435 if EURUSD = 1.08.
                  </p>
                  <p className="font-semibold text-foreground">Daily workflow (live mode)</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pull caps: FRED (M2), LBMA/FRED (XAU/XAG), CoinGecko (BTC/ETH), Yahoo FX.</li>
                    <li>Drop stale &gt;60d, renormalize; compute M_world, P_USD^{MEIc}, weights.</li>
                    <li>Publish weights_{snapshot.date}.csv and /meo/weights?date=YYYY-MM-DD.</li>
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
                    <span className="text-primary">-</span>
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
        </div>
      </main>
    </div>
  );
}
