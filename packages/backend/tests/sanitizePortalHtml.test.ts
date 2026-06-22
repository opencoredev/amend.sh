import { describe, expect, test } from "bun:test";
import { sanitizePortalHtml } from "../../../apps/web/src/lib/sanitize-portal-html";

describe("sanitizePortalHtml", () => {
  test("removes slash-separated event handlers and unsafe URL schemes", () => {
    const html = [
      '<img/onerror="alert(1)" src="data:text/html,<svg onload=alert(1)>">',
      '<svg/onload="alert(2)"></svg>',
      '<a href="vbscript:msgbox(1)">link</a>',
      "<a href=javascript:alert(3)>bad</a>",
      '<a href="https://example.com/docs">safe</a>',
    ].join("");

    const sanitized = sanitizePortalHtml(html);

    expect(sanitized).not.toContain("onerror");
    expect(sanitized).not.toContain("onload");
    expect(sanitized).not.toContain("data:text/html");
    expect(sanitized).not.toContain("vbscript:");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).toContain('href="https://example.com/docs"');
  });
});
