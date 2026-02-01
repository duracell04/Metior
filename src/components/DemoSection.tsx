"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Download, PlayCircle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import snapshotWire from "@/data/weights_2025-10-08.json";
import { normalizeSnapshot } from "@/lib/meo-data";

const SNAPSHOT = normalizeSnapshot(snapshotWire);

const CATEGORY_BY_SYMBOL: Record<string, string> = {
  CNY: "Fiat M2",
  USD: "Fiat M2",
  EUR: "Fiat M2",
  JPY: "Fiat M2",
  XAU: "Precious Metal",
  XAG: "Precious Metal",
  BTC: "Crypto",
  ETH: "Crypto",
};

const formatPct = (value: number) => (value * 100).toFixed(1);
const formatUsd = (value: number) => Math.round(value).toString();

export const DemoSection = () => {
  const [isUSDView, setIsUSDView] = useState(true);
  const { toast } = useToast();

  const handleDownloadWeights = () => {
    const csvData = [
      ["Symbol", "Weight (%)", "Market Cap (USD)", "Category"],
      ...SNAPSHOT.weights.map(({ symbol, w, mc_usd }) => [
        symbol,
        formatPct(w),
        formatUsd(mc_usd),
        CATEGORY_BY_SYMBOL[symbol] ?? "Other",
      ]),
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `meo_weights_${SNAPSHOT.date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "MEΩ basket weights CSV has been downloaded.",
    });
  };

  const handleToggleView = () => {
    setIsUSDView(!isUSDView);
    toast({
      title: `Switched to ${!isUSDView ? "USD" : "MEΩ"} denomination`,
      description: `Now showing returns in ${!isUSDView ? "USD" : "MEΩ"} units.`,
    });
  };

  const demos = [
    {
      icon: PlayCircle,
      title: "Run 10-year backtest",
      description: "Weekly policy. Median-II gate. Cost cap 35 bp. GINI™ shown by default.",
      buttonText: "Run Demo",
      action: "link" as const,
      href: "/demo",
    },
    {
      icon: BarChart3,
      title: "Compare denominated returns",
      description: `See how BTC/GLD/VTI behave in MEΩ vs USD. Currently: ${isUSDView ? "USD" : "MEΩ"} view`,
      buttonText: isUSDView ? "Switch to MEΩ" : "Switch to USD",
      action: "toggle" as const,
    },
    {
      icon: Download,
      title: "Inspect the basket",
      description: "Download weights CSV and audit the components.",
      buttonText: "Download Weights",
      action: "download" as const,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Live Demo</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Interactive tools to explore MEΩ performance and composition
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {demos.map((demo, index) => (
              <Card key={index} className="p-6 bg-card border-border flex flex-col">
                <demo.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-3">{demo.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">{demo.description}</p>
                {demo.action === "link" ? (
                  <Link href={demo.href!}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      {demo.buttonText}
                    </Button>
                  </Link>
                ) : demo.action === "toggle" ? (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleToggleView}
                  >
                    {demo.buttonText}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleDownloadWeights}
                  >
                    {demo.buttonText}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
