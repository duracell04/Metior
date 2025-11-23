"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Download, PlayCircle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const DemoSection = () => {
  const [isUSDView, setIsUSDView] = useState(true);
  const { toast } = useToast();

  const handleDownloadWeights = () => {
    const csvData = [
      ["Symbol", "Weight (%)", "Market Cap (USD)", "Category"],
      ["CNY", "39.2", "42,532,800,000,000", "Fiat M2"],
      ["XAU", "20.4", "22,137,600,000,000", "Precious Metal"],
      ["USD", "19.8", "21,484,800,000,000", "Fiat M2"],
      ["EUR", "15.5", "16,822,000,000,000", "Fiat M2"],
      ["BTC", "2.1", "2,278,400,000,000", "Crypto"],
      ["JPY", "1.6", "1,734,400,000,000", "Fiat M2"],
      ["XAG", "1.0", "1,084,000,000,000", "Precious Metal"],
      ["ETH", "0.4", "433,600,000,000", "Crypto"],
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `meo_weights_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "MEIc basket weights CSV has been downloaded.",
    });
  };

  const handleToggleView = () => {
    setIsUSDView(!isUSDView);
    toast({
      title: `Switched to ${!isUSDView ? "USD" : "MEIc"} denomination`,
      description: `Now showing returns in ${!isUSDView ? "USD" : "MEIc"} units.`,
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
      description: `See how BTC/GLD/VTI behave in MEIc vs USD. Currently: ${isUSDView ? "USD" : "MEIc"} view`,
      buttonText: isUSDView ? "Switch to MEIc" : "Switch to USD",
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
            Interactive tools to explore MEIc performance and composition
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
