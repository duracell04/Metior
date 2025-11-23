'use client';

import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-mono text-xs">
              Powered by Mêtior (MEΩ)
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Open math.{" "}
              <span className="text-gradient-auric">Deterministic capital.</span>{" "}
              Allocate in MEΩ.
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Mêtior (MEΩ) is a universal numéraire: a capitalization-weighted basket of fiat M2, gold/silver, and crypto. 
              It makes performance currency-neutral and inflation-aware.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/demo">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full sm:w-auto">
                  Run 10-year demo
                </Button>
              </Link>
              <Link href="/equations">
                <Button size="lg" variant="outline" className="border-border hover:bg-muted w-full sm:w-auto">
                  See the equations
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">MEΩ vs Major Currencies (1970-2024)</h3>
                <TrendingUp className="h-4 w-4 text-graph" />
              </div>
              <div className="aspect-video bg-muted/30 rounded border border-border/50 flex items-center justify-center">
                <div className="space-y-2 w-full px-8">
                  {/* MEΩ line */}
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
                    <span className="text-xs font-mono text-primary">MEΩ</span>
                  </div>
                  {/* USD line */}
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-platinum to-transparent opacity-50" />
                    <span className="text-xs font-mono text-platinum">USD</span>
                  </div>
                  {/* EUR line */}
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-platinum to-transparent opacity-50" />
                    <span className="text-xs font-mono text-platinum">EUR</span>
                  </div>
                  {/* CHF line */}
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-platinum to-transparent opacity-50" />
                    <span className="text-xs font-mono text-platinum">CHF</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Chart illustrates MEΩ stability vs fiat purchasing power erosion
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
