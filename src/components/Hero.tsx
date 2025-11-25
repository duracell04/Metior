'use client';

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const purchasingPowerData = [
  { year: 1970, meo: 100, usd: 100, eur: 100, chf: 100 },
  { year: 1980, meo: 98, usd: 61, eur: 74, chf: 85 },
  { year: 1990, meo: 101, usd: 45, eur: 62, chf: 78 },
  { year: 2000, meo: 103, usd: 36, eur: 52, chf: 69 },
  { year: 2010, meo: 101, usd: 26, eur: 44, chf: 58 },
  { year: 2020, meo: 104, usd: 19, eur: 35, chf: 52 },
  { year: 2024, meo: 105, usd: 17, eur: 32, chf: 49 },
];

const chartConfig = {
  meo: { label: "MEΩ", color: "hsl(var(--primary))" },
  usd: { label: "USD", color: "hsl(var(--graph))" },
  eur: { label: "EUR (DEM proxy pre-1999)", color: "hsl(var(--platinum))" },
  chf: { label: "CHF", color: "hsl(var(--muted-foreground))" },
};

export const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-mono text-xs">
              Open rules / offline snapshot
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The universal numéraire for <span className="text-gradient-auric">money itself.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              A capitalization-weighted yard-stick of fiat M2, metals, and free-float crypto—open math, daily weights,
              no currency fog. Price everything in MEΩ to see economic truth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#spec">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full sm:w-auto">
                  Read the spec
                </Button>
              </Link>
              <Link href="#quickstart">
                <Button size="lg" variant="outline" className="border-border hover:bg-muted w-full sm:w-auto">
                  Compute MEΩ locally
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">MEΩ vs major currencies (1970-2024)</h3>
                <TrendingUp className="h-4 w-4 text-graph" />
              </div>
              <ChartContainer config={chartConfig} className="bg-muted/20 rounded border border-border/50">
                <LineChart
                  data={purchasingPowerData}
                  margin={{
                    left: 12,
                    right: 18,
                    top: 12,
                    bottom: 8,
                  }}
                >
                  <defs>
                    <linearGradient id="meoGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    ticks={[1970, 1980, 1990, 2000, 2010, 2020, 2024]}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 110]} />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => `Year ${value}`}
                        formatter={(value, name) => [
                          `${(value as number).toFixed(0)}`,
                          chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                        ]}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="meo"
                    stroke="var(--color-meo)"
                    strokeWidth={3}
                    dot={false}
                    strokeLinecap="round"
                    fill="url(#meoGradient)"
                  />
                  <Line type="monotone" dataKey="usd" stroke="var(--color-usd)" strokeWidth={2} dot={false} strokeDasharray="6 4" />
                  <Line type="monotone" dataKey="eur" stroke="var(--color-eur)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="chf" stroke="var(--color-chf)" strokeWidth={2} dot={false} strokeDasharray="2 4" />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Illustrative purchasing-power index (1970 = 100). MEΩ stays stable; fiat series erode (EUR uses DEM proxy pre-1999).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
