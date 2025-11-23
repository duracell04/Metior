'use client';

import { Card } from "@/components/ui/card";

export const TokenMechanics = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Token Mechanics</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            If MEΩ is tokenized, how does it behave?
          </p>
          
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3 text-primary">Supply</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fixed by κ (e.g., 10<sup>6</sup> tokens for κ = 10<sup>-6</sup>). No emissions; price absorbs growth in M<sub>world</sub>.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3 text-primary">Oracle Design</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open feeds (FRED, LBMA, CoinGecko) → on-chain oracle posts M<sub>world</sub>, P<sub>MEΩ</sub>, and weights w<sub>j</sub>.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3 text-primary">Proof-of-Reserve</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For component data: periodic Merkle commitments / zk-SNARK proofs for integrity. 
                (This is a measurement token, not a claim on reserves.)
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-3 text-primary">Governance (minimalist)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Inclusion requires public M2 or free-float mcap ≥ 1% of MEΩ; recompute daily; no human discretion; delist if stale &gt; 60 days.
              </p>
              <div className="font-mono text-xs bg-muted/50 p-3 rounded border border-border space-y-2">
                <div><span className="text-primary">Vol model:</span> regime-switch GARCH on r<sub>i,MEΩ</sub></div>
                <div><span className="text-primary">Tail risk:</span> EVT (POT-GPD) for jumps; VaR/CVaR in MEΩ units</div>
                <div><span className="text-primary">Options:</span> price in MEΩ with Black-Scholes/Heston under MEΩ numéraire</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
