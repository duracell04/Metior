import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Mêtior (MEΩ)</h3>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                A universal numéraire built on open math. Deterministic, transparent, and currency-neutral.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Navigation</h4>
              <nav className="flex flex-wrap gap-4 text-sm">
                <a href="#equations" className="text-muted-foreground hover:text-primary transition-colors">
                  Equations
                </a>
                <a href="#demo" className="text-muted-foreground hover:text-primary transition-colors">
                  Demo
                </a>
                <a href="#weights" className="text-muted-foreground hover:text-primary transition-colors">
                  Weights
                </a>
                <a href="#github" className="text-muted-foreground hover:text-primary transition-colors">
                  GitHub
                </a>
              </nav>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Disclaimer:</strong> Prototype math; educational content; no investment advice.
            </p>
            <p>
              <strong className="text-foreground">Sources:</strong> FRED, LBMA, CoinGecko, Yahoo Finance
            </p>
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Open license: Brand tokens & badges MIT</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
