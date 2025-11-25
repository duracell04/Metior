import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { navLinks } from "@/lib/navigation";

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
                {navLinks.map(link =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="space-y-4 text-sm text-muted-foreground">
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
    </footer>
  );
};
