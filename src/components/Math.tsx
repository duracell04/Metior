import clsx from "clsx";
import katex from "@/lib/katex";
import "@/styles/katex.css";

type MathProps = {
  children: string;
  ariaLabel?: string;
  className?: string;
  plainText?: string;
};

const renderOptions = {
  throwOnError: false,
  output: "html" as const,
  strict: "ignore" as const,
  macros: { "\\ME\\Omega": "\\mathrm{ME}\\Omega", "\\USD": "\\mathrm{USD}" },
};

export function MathInline({ children, ariaLabel, className }: MathProps) {
  const html = katex.renderToString(children, { ...renderOptions, displayMode: false });

  return (
    <span
      className={className}
      role="img"
      aria-label={ariaLabel || "mathematical expression"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function MathBlock({ children, ariaLabel, className, plainText }: MathProps) {
  const html = katex.renderToString(children, { ...renderOptions, displayMode: true });

  return (
    <figure
      className={clsx(
        "bg-snow text-ink rounded-md p-3 md:p-4 shadow-sm overflow-x-auto",
        className
      )}
    >
      <div
        role="img"
        aria-label={ariaLabel || "mathematical expression"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {plainText ? (
        <figcaption className="mt-2 text-xs text-muted-foreground font-mono select-all">
          {plainText}
        </figcaption>
      ) : null}
    </figure>
  );
}
