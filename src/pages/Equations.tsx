import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Equations = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">
          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">See the Equations — Mêtior (MEΩ)</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Define MEΩ from first principles, show how we compute price, weights, returns, and risk in MEΩ units, 
              with exact checks so anyone can audit the math.
            </p>
          </div>

          {/* 1. Notation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">1) Notation</h2>
            <Card className="p-6 bg-card border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-foreground pr-8">Symbol</th>
                    <th className="text-left py-2 font-medium text-foreground">Meaning</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs">j ∈ C(t)</td>
                    <td className="py-3">One monetary species (USD/EUR/JPY/CHF M2, XAU, XAG, BTC, ETH, …)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs">P<sub>j</sub><sup>USD</sup>(t)</td>
                    <td className="py-3">USD price of species j (FX, spot, or coin price)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs">Q<sub>j</sub>(t)</td>
                    <td className="py-3">Quantity/stock: M2 for fiat, above-ground stock (oz/tonnes) for metals, free-float for crypto</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs">MC<sub>j</sub><sup>USD</sup>(t)</td>
                    <td className="py-3">= P<sub>j</sub><sup>USD</sup>(t) · Q<sub>j</sub>(t), USD "market cap" of species j</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs">M<sub>world</sub>(t)</td>
                    <td className="py-3">= Σ<sub>j</sub> MC<sub>j</sub><sup>USD</sup>(t), Aggregated "world money"</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs">κ</td>
                    <td className="py-3">Scale constant (default 10<sup>-6</sup>)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs">P<sub>USD</sub><sup>MEΩ</sup>(t)</td>
                    <td className="py-3">USD price of 1 MEΩ</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-xs">w<sub>j</sub>(t)</td>
                    <td className="py-3">Weight of species j in MEΩ (Σ<sub>j</sub> w<sub>j</sub> = 1)</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </section>

          {/* 2. Construction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">2) Construction of MEΩ (numéraire)</h2>
            
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-3">Market caps</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border">
                  MC<sub>j</sub><sup>USD</sup>(t) = P<sub>j</sub><sup>USD</sup>(t) · Q<sub>j</sub>(t)
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-3">World pool</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border">
                  M<sub>world</sub>(t) = Σ<sub>j∈C(t)</sub> MC<sub>j</sub><sup>USD</sup>(t)
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-3">Scale & price</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border mb-3">
                  P<sub>USD</sub><sup>MEΩ</sup>(t) = κ · M<sub>world</sub>(t)  with  κ = 10<sup>-6</sup>
                </div>
                <p className="text-sm text-muted-foreground">
                  Example: if M<sub>world</sub> = 174 trn USD, then P<sub>USD</sub><sup>MEΩ</sup> ≈ 174 million USD.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-3">Weights</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border mb-3">
                  w<sub>j</sub>(t) = MC<sub>j</sub><sup>USD</sup>(t) / M<sub>world</sub>(t)
                </div>
                <p className="text-sm text-muted-foreground">(always sums to 1)</p>
              </Card>

              <Card className="p-6 bg-muted/30 border-border">
                <h3 className="text-lg font-semibold mb-3 text-primary">Invariants to test (unit checks)</h3>
                <ul className="space-y-2 text-sm font-mono">
                  <li>• Σ<sub>j</sub> w<sub>j</sub>(t) ≈ 1</li>
                  <li>• P<sub>USD</sub><sup>MEΩ</sup>(t) = κ Σ<sub>j</sub> MC<sub>j</sub><sup>USD</sup>(t)</li>
                </ul>
              </Card>
            </div>
          </section>

          {/* 3. Returns */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">3) Returns in MEΩ (currency-neutral)</h2>
            
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">MEΩ-denominated price of any asset i</h3>
              <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border">
                P̃<sub>i</sub>(t) = P<sub>i</sub><sup>USD</sup>(t) / P<sub>USD</sub><sup>MEΩ</sup>(t)
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">Log-return in MEΩ</h3>
              <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border mb-3">
                r<sub>i,MEΩ</sub>(t) = Δ ln P̃<sub>i</sub>(t) = Δ ln(P<sub>i</sub><sup>USD</sup>(t) / P<sub>USD</sub><sup>MEΩ</sup>(t))
              </div>
              <p className="text-sm text-muted-foreground">
                This removes global money drift; you are measuring relative to the whole money universe.
              </p>
            </Card>

            <Card className="p-6 bg-muted/30 border-border">
              <h3 className="text-lg font-semibold mb-3">Discrete computation (daily)</h3>
              <pre className="font-mono text-xs bg-background p-4 rounded border border-border overflow-x-auto">
{`r_i_MEΩ[t] = log(P_i_USD[t]/P_MEΩ_USD[t]) 
            - log(P_i_USD[t-1]/P_MEΩ_USD[t-1])`}
              </pre>
            </Card>
          </section>

          {/* 4. Adaptive weights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">4) Adaptive weights (replicator dynamic)</h2>
            
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">Continuous-time form (for intuition)</h3>
              <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border mb-3">
                dw<sub>j</sub> = w<sub>j</sub>[r<sub>j</sub>(λ) - Σ<sub>k</sub> w<sub>k</sub> r<sub>k</sub>(λ)] dt
                <br />
                <br />
                r<sub>j</sub>(λ) = clip(r<sub>j</sub>, -5σ<sub>j</sub>, +5σ<sub>j</sub>)
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Why clip?</strong> To keep the update Lipschitz under jumps; avoids blow-ups.
              </p>
            </Card>

            <Card className="p-6 bg-muted/30 border-border">
              <h3 className="text-lg font-semibold mb-3">Discrete update (what we actually run)</h3>
              <pre className="font-mono text-xs bg-background p-4 rounded border border-border overflow-x-auto">
{`r_clip[j] = clamp(r[j], -5*σ[j], +5*σ[j])
w[j] ← w[j] + w[j]*(r_clip[j] - Σ_k w[k]*r_clip[k])
normalize(w)   # divide by Σ_j w[j]`}
              </pre>
            </Card>
          </section>

          {/* 5. Risk */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">5) Risk in MEΩ: σ, VaR/CVaR</h2>
            
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">Realised volatility (rolling window W)</h3>
              <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border">
                σ<sub>i</sub>(t) = stdev(r<sub>i,MEΩ</sub>[t-W+1 : t])
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">GARCH(1,1) on r<sub>i,MEΩ</sub> (optional)</h3>
              <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border">
                σ<sub>t</sub><sup>2</sup> = ω + α r<sub>t-1</sub><sup>2</sup> + β σ<sub>t-1</sub><sup>2</sup>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">Tail risk (EVT, POT-GPD) & CVaR</h3>
              <p className="text-sm text-muted-foreground">
                Estimate tail with GPD on excesses above threshold; compute VaR<sub>α</sub> and CVaR<sub>α</sub> in MEΩ units.
              </p>
            </Card>
          </section>

          {/* 6. GINα */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">6) GINα — Global Interest-Rate Neutral Alpha (in MEΩ)</h2>
            
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">Definition</h3>
              <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border mb-4">
                GINα<sub>t</sub> = [(1 + R<sub>t</sub><sup>MEΩ</sup>) / (1 + r<sub>f,t</sub><sup>MEΩ</sup> + π<sub>t</sub><sup>MEΩ</sup>)] - 1 - carry<sub>t</sub>
              </div>
              
              <h4 className="text-sm font-semibold mb-2">Where:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <span className="font-mono">R<sub>t</sub><sup>MEΩ</sup></span>: portfolio return in MEΩ</li>
                <li>• <span className="font-mono">r<sub>f,t</sub><sup>MEΩ</sup></span>: global risk-free in MEΩ (MEΩ-weighted yields + storage/staking)</li>
                <li>• <span className="font-mono">π<sub>t</sub><sup>MEΩ</sup></span>: global inflation proxy in MEΩ</li>
                <li>• <span className="font-mono">carry<sub>t</sub></span>: storage (metals) / staking (crypto) − fees</li>
              </ul>
              
              <p className="text-sm text-primary font-semibold mt-4">
                Purpose: isolate skill, not currency or rate cycles.
              </p>
            </Card>
          </section>

          {/* 7. Pricing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">7) Pricing under the MEΩ numéraire (optional)</h2>
            
            <Card className="p-6 bg-card border-border">
              <p className="text-sm text-muted-foreground mb-4">
                <strong className="text-foreground">Change of numéraire:</strong> With MEΩ as numéraire, 
                discounted asset S̃<sub>t</sub> = S<sub>t</sub>/P<sub>MEΩ</sub> is a martingale under Q<sup>MEΩ</sup>.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">BS PDE (sketch) in MEΩ units</h3>
              <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border">
                ∂V/∂t + ½σ²S̃² ∂²V/∂S̃² = r<sub>f</sub><sup>MEΩ</sup> V
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Implementation usually uses Monte Carlo or local-vol; this is included for completeness.
              </p>
            </Card>
          </section>

          {/* 8. Token mechanics */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">8) Token mechanics (if/when tokenized)</h2>
            
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-3">Supply</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border">
                  Q<sub>MEΩ</sub> = 1/κ  (e.g., 10<sup>6</sup>)
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-3">Oracle</h3>
                <p className="text-sm text-muted-foreground">
                  Posts (M<sub>world</sub>, P<sub>USD</sub><sup>MEΩ</sup>, {'{'}w<sub>j</sub>{'}'}) from open feeds.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-3">Integrity</h3>
                <p className="text-sm text-muted-foreground">
                  Merkle/zk proofs over inputs; MEΩ is a measurement unit, not a claim on reserves.
                </p>
              </Card>
            </div>
          </section>

          {/* 9. Governance */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">9) Governance math (minimally sufficient, deterministic)</h2>
            
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Inclusion rule</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Fiat: public M2</li>
                    <li>• Metals: auditable stock × spot</li>
                    <li>• Crypto: free-float mcap</li>
                    <li>• <strong className="text-foreground">Threshold:</strong> MC<sub>j</sub><sup>USD</sup> / M<sub>world</sub> ≥ 1% (policy band OK)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Cadence</h3>
                  <p className="text-sm text-muted-foreground">Daily recompute; no human overrides.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Delisting</h3>
                  <p className="text-sm text-muted-foreground">
                    Stale data &gt; 60 days or liquidity failure ⇒ set w<sub>j</sub> → 0 and renormalize.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Disclosure</h3>
                  <p className="text-sm text-muted-foreground">
                    Persist (date, symbol, weight, meo_usd, m_world_usd) daily.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* 10. Implementation recipe */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">10) Implementation recipe (discrete-time, vectorised)</h2>
            
            <Card className="p-6 bg-muted/30 border-border">
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>Pull data (FRED M2, LBMA/FRED spot, CoinGecko caps, FX)</li>
                <li>Compute caps: MC = P · Q; sum to M<sub>world</sub></li>
                <li>Price: P<sub>USD</sub><sup>MEΩ</sup> = κ M<sub>world</sub></li>
                <li>Weights: w = MC / Σ MC</li>
                <li>MEΩ returns: r<sub>i,MEΩ</sub> = Δ ln(P<sub>i</sub><sup>USD</sup> / P<sub>MEΩ</sub>)</li>
                <li>Risk: realised σ / GARCH; CVaR via EVT</li>
                <li>Publish: CSV/JSON & audit rows</li>
              </ol>
            </Card>
          </section>

          {/* 11. Verification */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">11) Verification & audit</h2>
            
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">Unit checks (must pass)</h3>
              <pre className="font-mono text-xs bg-muted/50 p-4 rounded border border-border overflow-x-auto">
{`abs(sum(w)-1) < 1e-9
P_meo_usd == kappa * sum(MC_usd) within 1 bp
len(r_MEΩ) == len(P) and finite`}
              </pre>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">Audit SQL (DuckDB/SQLite)</h3>
              <pre className="font-mono text-xs bg-background p-4 rounded border border-border overflow-x-auto">
{`-- Latest disclosed basket
SELECT date, symbol, ROUND(weight*100,2) AS pct, 
       meo_usd, m_world_usd
FROM benchmarks
WHERE date = (SELECT MAX(date) FROM benchmarks)
ORDER BY weight DESC
LIMIT 10;`}
              </pre>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3">Example API payload</h3>
              <pre className="font-mono text-xs bg-muted/50 p-4 rounded border border-border overflow-x-auto">
{`{
  "date": "2025-11-21",
  "meo_usd": 125600000,
  "m_world_usd": 125600000000000,
  "weights": [
    {"symbol": "CNY", "w": 0.392},
    {"symbol": "XAU", "w": 0.204},
    {"symbol": "USD", "w": 0.198},
    {"symbol": "EUR", "w": 0.155},
    {"symbol": "BTC", "w": 0.021}
  ]
}`}
              </pre>
            </Card>
          </section>

          {/* 12. Edge cases */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">12) Edge cases & numerics</h2>
            
            <Card className="p-6 bg-card border-border">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">Data lag:</strong> forward-fill ≤ 60 days; beyond ⇒ drop & renorm
                </li>
                <li>
                  <strong className="text-foreground">Missing FX:</strong> if P<sub>j</sub><sup>USD</sup> is NaN, exclude j for the day
                </li>
                <li>
                  <strong className="text-foreground">Clipping:</strong> r(λ) = clip(r, -5σ, +5σ) ensures stable updates
                </li>
                <li>
                  <strong className="text-foreground">Rounding:</strong> keep floats for math; display with fixed decimals; ledger can use Decimal for sizing
                </li>
              </ul>
            </Card>
          </section>

          {/* 13. Stability lemmas */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">13) Stability lemmas (short sketches)</h2>
            
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-2">Clip is 1-Lipschitz</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border mb-2">
                  |clip(x) - clip(y)| ≤ |x - y|
                </div>
                <p className="text-sm text-muted-foreground">
                  ⇒ preserves Lipschitzness when composed with returns
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-2">Simplex invariance</h3>
                <p className="text-sm text-muted-foreground">
                  Replicator update keeps w<sub>j</sub> ≥ 0 and Σ<sub>j</sub> w<sub>j</sub> = 1 after renorm.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-2">Drift control</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border mb-2">
                  V(w) = Σ<sub>j</sub> log(1/w<sub>j</sub>)
                </div>
                <p className="text-sm text-muted-foreground">
                  Foster–Lyapunov shows negative drift away from boundaries under clipped returns.
                </p>
              </Card>

              <p className="text-sm text-muted-foreground italic">
                (Full proofs in the whitepaper; we keep the page practical.)
              </p>
            </div>
          </section>

          {/* 14. Worked example */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">14) Worked numeric example (sanity)</h2>
            
            <Card className="p-6 bg-muted/30 border-border">
              <h3 className="text-lg font-semibold mb-4">Given (mock):</h3>
              <ul className="space-y-3 text-sm font-mono">
                <li>• M<sub>world</sub> = 108.4 trn USD,  κ = 10<sup>-6</sup></li>
                <li>• Then P<sub>USD</sub><sup>MEΩ</sup> = 108.4 million USD</li>
                <li>• BTC cap = 2.26 trn ⇒ w<sub>BTC</sub> = 2.26/108.4 ≈ 2.1%</li>
                <li>• Asset i price rises 3%, but P<sub>MEΩ</sub> rises 1%</li>
                <li>• ⇒ r<sub>i,MEΩ</sub> ≈ ln(1.03/1.01) ≈ 1.98%</li>
              </ul>
            </Card>
          </section>

          {/* TL;DR */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">TL;DR (for this page)</h2>
            
            <Card className="p-8 bg-gradient-to-br from-card to-muted/30 border-primary/20">
              <ul className="space-y-3 text-sm font-mono">
                <li><strong className="text-primary">Price:</strong> P<sub>USD</sub><sup>MEΩ</sup> = κ Σ<sub>j</sub> MC<sub>j</sub><sup>USD</sup></li>
                <li><strong className="text-primary">Weights:</strong> w<sub>j</sub> = MC<sub>j</sub> / Σ MC</li>
                <li><strong className="text-primary">Returns:</strong> r<sub>i,MEΩ</sub> = Δ ln(P<sub>i</sub> / P<sub>MEΩ</sub>)</li>
                <li><strong className="text-primary">Risk:</strong> σ/CVaR on MEΩ returns</li>
                <li><strong className="text-primary">GINα:</strong> strips global rates & inflation (in MEΩ)</li>
                <li><strong className="text-primary">Governance:</strong> deterministic rules; daily disclosure; no discretion</li>
              </ul>
            </Card>
          </section>

          {/* Back button */}
          <div className="flex justify-center pt-8">
            <Link to="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Equations;
