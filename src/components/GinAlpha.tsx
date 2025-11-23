'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const GinAlpha = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-graph/20 bg-graph/5 text-graph font-mono">
              Performance Metric
            </Badge>
            <h2 className="text-3xl font-bold mb-4">GINα: Global Interest-Rate Neutral Alpha</h2>
          </div>
          
          <Card className="p-8 bg-card border-border">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Definition</h3>
                <div className="font-mono text-sm bg-muted/50 p-4 rounded border border-border overflow-x-auto">
                  GINα<sub>t</sub> = [(1 + R<sub>t</sub><sup>MEΩ</sup>) / (1 + r<sub>f,t</sub><sup>MEΩ</sup> + π<sub>t</sub><sup>MEΩ</sup>)] - 1 - carry<sub>t</sub>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Interpretation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Removes global funding costs and inflation in MEΩ units to isolate skill. 
                  This metric shows true alpha by accounting for the cost of capital and inflation in a currency-neutral way.
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Current Performance (YTD):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-graph font-mono">+142 bp</span>
                    <Badge variant="outline" className="border-graph/20 bg-graph/5 text-graph text-xs">
                      with 35 bp cost cap
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
