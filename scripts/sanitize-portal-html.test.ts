import { describe, expect, test } from "bun:test";

import { sanitizePortalHtml } from "../apps/web/src/lib/sanitize-portal-html";

describe("sanitizePortalHtml", () => {
  test("keeps the composer's formatting and safe links", () => {
    const html =
      '<h2>Release</h2><p>See <a href="https://amend.sh/docs" target="_blank">docs</a> and <img src="/logo.png" alt="logo"></p>';
    expect(sanitizePortalHtml(html)).toBe(html);
  });

  test("strips unsafe URL schemes from every attribute", () => {
    const cases = [
      '<button formaction="javascript:alert(1)">x</button>',
      "<img srcset='javascript:alert(1) 1x'>",
      "<video poster=javascript:alert(1)></video>",
      '<input action="data:text/html,x">',
      '<a href="vbscript:x">x</a>',
    ];
    for (const html of cases) {
      const sanitized = sanitizePortalHtml(html);
      expect(sanitized).not.toMatch(/javascript:|data:|vbscript:/i);
    }
  });

  test("decodes character references and ignored characters before checking the scheme", () => {
    const cases = [
      '<a href="jav&#x09;ascript:alert(1)">x</a>',
      '<a href="&#106;avascript:alert(1)">x</a>',
      '<a href="javascript&colon;alert(1)">x</a>',
      '<a href=" \njavascript:alert(1)">x</a>',
      '<a href="java&Tab;script:alert(1)">x</a>',
    ];
    for (const html of cases) {
      expect(sanitizePortalHtml(html)).toBe("<a>x</a>");
    }
  });

  test("strips event handlers and attributes that follow a quoted value without a space", () => {
    expect(sanitizePortalHtml('<img src="/a.png"onerror="alert(1)">')).toBe('<img src="/a.png">');
    expect(sanitizePortalHtml('<a title="x"href="javascript:alert(1)">x</a>')).toBe(
      '<a title="x">x</a>',
    );
    expect(sanitizePortalHtml("<svg/onload=alert(1)>")).toBe("<svg/>");
  });

  test("removes dangerous elements", () => {
    expect(sanitizePortalHtml("<p>a</p><script>alert(1)</script><form><input></form>")).toBe(
      "<p>a</p>",
    );
  });
});
