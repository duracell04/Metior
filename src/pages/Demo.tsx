import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Play, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Demo = () => {
  const [costCap, setCostCap] = useState([35]);
  const [rebalancePeriod, setRebalancePeriod] = useState([7]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-mono">
              MEΩ Backtest Simulator
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">10-Year Backtest Demo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simulate portfolio performance with MEΩ numéraire. Adjust parameters to see how cost caps 
              and rebalancing frequency affect GINα returns.
            </p>
          </div>

          {/* Controls */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold mb-6">Simulation Parameters</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Cost Cap (basis points)
                    <span className="font-mono text-primary ml-2">{costCap[0]} bp</span>
                  </label>
                  <Slider
                    value={costCap}
                    onValueChange={setCostCap}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum allowed trading cost (fee + √impact)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Rebalance Period (days)
                    <span className="font-mono text-primary ml-2">{rebalancePeriod[0]}d</span>
                  </label>
                  <Slider
                    value={rebalancePeriod}
                    onValueChange={setRebalancePeriod}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    How often to recompute and reweight the basket
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Current Settings</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Period:</span>
                      <span className="text-foreground">2014-11-21 to 2024-11-21</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Policy:</span>
                      <span className="text-foreground">Weekly reweighting</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk gate:</span>
                      <span className="text-foreground">Median-σ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost cap:</span>
                      <span className="text-primary">{costCap[0]} bp</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2" size="lg">
                  <Play className="h-4 w-4" />
                  Run Simulation
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Preview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">GINα (annualized)</span>
                  <span className="text-xl font-bold text-graph font-mono">+142 bp</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Return (MEΩ)</span>
                  <span className="text-xl font-bold font-mono">+8.3%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                  <span className="text-xl font-bold font-mono">1.42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Drawdown</span>
                  <span className="text-xl font-bold text-signal font-mono">-12.4%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Trade Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Rebalances</span>
                  <span className="text-xl font-bold font-mono">523</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Skipped (cost gate)</span>
                  <span className="text-xl font-bold font-mono">47</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Avg Cost per Trade</span>
                  <span className="text-xl font-bold font-mono">18 bp</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Cost Impact</span>
                  <span className="text-xl font-bold font-mono">-94 bp</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cumulative Returns</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs">
                  MEΩ
                </Badge>
                <Badge variant="outline" className="border-platinum/20 bg-platinum/5 text-platinum text-xs">
                  USD
                </Badge>
              </div>
            </div>
            
            <div className="aspect-[16/9] bg-muted/30 rounded border border-border/50 flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Interactive chart will display here</p>
                <p className="text-xs text-muted-foreground font-mono">
                  Showing portfolio growth in MEΩ vs USD denomination
                </p>
              </div>
            </div>
          </Card>

          {/* Download & Export */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Full Report
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Trade Log CSV
            </Button>
          </div>

          {/* Methodology Note */}
          <Card className="p-6 bg-muted/30 border-border">
            <h3 className="text-sm font-semibold mb-3 text-primary">Methodology Note</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This backtest uses historical data from FRED, LBMA, and CoinGecko. Returns are calculated in MEΩ units 
              using r<sub>i,MEΩ</sub> = Δ ln(P<sub>i</sub><sup>USD</sup> / P<sub>USD</sub><sup>MEΩ</sup>). 
              The replicator dynamic reweights components based on clipped returns: dw<sub>j</sub> = w<sub>j</sub>[r<sub>j</sub>(λ) - Σ w<sub>k</sub>r<sub>k</sub>(λ)]dt. 
              Cost gate skips trades when projected fee + √impact exceeds the specified cap. 
              GINα removes global funding costs and MEΩ-denominated inflation to isolate skill.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Demo;
