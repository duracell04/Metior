'use client';

import { Card } from "@/components/ui/card";

export const Manifesto = () => {
  return (
    <section id="spec" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <p className="text-sm font-mono tracking-wide text-primary">Mêtior (MEΩ) — The Universal Numéraire</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              A clean, open-math benchmark for money itself.
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Denominate prices, P&L, and risk in MEΩ to strip out single-currency bias and inflation fog.
              Open data. Deterministic rules. Fully auditable.
            </p>
          </div>

          <Card className="p-6 space-y-4 bg-card border-border">
            <h3 className="text-lg font-semibold">0) Elevator pitch</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MEΩ is a capitalization-weighted numéraire that aggregates fiat M2, gold/silver, and leading crypto
              (BTC/ETH) into one living yard-stick. Price anything in MEΩ to see economic truth without fiat money FX drift.
            </p>
            <blockquote className="border-l-2 border-primary pl-4 text-sm text-foreground">
              Why care? Reporting in USD/CHF/EUR bakes FX and inflation into your “alpha.” MEΩ strips that out.
            </blockquote>
          </Card>

          <Card className="p-6 bg-card border-border space-y-6">
            <h3 className="text-lg font-semibold">1) What MEΩ is (and isn’t)</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">MEΩ is:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>A numéraire (unit of account), not a fund or index product.</li>
                  <li>A basket-of-money built from public data, reweighted automatically.</li>
                  <li>A reference unit to price anything without fiat money FX drift.</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">MEΩ is not:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>A stablecoin; price floats with the world money pool.</li>
                  <li>A custodied pool of assets; it is a measurement standard.</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">2) Core math (short & exact)</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Let C(t) be the set of monetary species: fiat (M2), metals (XAU/XAG stocks), crypto (BTC/ETH free-float).</p>
              <div className="font-mono text-xs bg-muted/50 p-4 rounded border border-border overflow-x-auto leading-relaxed">
{`MC_j^USD(t) = P_j^USD(t) * Q_j(t)
M_world(t)   = Σ_j MC_j^USD(t)
κ            = 10^{-6}
P_USD^{MEΩ}(t) = κ * M_world(t)
w_j(t)       = MC_j^USD(t) / M_world(t)
r_{i,MEΩ}(t) = Δln( P_i^USD(t) / P_USD^{MEΩ}(t) )`}
              </div>
              <p className="text-xs text-muted-foreground">
                Interpretation: one MEΩ is the millionth of the world money aggregate. If M_world = 174T USD, then
                P_USD<sup>MEΩ</sup> ≈ 174M USD.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">3) Why this adds value (for finance)</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Currency-neutral truth.</strong> MEΩ reports pure economic returns.</li>
              <li><strong className="text-foreground">Crisis-adaptive yard-stick.</strong> Reweights automatically; dead components decay to 0.</li>
              <li><strong className="text-foreground">Cross-border comparability.</strong> One open rule-set for global portfolios.</li>
              <li><strong className="text-foreground">Auditability.</strong> Daily disclosure of (date, symbol, weight, meo_usd, m_world_usd).</li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border space-y-6">
            <h3 className="text-lg font-semibold">4) Vision & scope (v0)</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">In-scope (launch)</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Components: USD/EUR/JPY/CHF M2, XAU/XAG, BTC/ETH.</li>
                  <li>Data: FRED, LBMA, CoinGecko, Yahoo FX.</li>
                  <li>Storage: (date, symbol, weight, meo_usd, m_world_usd).</li>
                  <li>Risk in MEΩ: realised/GARCH σ, CVaR; optional 2-state MS-GARCH.</li>
                  <li>Headline: GINα (MEΩ Global Interest-Rate Neutral Alpha).</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Out-of-scope (v0)</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Custody, leverage, intraday, paid data, auth.</li>
                  <li>Derivatives later (ETN/futures).</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">5) Data → Model → Publish</h3>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
              <li>Ingest: open feeds; forward-fill ≤ 60d; drop if stale.</li>
              <li>Compute: caps, weights, P<sup>MEΩ</sup>, returns in MEΩ; risk metrics.</li>
              <li>Publish: weights.csv, meo_price.csv, summary.json; API: /meo/latest, /meo/weights?date=…, /meo/returns?symbol=…; docs + audit SQL.</li>
            </ol>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">6) Governance (minimal, explicit)</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Inclusion: public M2 or free-float mcap; ≥ 1% of MEΩ (policy band allowed).</li>
              <li>Cadence: daily recompute; no human overrides.</li>
              <li>Delisting: stale &gt; 60d or liquidity collapse ⇒ weight → 0; renormalize.</li>
              <li>Change control: any rule change ⇒ version bump + migration note; forks welcome.</li>
            </ul>
          </Card>

          <Card id="quickstart" className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">7) Quickstart (compute MEΩ locally)</h3>
            <div className="font-mono text-xs bg-muted/50 p-4 rounded border border-border overflow-x-auto leading-relaxed">
{`pip install pandas requests yfinance fredapi duckdb

# Example sketch
import pandas as pd

df_caps = pd.DataFrame({
  "symbol":["USD","EUR","JPY","CHF","XAU","XAG","BTC","ETH"],
  "mc_usd":[21.5e12,16.8e12,8.6e12,1.25e12,22.1e12,2.6e12,2.26e12,0.30e12]
})

kappa = 1e-6
M_world = df_caps["mc_usd"].sum()
P_meo_usd = kappa * M_world
df_caps["weight"] = df_caps["mc_usd"]/M_world
assert abs(df_caps["weight"].sum()-1) < 1e-9`}
            </div>
            <div className="font-mono text-xs bg-muted/40 p-3 rounded border border-dashed border-border">
              Audit SQL:
{`\nSELECT date, symbol, ROUND(weight*100,2) AS pct, meo_usd, m_world_usd
FROM benchmarks
WHERE date = (SELECT MAX(date) FROM benchmarks)
ORDER BY weight DESC
LIMIT 10;`}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">8) Risk & performance in MEΩ</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Volatility: realised σ on r<sub>i,MEΩ</sub>; optional GARCH(1,1).</li>
              <li>Tail risk: EVT (POT–GPD) for VaR/CVaR in MEΩ units.</li>
              <li>GINα: removes global funding & inflation in MEΩ units to isolate skill.</li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">9) Design choices (FAQ-lite)</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>SDR is fiat-only; CPI is a consumption basket. MEΩ is money-native and adaptive.</li>
              <li>κ = 10<sup>-6</sup> gives a human-readable price (≈ $100M/MEΩ today) and fixed token supply if ever tokenized.</li>
              <li>MEΩ is a yard-stick, not a stablecoin; price floats with the world money pool.</li>
              <li>Hedge via components; phase 2: ETN/futures for direct hedging.</li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">10) Validation & acceptance</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Stability KPIs: MEΩ vs USD/EUR/CHF volatility; drawdowns (2008/2020/2022); weight entropy.</li>
              <li>Trust gates: Σw ≈ 1; P<sup>MEΩ</sup> = κ ΣMC within 1 bp; no NaNs; bit-for-bit rebuild.</li>
              <li>Adoption KPIs: API calls/day; CSV downloads; references to MEΩ / GINα.</li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">11) Licensing & disclaimer</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Spec & brand assets: MIT.</li>
              <li>Disclaimer: prototype math; educational reference; no investment advice.</li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">12) Appendix — full equation panel</h3>
            <div className="font-mono text-xs bg-muted/50 p-4 rounded border border-border overflow-x-auto leading-relaxed">
{`MC_j^{USD} = P_j^{USD} * Q_j
M_world = Σ_j MC_j^{USD}
w_j = MC_j^{USD} / M_world
P_{USD}^{MEΩ} = κ * M_world
r_{i,MEΩ} = Δln( P_i^{USD} / P_{USD}^{MEΩ} )
r^{(λ)} = clip(r, -5σ, +5σ)`}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <p className="text-center text-sm font-semibold">
              MEΩ = the universal yard-stick for value. Open rules, public data, daily weights. Price everything in MEΩ and see the real performance.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
