import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck, Sigma, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type WeightRow = {
  symbol: string;
  weight: number;
  mcUsd: string;
  category: string;
};

const snapshotDate = "2024-11-21";

const weightSnapshot: WeightRow[] = [
  { symbol: "CNY", weight: 39.2, mcUsd: "42.5T", category: "Fiat M2" },
  { symbol: "XAU", weight: 20.4, mcUsd: "22.1T", category: "Precious metal" },
  { symbol: "USD", weight: 19.8, mcUsd: "21.5T", category: "Fiat M2" },
  { symbol: "EUR", weight: 15.5, mcUsd: "16.8T", category: "Fiat M2" },
  { symbol: "BTC", weight: 2.1, mcUsd: "2.28T", category: "Crypto (free-float)" },
  { symbol: "JPY", weight: 1.6, mcUsd: "1.73T", category: "Fiat M2" },
  { symbol: "XAG", weight: 1.0, mcUsd: "1.08T", category: "Precious metal" },
  { symbol: "ETH", weight: 0.4, mcUsd: "0.43T", category: "Crypto (free-float)" },
];

const csvContent = [
  ["date", "symbol", "weight", "mc_usd", "category"],
  ...weightSnapshot.map(entry => [
    snapshotDate,
    entry.symbol,
    (entry.weight / 100).toFixed(4),
    entry.mcUsd.replace("T", "e12"),
    entry.category,
  ]),
]
  .map(row => row.join(","))
  .join("\n");

const csvDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

const sumWeight = weightSnapshot.reduce((sum, row) => sum + row.weight, 0);
const fiatShare = weightSnapshot
  .filter(row => row.category.toLowerCase().startsWith("fiat"))
  .reduce((sum, row) => sum + row.weight, 0);
const metalShare = weightSnapshot
  .filter(row => row.category.includes("metal"))
  .reduce((sum, row) => sum + row.weight, 0);

const auditChecks = [
  { label: "Weights sum to 1", detail: "abs(sum(weights)-1) < 1e-9" },
  { label: "No stale feeds", detail: "drop any component >60d old before renormalizing" },
  { label: "Scale invariant", detail: "P_MEIc = kappa * M_world with kappa = 1e-6" },
  { label: "Clipped updates", detail: "dw_j uses clipped r_j(lambda) to stay Lipschitz" },
];

const workflow = [
  "Pull caps from FRED (M2), LBMA (XAU/XAG), CoinGecko (BTC/ETH), FX (USD/EUR/JPY/CHF).",
  "Forward-fill up to 60d; if still stale, zero the weight for that component.",
  "Compute M_world = sum_j MC_j^USD; set P_USD^MEIc = kappa * M_world (kappa=1e-6).",
  "Normalize weights w_j = MC_j / M_world; log (date, symbol, weight, mc_usd, m_world_usd).",
  "Publish weights_{date}.csv + /meo/weights?date=YYYY-MM-DD for reproducibility.",
];

const formatWeight = (weight: number) => `${weight.toFixed(1)}%`;

export default function WeightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href="/equations">
              <Button variant="outline" size="sm">Equations</Button>
            </Link>
            <Link href="/demo">
              <Button size="sm">Run Demo</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">MEIc weights</Badge>
              <Badge variant="secondary" className="font-mono text-xs">As of {snapshotDate}</Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Daily MEIc basket weights</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Inspect the live composition of the MEIc numeraire. Weights always sum to 1, recompute daily,
              and drop stale components automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={csvDataUri} download={`meo_weights_${snapshotDate}.csv`}>
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
                  <p className="font-semibold text-foreground">{formatWeight(fiatShare)}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-muted-foreground">Metals</p>
                  <p className="font-semibold text-foreground">{formatWeight(metalShare)}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold text-foreground">{sumWeight.toFixed(1)}%</p>
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
                  {weightSnapshot.map(entry => (
                    <TableRow key={entry.symbol}>
                      <TableCell className="font-mono text-xs text-foreground">{entry.symbol}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entry.category}</TableCell>
                      <TableCell className="text-right font-semibold">{formatWeight(entry.weight)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">{entry.mcUsd}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <p className="text-xs text-muted-foreground">kappa = 1e-6 keeps the price readable; weights always renormalize to 1.</p>
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
              Drop this query into your warehouse against the published CSV/JSON. It checks that weights sum to 1 and
              that the MEIc price lines up with the world pool.
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
