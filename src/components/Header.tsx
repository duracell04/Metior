import Link from "next/link";

import { NavLink } from "@/components/NavLink";
import { navLinks } from "@/lib/navigation";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
          Metior
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 text-sm">
          {navLinks.map(link =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-semibold"
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>
      </div>
    </header>
  );
};
