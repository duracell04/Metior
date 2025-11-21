import { Card } from "@/components/ui/card";

export const MathSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">What MEΩ is: The Math</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Math blocks */}
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-sm font-semibold text-primary mb-3">Price Definition (Numéraire)</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border overflow-x-auto">
                  P<sub>USD</sub><sup>MEΩ</sup>(t) = κ Σ<sub>j∈C</sub> MC<sub>j</sub><sup>USD</sup>(t), κ = 10<sup>-6</sup>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  One MEΩ is the millionth of the world money aggregate M<sub>world</sub>. 
                  If M<sub>world</sub> = 174T USD, then P<sub>USD</sub><sup>MEΩ</sup> ≈ 174M USD.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-sm font-semibold text-primary mb-3">Weights (always sum to 1)</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border overflow-x-auto">
                  w<sub>j</sub>(t) = MC<sub>j</sub><sup>USD</sup>(t) / Σ<sub>k</sub> MC<sub>k</sub><sup>USD</sup>(t)
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-sm font-semibold text-primary mb-3">Returns in MEΩ (currency-neutral)</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border overflow-x-auto">
                  r<sub>i,MEΩ</sub>(t) = Δ ln(P<sub>i</sub><sup>USD</sup>(t) / P<sub>USD</sub><sup>MEΩ</sup>(t))
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-sm font-semibold text-primary mb-3">Adaptive Reweighting</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border overflow-x-auto">
                  dw<sub>j</sub> = w<sub>j</sub>[r<sub>j</sub>(λ) - Σ<sub>k</sub> w<sub>k</sub>r<sub>k</sub>(λ)]dt
                  <br />
                  r<sub>j</sub>(λ) = clip(r<sub>j</sub>, -5σ<sub>j</sub>, 5σ<sub>j</sub>)
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Clipping keeps the system stable during jumps
                </p>
              </Card>
            </div>

            {/* Right: Explainer bullets + table */}
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-sm font-semibold mb-4 text-foreground">Key Properties</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary shrink-0">•</span>
                    <span><strong className="text-foreground">Basket today:</strong> fiat (M2), XAU/XAG, BTC/ETH</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary shrink-0">•</span>
                    <span>
                      <strong className="text-foreground">Scaling:</strong> κ = 10<sup>-6</sup> ⇒ fixed supply Q<sub>MEΩ</sub> = 10<sup>6</sup> if tokenized; 
                      price floats with the world money aggregate
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary shrink-0">•</span>
                    <span>
                      <strong className="text-foreground">Stability:</strong> If a component dies, its weight → 0; MEΩ renormalizes
                    </span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-sm font-semibold mb-4 text-foreground">Current Top Components</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">Symbol</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-foreground">CNY</td>
                        <td className="text-right text-muted-foreground">39.2%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-foreground">XAU</td>
                        <td className="text-right text-muted-foreground">20.4%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-foreground">USD</td>
                        <td className="text-right text-muted-foreground">19.8%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-foreground">EUR</td>
                        <td className="text-right text-muted-foreground">15.5%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-foreground">BTC</td>
                        <td className="text-right text-muted-foreground">2.1%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-foreground">JPY</td>
                        <td className="text-right text-muted-foreground">1.6%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-foreground">XAG</td>
                        <td className="text-right text-muted-foreground">1.0%</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-foreground">ETH</td>
                        <td className="text-right text-muted-foreground">0.4%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Data as of: 2024-11-20</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
