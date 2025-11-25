import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMeoSnapshot, KAPPA } from "@/lib/meo-data";

const fmt = (n: number) => Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
const fmtPct = (x: number, dp = 1) => `${(x * 100).toFixed(dp)}%`;

export default async function WeightsPage() {
  const snap = await getMeoSnapshot(); // offline static snapshot (2025-10-08)
  const sumW = snap.weights.reduce((acc, c) => acc + c.w, 0);
  const meoFromM = KAPPA * snap.m_world_usd;
  const relErr = Math.abs(meoFromM - snap.meo_usd) / meoFromM;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-10">
        {/* Hero */}
        <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-muted/30 border-primary/15">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-mono">
              Offline snapshot · 2025-10-08
            </Badge>
            <span className="text-xs text-muted-foreground">No network calls; data baked into the repo.</span>
          </div>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">MEO basket weights & audit</h1>
              <p className="text-muted-foreground">
                Frozen reference for the 8 Oct 2025 basket. Caps and weights come from the bundled CSV/JSON; invariants are
                checked at render time. Use this as the readable counterpart to /demo and /equations.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="font-mono">M_world: ${fmt(snap.m_world_usd)}</span>
                <span className="font-mono">P_USD^{"{MEO}"}: ${fmt(snap.meo_usd)}</span>
                <span className="font-mono">Σ w_j: {sumW.toFixed(9)}</span>
                <span className="font-mono">κ: {KAPPA}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/demo">
                  Open Demo <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <a href="/weights_2025-10-08.csv" download="weights_2025-10-08.csv">
                  Download CSV <ArrowDownToLine className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </Card>

        {/* Snapshot metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card border-border shadow-sm">
            <div className="text-sm text-muted-foreground">World pool</div>
            <div className="text-2xl font-semibold">${fmt(snap.m_world_usd)}</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated fiat, metals, and crypto caps in USD.</p>
          </Card>
          <Card className="p-4 bg-card border-border shadow-sm">
            <div className="text-sm text-muted-foreground">MEO price</div>
            <div className="text-2xl font-semibold">${fmt(snap.meo_usd)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Identity <span className="font-mono">P_USD^{"{MEO}"} = κ · M_world</span>.
            </p>
          </Card>
          <Card className="p-4 bg-card border-border shadow-sm">
            <div className="text-sm text-muted-foreground">Integrity checks</div>
            <div className="text-lg font-semibold">Σ w_j = {sumW.toFixed(9)}</div>
            <div className="text-xs text-muted-foreground">
              Price identity error: {(relErr * 100).toExponential(2)} %
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card className="p-6 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Weights and USD market caps</h2>
              <p className="text-sm text-muted-foreground">Derived from the snapshot caps; should reconcile to Σ w_j ≈ 1.</p>
            </div>
            <Badge variant="outline" className="text-xs border-muted-foreground/30">Offline</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-border/60">
                  <th className="py-2 pr-4">Symbol</th>
                  <th className="py-2 pr-4">Weight w_j</th>
                  <th className="py-2 pr-4">MC_j (USD)</th>
                  <th className="py-2 pr-4">Check MC_j / M_world</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {snap.weights.map(c => {
                  const wFromMc = c.mc_usd / snap.m_world_usd;
                  const diff = Math.abs(wFromMc - c.w);
                  return (
                    <tr key={c.symbol}>
                      <td className="py-2 pr-4 font-mono text-foreground">{c.symbol}</td>
                      <td className="py-2 pr-4 tabular-nums">{fmtPct(c.w)}</td>
                      <td className="py-2 pr-4 tabular-nums">${fmt(c.mc_usd)}</td>
                      <td className="py-2 pr-4 tabular-nums">
                        {fmtPct(wFromMc)} <span className="text-muted-foreground">δ={diff.toExponential(2)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            δ shows |w_derived − w_reported|. In this offline build we derive weights from caps, so δ → 0 barring rounding.
          </p>
        </Card>

        {/* Methodology + integrity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-muted/30 border-border space-y-3">
            <h3 className="text-lg font-semibold">Methodology (concise)</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                Caps: <span className="font-mono">{"MC_j^{USD} = P_j^{USD} · Q_j"}</span>. Fiat uses M2 and FX; metals use above-ground
                stock and LBMA spot; crypto uses circulating supply and coin USD price.
              </li>
              <li>
                World pool: <span className="font-mono">{"M_world = Σ_j MC_j^{USD}"}</span>. Price: <span className="font-mono">{"P_USD^{MEO} = κ · M_world"}</span>, κ = 10^-6.
              </li>
              <li>
                Weights: <span className="font-mono">{"w_j = MC_j^{USD} / M_world"}</span>, with Σ w_j = 1. Invariants are asserted at runtime.
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border space-y-3">
            <h3 className="text-lg font-semibold">Integrity checks</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/40 rounded-lg p-3 border border-dashed border-border">
                <div className="font-mono text-foreground">|Σ w_j − 1| &lt; 1e-9</div>
                <p className="text-xs text-muted-foreground mt-1">Enforced after computing weights from caps.</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 border border-dashed border-border">
                <div className="font-mono text-foreground">{"|P_USD^{MEO} − κ Σ MC^{USD}| / P_USD^{MEO} < 1e-6"}</div>
                <p className="text-xs text-muted-foreground mt-1">Price identity; highlighted above as relErr.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Provenance (live mode): FRED (M2 + FX), LBMA (XAU/XAG), USGS (stocks), CoinGecko (crypto). Offline demo uses the
              checked-in snapshot only.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
