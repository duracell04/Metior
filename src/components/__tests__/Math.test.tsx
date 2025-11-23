import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("katex/dist/katex.min.css", () => ({}), { virtual: true });

import { MathBlock, MathInline } from "../Math";

describe("Math components", () => {
  it("renders display math with KaTeX markup", () => {
    const html = renderToString(
      <MathBlock ariaLabel="pythagoras" plainText="a^2 + b^2 = c^2">
        {String.raw`a^2 + b^2 = c^2`}
      </MathBlock>
    );

    expect(html).toContain("katex-display");
    expect(html).toContain("a^2");
  });

  it("renders inline math with KaTeX markup", () => {
    const html = renderToString(<MathInline ariaLabel="sigma">{String.raw`\sigma_i(t)`}</MathInline>);

    expect(html).toContain("katex-inline");
    expect(html).toContain("\\sigma");
  });
});
