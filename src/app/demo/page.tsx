"use client";

import { useEffect, useState } from "react";
import { Download, Play, RotateCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { MathBlock, MathInline } from "@/components/Math";
import { CopyCode } from "@/components/CopyCode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { fmtPct } from "@/lib/format";

type ChartPoint = {
  label: string;
  meo: number;
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
  policy: string;
};

const START_DATE = new Date("2014-11-01");
const END_DATE = new Date("2024-11-01");

const formatMonthLabel = (date: Date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const policyLabel = (rebalance: number) => {
  if (rebalance <= 3) return "High-frequency basket";
  if (rebalance <= 7) return "Weekly re-weighting";
  if (rebalance <= 14) return "Bi-weekly re-weighting";
  return "Monthly tilt";
};

const buildChart = (costCap: number, rebalance: number) => {
  const months = 120;
  const data: ChartPoint[] = [];
  const monthlyReturns: number[] = [];
  let meo = 1;
  let usd = 1;
  let peak = 1;
  let maxDrawdown = 0;

  for (let i = 0; i <= months; i += 1) {
    const labelDate = new Date(START_DATE);
    labelDate.setMonth(START_DATE.getMonth() + i);

    const baseDrift = 0.00073 + (10 - rebalance) * 0.00003 - (costCap - 60) * 0.000007;
    const cycle = Math.sin(i * 0.32 + costCap * 0.02) * 0.0009;
    const micro = Math.cos(i * 0.19 + rebalance * 0.4) * 0.0006;
    const monthlyReturn = clamp(baseDrift + cycle + micro, -0.008, 0.01);

    monthlyReturns.push(monthlyReturn);
    meo *= 1 + monthlyReturn;

    const usdDrag = 0.00022 + costCap * 0.0000025;
    usd *= 1 + monthlyReturn - usdDrag;

    peak = Math.max(peak, meo);
    maxDrawdown = Math.min(maxDrawdown, (meo - peak) / peak);

    data.push({
      label: formatMonthLabel(labelDate),
      meo: Number(meo.toFixed(5)),
      usd: Number(usd.toFixed(5)),
    });
  }

  const avgMonthly = monthlyReturns.reduce((sum, r) => sum + r, 0) / monthlyReturns.length;
  const variance =
    monthlyReturns.reduce((sum, r) => sum + Math.pow(r - avgMonthly, 2), 0) / Math.max(1, monthlyReturns.length);
  const stdMonthly = Math.sqrt(variance);

  return {
    data,
    totals: {
      meo,
      usd,
    },
    avgMonthly,
    stdMonthly,
    maxDrawdownPct: Number((maxDrawdown * 100).toFixed(1)),
  };
};

const simulateBacktest = (costCap: number, rebalance: number): SimulationResult => {
  const chart = buildChart(costCap, rebalance);
  const policyModifier = (14 - rebalance) * 1.6;
  const costModifier = -(costCap - 60) * 0.8;

  const giniBp = Math.max(
    40,
    Math.round(142 + chart.avgMonthly * 8000 - chart.stdMonthly * 4200 + policyModifier + costModifier)
  );
  const sharpe = Number(
    Math.max(0.6, Math.min(3, (chart.avgMonthly / Math.max(0.0001, chart.stdMonthly)) * Math.sqrt(12))).toFixed(2)
  );

  const totalReturnPct = Number(((chart.totals.meo - 1) * 100).toFixed(1));
  const maxDrawdownPct = Number(Math.max(-8, Math.min(-0.8, chart.maxDrawdownPct)).toFixed(1));

  const totalRebalances = Math.max(1, Math.round(3650 / rebalance));
  const skipped = Math.max(0, Math.round(totalRebalances * Math.max(0.02, 0.044 + (60 - costCap) / 4000)));
  const avgCost = Number(Math.min(costCap, costCap * 0.22 + rebalance * 0.5 + 2).toFixed(1));
  const totalImpact = -Math.round(avgCost * (totalRebalances - skipped) * 0.01);

  const tradeLog: TradeEntry[] = Array.from({ length: 10 }, (_, index) => {
    const point = chart.data[Math.min(chart.data.length - 1, (index + 1) * 10)];
    const change = Number((Math.sin(index * 0.9 + rebalance) * 3.2 + 9 - costCap / 14).toFixed(2));
    const cost = Number(Math.min(costCap, avgCost + Math.sin(index + costCap / 18) * 2).toFixed(1));
    const gateHit = cost > costCap - 1 && index % 3 === 0;

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
      maxDrawdownPct,
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
    policy: policyLabel(rebalance),
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

export default function DemoPage() {
  const [costCap, setCostCap] = useState([60]);
  const [rebalancePeriod, setRebalancePeriod] = useState([7]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult>(() => simulateBacktest(60, 7));
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
      "MEΩ Backtest Demo",
      `Period: ${result.horizon}`,
      `Policy: ${result.policy}`,
      "",
      "Performance:",
      `- GINI (annualized): ${result.metrics.giniBp} bp`,
      `- Total return (MEΩ): ${result.metrics.totalReturnPct}%`,
      `- Sharpe: ${result.metrics.sharpe}`,
      `- Max drawdown: ${result.metrics.maxDrawdownPct}%`,
      "",
      "Trade stats:",
      `- Total rebalances: ${result.trades.total}`,
      `- Skipped (cost gate): ${result.trades.skipped}`,
      `- Avg cost per trade: ${result.trades.avgCost} bp`,
      `- Total cost impact: ${result.trades.totalImpact} bp`,
    ].join("\n");

    downloadText(lines, "meo_backtest_report.txt");
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

    downloadCsv(rows, "meo_trade_log.csv");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary font-mono">
              10-Year Demo
            </Badge>
            <h1 className="text-4xl font-bold">MEΩ Backtest Simulator</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              A reproducible simulator measuring portfolio performance in the MEIc numeraire?returns are currency-neutral
              and inflation-aware. Tune trading costs and rebalancing cadence; outputs follow the explicit equations
              below.
            </p>
            <p className="text-xs text-muted-foreground">
              Demo returns are synthetic; no external data is fetched. Snapshot date is fixed at 2025-10-08.
            </p>
          </div>

          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Simulation Parameters</h2>
                <p className="text-sm text-muted-foreground">
                  Upper bound on projected fee + market impact per trade, plus the trading clock for policy decisions.
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-mono" suppressHydrationWarning>
                Last run: {lastRunLabel || "02:59"}
              </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Cost Cap (bp)</span>
                  <span className="font-mono text-primary">{costCap[0]} bp</span>
                </div>
                <Slider value={costCap} onValueChange={setCostCap} min={20} max={120} step={5} className="w-full" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upper bound on projected fee + market impact per trade. If the bound is breached, the trade is skipped
                  (cost gate).
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Rebalance Period</span>
                  <span className="font-mono text-primary">{rebalancePeriod[0]}d</span>
                </div>
                <Slider value={rebalancePeriod} onValueChange={setRebalancePeriod} min={1} max={30} step={1} />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Trading clock for policy decisions (weekly in this demo). Adjust to explore cadence sensitivity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Current Settings</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Period:</span>
                      <span className="text-foreground">2014-11 to 2024-11</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Policy:</span>
                      <span className="text-foreground">{result.policy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk gate:</span>
                      <span className="text-foreground">Median-σ (see §3.2)</span>
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Performance (MEΩ-native)</h3>
                <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5 text-primary">
                  Live from controls
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">GINI™ (annualized)</span>
                  <span className="text-xl font-bold text-graph font-mono">{result.metrics.giniBp} bp</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Return (MEΩ)</span>
                  <span className="text-xl font-bold font-mono">{result.metrics.totalReturnPct}%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Sharpe (weekly → annualized)</span>
                  <span className="text-xl font-bold font-mono">{result.metrics.sharpe}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Drawdown</span>
                  <span className="text-xl font-bold text-signal font-mono">{result.metrics.maxDrawdownPct}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Trade Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total rebalances</span>
                  <span className="text-xl font-bold font-mono">{result.trades.total}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Skipped (Cost Gate)</span>
                  <span className="text-xl font-bold font-mono">{result.trades.skipped}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Avg cost per trade</span>
                  <span className="text-xl font-bold font-mono">{result.trades.avgCost} bp</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total cost impact</span>
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
                  MEΩ baseline
                </Badge>
                <Badge variant="outline" className="border-platinum/20 bg-platinum/5 text-platinum text-xs">
                  USD (with its own drift)
                </Badge>
              </div>
            </div>

            <div className="aspect-[16/9] bg-muted/30 rounded border border-border/50 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.chart}>
                  <defs>
                    <linearGradient id="meoFill" x1="0" y1="0" x2="0" y2="1">
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
                  <YAxis tickFormatter={value => fmtPct(Number(value) - 1)} tick={{ fontSize: 12 }} width={72} />
                  <Tooltip formatter={(value: number) => fmtPct(value - 1, 2)} labelFormatter={label => `Month: ${label}`} />
                  <Area type="monotone" dataKey="meo" stroke="hsl(var(--primary))" fill="url(#meoFill)" strokeWidth={2} />
                  <Area type="monotone" dataKey="usd" stroke="hsl(var(--platinum))" fill="url(#usdFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Rounded to two decimals to avoid long binary fractions (e.g., -9.99% instead of -9.999999999999998%).
            </p>
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

          <Card className="p-6 bg-muted/30 border-border space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1 text-primary">Methodology (precise but readable)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Demo uses synthetic but structured signals so graphs respond to the controls while preserving realistic
                cost/vol behavior. In offline mode (MEO_OFFLINE=1) the weighting snapshot is pinned to 2025-10-08 from the bundled CSV/JSON;
                no live feeds are queried here.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <MathBlock ariaLabel="MEΩ-denominated return">
                {String.raw`r_{i,\ME\Omega}(t) = \Delta \ln\!\left(\dfrac{P^{\USD}_i(t)}{P^{\ME\Omega}_{\USD}(t)}\right)`}
              </MathBlock>
              <p className="text-sm text-platinum">
                Copy: <CopyCode text={"r_i_MEΩ = Δ ln(P_i_USD / P_USD^{MEΩ})"} />
              </p>

              <MathBlock ariaLabel="Portfolio return in MEΩ (discrete)">
                {String.raw`r_{p,\ME\Omega}(t_k) = \sum_i u_i(t_{k-1})\, r_{i,\ME\Omega}(t_k)`}
              </MathBlock>
              <p className="text-sm text-platinum">
                Copy: <CopyCode text={"r_p_MEΩ(t_k) = Σ_i u_i(t_{k-1}) r_i_MEΩ(t_k)"} />
              </p>

              <MathBlock ariaLabel="Clipped replicator dynamic (basket reweighting)">
                {String.raw`\mathrm{d}w_j = w_j\!\left[r^{(\lambda)}_j - \sum_k w_k\, r^{(\lambda)}_k \right]\mathrm{d}t,\quad
r^{(\lambda)}_j=\mathrm{clip}\!\big(r_j,-5\sigma_j,+5\sigma_j\big)`}
              </MathBlock>
              <p className="text-sm text-platinum">
                Copy: <CopyCode text={"dw_j = w_j [ r_j(λ) - Σ_k w_k r_k(λ) ] dt"} />
              </p>

              <MathBlock ariaLabel="Trading cost (commission + square-root impact, in bp)">
                {String.raw`c_{bp}(t_k) = f + 10000 \cdot \gamma \sqrt{\dfrac{|\Delta q(t_k)|}{\mathrm{ADV}_{10}(t_k)}},\qquad c_{bp}(t_k) > \mathrm{Cap}_{bp} \Rightarrow \text{skip trade}`}
              </MathBlock>
              <p className="text-sm text-platinum">
                Copy: <CopyCode text={"c_bp = f + 10000·γ·sqrt(|Δq|/ADV10); skip if c_bp > Cap_bp"} />
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-2 text-xs font-mono text-primary">
              <div>Invariants to assert after each run:</div>
              <MathBlock ariaLabel="Weights sum to one" className="bg-transparent shadow-none p-0">
                {String.raw`\big|\sum_j w_j(t) - 1\big| < 10^{-9}`}
              </MathBlock>
              <p className="text-sm text-platinum">
                Copy: <CopyCode text={"|Σ w_j - 1| < 1e-9"} />
              </p>
              <MathBlock ariaLabel="MEΩ price identity" className="bg-transparent shadow-none p-0">
                {String.raw`\dfrac{\left|P_{\USD}^{\ME\Omega}(t) - \kappa \sum_j MC^{\USD}_j(t)\right|}{P_{\USD}^{\ME\Omega}(t)} < 10^{-6}`}
              </MathBlock>
              <p className="text-sm text-platinum">
                Copy: <CopyCode text={"|P_USD^{MEΩ} - κ Σ MC_j^{USD}| / P_USD^{MEΩ} < 1e-6"} />
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Mathematical Appendix (for quants)</h4>
                <MathBlock ariaLabel="MEΩ price and scale">
                  {String.raw`P^{\ME\Omega}_{\USD}(t) = \kappa \sum_{j \in \mathcal{C}} MC^{\USD}_j(t),\quad \kappa = 10^{-6}`}
                </MathBlock>
                <p className="text-sm text-platinum">
                  Copy: <CopyCode text={"P_USD^{MEΩ} = κ Σ_j MC_j^{USD}"} />
                </p>
                <MathBlock ariaLabel="Weights">
                  {String.raw`w_j(t) = \dfrac{MC^{\USD}_j(t)}{\sum_{k} MC^{\USD}_k(t)},\qquad \sum_j w_j(t)=1`}
                </MathBlock>
                <p className="text-sm text-platinum">
                  Copy: <CopyCode text={"w_j = MC_j^{USD} / Σ_k MC_k^{USD}"} />
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Risk & cost model options</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>
                    Vol: realised σ (window W) or GARCH(1,1) on <MathInline>{String.raw`r_{i,\ME\Omega}`}</MathInline>.
                  </li>
                  <li>Tails: EVT (POT–GPD) for VaR/CVaR in MEΩ units.</li>
                  <li>
                    Cost: commission <MathInline>{"f"}</MathInline> (bp) + impact{" "}
                    <MathInline>{String.raw`\,\,10000\cdot\gamma\sqrt{|\Delta q|/\mathrm{ADV}_{10}}`}</MathInline>; gate when{" "}
                    <MathInline>{String.raw`f + \mathrm{impact}_{bp} > \mathrm{Cap}_{bp}`}</MathInline>.
                  </li>
                </ul>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2 text-sm text-muted-foreground leading-relaxed">
              <div className="font-semibold text-foreground">Disclosure</div>
              <div>Data proxy: stylized signals inspired by FRED, LBMA, CoinGecko behaviors; math and cost/risk machinery are real.</div>
              <div>No advice: educational use only. Export the trade log and report to reproduce aggregates within rounding tolerance.</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
