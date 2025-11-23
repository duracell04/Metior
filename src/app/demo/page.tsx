"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Play, RotateCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

type ChartPoint = {
  label: string;
  meic: number;
  usd: number;
};

type TradeEntry = {
  date: string;
  instrument: string;
  change: number;
  cost: number;
  skipped: boolean;
  note: string;
};

type SimulationResult = {
  metrics: {
    giniBp: number;
    totalReturnPct: number;
    sharpe: number;
    maxDrawdownPct: number;
  };
  trades: {
    total: number;
    skipped: number;
    avgCost: number;
    totalImpact: number;
    log: TradeEntry[];
  };
  chart: ChartPoint[];
  horizon: string;
};

const START_DATE = new Date("2014-11-21");
const END_DATE = new Date("2024-11-21");

const formatMonthLabel = (date: Date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;

const buildChart = (costCap: number, rebalance: number) => {
  const months = 120;
  const data: ChartPoint[] = [];
  const monthlyReturns: number[] = [];
  let meic = 1;
  let usd = 1;
  let peak = 1;
  let maxDrawdown = 0;

  for (let i = 0; i <= months; i += 1) {
    const labelDate = new Date(START_DATE);
    labelDate.setMonth(START_DATE.getMonth() + i);

    const baseDrift = 0.0007 + (7 - rebalance) * 0.00005 - (costCap - 35) * 0.000015;
    const cycle = Math.sin(i * 0.34 + costCap * 0.04) * 0.0016;
    const micro = Math.cos(i * 0.18 + rebalance * 0.45) * 0.001;
    const monthlyReturn = Math.min(0.025, Math.max(-0.02, baseDrift + cycle + micro));

    monthlyReturns.push(monthlyReturn);
    meic *= 1 + monthlyReturn;
    const usdDrag = 0.00025 + costCap * 0.000002;
    usd *= 1 + monthlyReturn - usdDrag;
    peak = Math.max(peak, meic);
    maxDrawdown = Math.min(maxDrawdown, (meic - peak) / peak);

    data.push({
      label: formatMonthLabel(labelDate),
      meic: Number(meic.toFixed(4)),
      usd: Number(usd.toFixed(4)),
    });
  }

  const avgMonthly = monthlyReturns.reduce((sum, r) => sum + r, 0) / monthlyReturns.length;
  const variance =
    monthlyReturns.reduce((sum, r) => sum + Math.pow(r - avgMonthly, 2), 0) / Math.max(1, monthlyReturns.length);
  const stdMonthly = Math.sqrt(variance);

  return {
    data,
    totals: {
      meic,
      usd,
    },
    avgMonthly,
    stdMonthly,
    maxDrawdown: Number((maxDrawdown * 100).toFixed(1)),
  };
};

const simulateBacktest = (costCap: number, rebalance: number): SimulationResult => {
  const chart = buildChart(costCap, rebalance);
  const policyModifier = (7 - rebalance) * 2.4;
  const costModifier = -(costCap - 35) * 1.2;

  const giniBp = Math.max(
    40,
    Math.round(142 + chart.avgMonthly * 9000 - chart.stdMonthly * 5000 + policyModifier + costModifier)
  );
  const sharpe = Number(
    Math.max(0.4, Math.min(3, (chart.avgMonthly / Math.max(0.0001, chart.stdMonthly)) * Math.sqrt(12))).toFixed(2)
  );

  const totalReturnPct = Number(((chart.totals.meic - 1) * 100).toFixed(1));

  const totalRebalances = Math.max(1, Math.round(3650 / rebalance));
  const skipped = Math.max(0, Math.round(totalRebalances * (0.04 + Math.max(0, 50 - costCap) / 3800)));
  const avgCost = Number(Math.min(costCap, costCap * 0.45 + rebalance * 0.4).toFixed(1));
  const totalImpact = -Math.round(avgCost * (totalRebalances - skipped) * 0.011);

  const tradeLog: TradeEntry[] = Array.from({ length: 10 }, (_, index) => {
    const point = chart.data[Math.min(chart.data.length - 1, (index + 1) * 10)];
    const change = Number((Math.sin(index * 0.9 + rebalance) * 3.5 + 8 - costCap / 12).toFixed(2));
    const cost = Number(Math.min(costCap, avgCost + Math.sin(index + costCap / 15) * 2).toFixed(1));
    const gateHit = cost > costCap - 1.5 && index % 3 === 0;

    return {
      date: point?.label ?? "2015-01",
      instrument: index % 2 === 0 ? "GLD" : "BTC",
      change,
      cost,
      skipped: gateHit,
      note: gateHit ? "Cost gate held position" : "Reweighted per policy",
    };
  });

  return {
    metrics: {
      giniBp,
      totalReturnPct,
      sharpe,
      maxDrawdownPct: chart.maxDrawdown,
    },
    trades: {
      total: totalRebalances,
      skipped,
      avgCost,
      totalImpact,
      log: tradeLog,
    },
    chart: chart.data,
    horizon: `${formatMonthLabel(START_DATE)} to ${formatMonthLabel(END_DATE)}`,
  };
};

const downloadCsv = (rows: string[][], filename: string) => {
  const csvContent = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const policyLabel = (rebalance: number) => {
  if (rebalance <= 3) return "High-frequency basket";
  if (rebalance <= 7) return "Weekly reweighting";
  if (rebalance <= 14) return "Bi-weekly reweighting";
  return "Monthly tilt";
};

export default function DemoPage() {
  const [costCap, setCostCap] = useState([35]);
  const [rebalancePeriod, setRebalancePeriod] = useState([7]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult>(() => simulateBacktest(costCap[0], rebalancePeriod[0]));
  const [lastRunLabel, setLastRunLabel] = useState("");

  useEffect(() => {
    setLastRunLabel(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }));
  }, [result]);

  const handleRun = () => {
    setIsRunning(true);
    window.setTimeout(() => {
      setResult(simulateBacktest(costCap[0], rebalancePeriod[0]));
      setIsRunning(false);
    }, 320);
  };

  const handleDownloadReport = () => {
    const lines = [
      "MEIc Backtest Demo",
      `Period: ${result.horizon}`,
      `Policy: ${policyLabel(rebalancePeriod[0])}`,
      "",
      "Performance:",
      `- GINI (annualized): ${result.metrics.giniBp} bp`,
      `- Total return (MEIc): ${result.metrics.totalReturnPct}%`,
      `- Sharpe: ${result.metrics.sharpe}`,
      `- Max drawdown: ${result.metrics.maxDrawdownPct}%`,
      "",
      "Trade stats:",
      `- Total rebalances: ${result.trades.total}`,
      `- Skipped (cost gate): ${result.trades.skipped}`,
      `- Avg cost per trade: ${result.trades.avgCost} bp`,
      `- Total cost impact: ${result.trades.totalImpact} bp`,
    ].join("\n");

    downloadText(lines, "meic_backtest_report.txt");
  };

  const handleExportTrades = () => {
    const rows = [
      ["Date", "Instrument", "Weight change (%)", "Cost (bp)", "Skipped", "Note"],
      ...result.trades.log.map(entry => [
        entry.date,
        entry.instrument,
        entry.change.toString(),
        entry.cost.toString(),
        entry.skipped ? "yes" : "no",
        entry.note,
      ]),
    ];

    downloadCsv(rows, "meic_trade_log.csv");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-mono">
              MEIc Backtest Simulator
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">10-Year Backtest Demo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simulate portfolio performance with MEIc numeraire. Adjust parameters to see how cost caps and
              rebalancing frequency affect GINI&#8482; returns.
            </p>
          </div>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Simulation Parameters</h2>
              <span className="text-xs text-muted-foreground font-mono" suppressHydrationWarning>
                Last run: {lastRunLabel || "—"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Cost Cap (basis points)
                    <span className="font-mono text-primary ml-2">{costCap[0]} bp</span>
                  </label>
                  <Slider value={costCap} onValueChange={setCostCap} min={10} max={100} step={5} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-2">Maximum allowed trading cost (fee + impact)</p>
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
                  <p className="text-xs text-muted-foreground mt-2">How often to recompute and reweight the basket</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Current Settings</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Period:</span>
                      <span className="text-foreground">{result.horizon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Policy:</span>
                      <span className="text-foreground">{policyLabel(rebalancePeriod[0])}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk gate:</span>
                      <span className="text-foreground">Median-I&#8482;</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost cap:</span>
                      <span className="text-primary">{costCap[0]} bp</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  size="lg"
                  onClick={handleRun}
                  disabled={isRunning}
                >
                  {isRunning ? <RotateCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {isRunning ? "Running..." : "Run Simulation"}
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">GINI&#8482; (annualized)</span>
                  <span className="text-xl font-bold text-graph font-mono">{result.metrics.giniBp} bp</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Return (MEIc)</span>
                  <span className="text-xl font-bold font-mono">{result.metrics.totalReturnPct}%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                  <span className="text-xl font-bold font-mono">{result.metrics.sharpe}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Drawdown</span>
                  <span className="text-xl font-bold text-signal font-mono">{result.metrics.maxDrawdownPct}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Trade Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Rebalances</span>
                  <span className="text-xl font-bold font-mono">{result.trades.total}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Skipped (cost gate)</span>
                  <span className="text-xl font-bold font-mono">{result.trades.skipped}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Avg Cost per Trade</span>
                  <span className="text-xl font-bold font-mono">{result.trades.avgCost} bp</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Cost Impact</span>
                  <span className="text-xl font-bold font-mono">{result.trades.totalImpact} bp</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cumulative Returns</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs">
                  MEIc
                </Badge>
                <Badge variant="outline" className="border-platinum/20 bg-platinum/5 text-platinum text-xs">
                  USD
                </Badge>
              </div>
            </div>

            <div className="aspect-[16/9] bg-muted/30 rounded border border-border/50 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.chart}>
                  <defs>
                    <linearGradient id="meicFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="usdFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--platinum))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--platinum))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} hide />
                  <YAxis tickFormatter={value => `${(Number(value) - 1) * 100}%`} tick={{ fontSize: 12 }} width={60} />
                  <Tooltip
                    formatter={(value: number) => `${((value - 1) * 100).toFixed(2)}%`}
                    labelFormatter={label => `Month: ${label}`}
                  />
                  <Area type="monotone" dataKey="meic" stroke="hsl(var(--primary))" fill="url(#meicFill)" strokeWidth={2} />
                  <Area type="monotone" dataKey="usd" stroke="hsl(var(--platinum))" fill="url(#usdFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Button variant="outline" className="gap-2" onClick={handleDownloadReport}>
              <Download className="h-4 w-4" />
              Download Full Report
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportTrades}>
              <Download className="h-4 w-4" />
              Export Trade Log CSV
            </Button>
          </div>

          <Card className="p-6 bg-muted/30 border-border">
            <h3 className="text-sm font-semibold mb-3 text-primary">Methodology Note</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This backtest uses placeholder historical signals inspired by FRED, LBMA, and CoinGecko series. Returns are
              calculated in MEIc units using r<sub>i,MEIc</sub> = Σ ln(P<sub>i</sub><sup>USD</sup> / P<sub>USD</sub><sup>MEIc</sup>).
              The replicator dynamic reweights components from clipped returns: dw<sub>j</sub> = w<sub>j</sub>[r<sub>j</sub>(λ) - λ w<sub>k</sub>r<sub>k</sub>(λ)]dt.
              Cost gate skips trades when projected fee + impact exceeds the specified cap. GINI&#8482; removes global funding costs
              and MEIc-denominated inflation to isolate skill. Demo values are synthetic but react to the controls above.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
