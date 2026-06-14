import { describe, expect, test } from "bun:test";

import { parseThemeCss } from "../apps/web/src/lib/portal-themes";

describe("parseThemeCss", () => {
  test("parses a standard tweakcn :root / .dark export", () => {
    const css = `
      :root {
        --background: oklch(1 0 0);
        --primary: oklch(0.62 0.19 259);
        --radius: 0.5rem;
      }
      .dark {
        --background: oklch(0.15 0 0);
        --primary: oklch(0.7 0.19 259);
      }
    `;
    const { light, dark } = parseThemeCss(css);
    expect(light).toEqual({
      background: "oklch(1 0 0)",
      primary: "oklch(0.62 0.19 259)",
      radius: "0.5rem",
    });
    expect(dark).toEqual({
      background: "oklch(0.15 0 0)",
      primary: "oklch(0.7 0.19 259)",
    });
  });

  test("ignores declarations outside the applied-token allowlist", () => {
    const css = ":root { --background: red; --not-a-token: blue; --font-sans: Inter; }";
    expect(parseThemeCss(css).light).toEqual({ background: "red" });
  });

  test("strips block comments so a commented-out declaration cannot win", () => {
    const css = ":root { --background: white; /* --background: black; */ }";
    expect(parseThemeCss(css).light).toEqual({ background: "white" });
  });

  test("ignores a prefers-color-scheme :root that precedes the base :root", () => {
    const css = `
      @media (prefers-color-scheme: dark) {
        :root { --background: black; }
      }
      :root { --background: white; }
    `;
    expect(parseThemeCss(css).light).toEqual({ background: "white" });
  });

  test("ignores a prefers-color-scheme :root that follows the base :root", () => {
    const css = `
      :root { --background: white; }
      @media (prefers-color-scheme: dark) {
        :root { --background: black; }
      }
    `;
    expect(parseThemeCss(css).light).toEqual({ background: "white" });
  });

  test("still reads tokens nested inside an @layer wrapper", () => {
    const css = `
      @layer base {
        :root { --background: white; }
        .dark { --background: black; }
      }
    `;
    const { light, dark } = parseThemeCss(css);
    expect(light).toEqual({ background: "white" });
    expect(dark).toEqual({ background: "black" });
  });
});
