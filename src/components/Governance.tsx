import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const Governance = () => {
  const rules = [
    {
      title: "Inclusion rule",
      description: "Public M2 or free-float mcap ≥ 1% of MEΩ",
    },
    {
      title: "Cadence",
      description: "Recompute daily from open feeds",
    },
    {
      title: "Delisting",
      description: "Stale data > 60 days or liquidity collapse ⇒ weight→0",
    },
    {
      title: "Disclosure",
      description: "Commit weights, meo_usd, m_world_usd daily",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Governance & Transparency</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Algorithmic, deterministic rules with no human discretion
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {rules.map((rule, index) => (
              <Card key={index} className="p-6 bg-card border-border">
                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-graph shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{rule.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
