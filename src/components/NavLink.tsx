"use client";

import { forwardRef, ComponentProps } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "className" | "href"> & {
  href: LinkProps["href"];
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
};

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, pendingClassName: _pending, ...props }, ref) => {
    const pathname = usePathname();
    const hrefString = typeof href === "string" ? href : href?.toString();
    const isActive = hrefString === "/" ? pathname === "/" : pathname?.startsWith(hrefString ?? "");

    return (
      <Link ref={ref} href={href} className={cn(className, isActive && activeClassName)} {...props} />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
