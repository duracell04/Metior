import { Card } from "@/components/ui/card";
import { Globe, TrendingUp, FileText } from "lucide-react";

export const WhyItMatters = () => {
  const features = [
    {
      icon: Globe,
      title: "Currency-neutral truth",
      description: "Performance no longer 'rides' USD or CHF. MEΩ denominates returns against the whole money universe.",
    },
    {
      icon: TrendingUp,
      title: "Adaptive resilience",
      description: "QE, metal rallies, crypto cycles → MEΩ reweights; your yard-stick stays relevant.",
    },
    {
      icon: FileText,
      title: "Audit-ready",
      description: "Weights and MEΩ price are stored as (date, symbol, weight, meo_usd, m_world_usd).",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why It Matters</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
