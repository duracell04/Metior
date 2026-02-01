import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Mêtior (MEΩ)</h3>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                A universal numéraire built on open math. Deterministic, transparent, and currency-neutral.
              </p>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground md:border-l md:border-border md:pl-10">
              <p>
                <strong className="text-foreground">Disclaimer:</strong> Prototype math; educational content; no investment
                advice.
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <strong className="text-foreground">Sources:</strong>
                <a href="https://fred.stlouisfed.org/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  FRED
                </a>
                <span aria-hidden="true">•</span>
                <a href="https://www.lbma.org.uk/prices-and-data" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  LBMA
                </a>
                <span aria-hidden="true">•</span>
                <a href="https://www.coingecko.com/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  CoinGecko
                </a>
                <span aria-hidden="true">•</span>
                <a href="https://finance.yahoo.com/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  Yahoo Finance
                </a>
              </p>
              <p>Open license: Brand tokens & badges MIT</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
