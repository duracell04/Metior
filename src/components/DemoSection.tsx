import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, BarChart3, Download } from "lucide-react";

export const DemoSection = () => {
  const demos = [
    {
      icon: PlayCircle,
      title: "Run 10-year backtest",
      description: "Weekly policy. Median-σ gate. Cost cap 35 bp. GINα shown by default.",
      buttonText: "Run Demo",
    },
    {
      icon: BarChart3,
      title: "Compare denominated returns",
      description: "See how BTC/GLD/VTI behave in MEΩ vs USD.",
      buttonText: "Toggle View",
    },
    {
      icon: Download,
      title: "Inspect the basket",
      description: "Download weights CSV and audit the components.",
      buttonText: "Download Weights",
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
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                  {demo.description}
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {demo.buttonText}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
