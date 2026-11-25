import { describe, expect, test } from "bun:test";

import { sanitizePortalHtml } from "../apps/web/src/lib/sanitize-portal-html";

describe("sanitizePortalHtml", () => {
  test("keeps the composer's formatting, links and code blocks", () => {
    const composerLink =
      '<p>See <a href="https://amend.sh/docs" target="_blank" rel="noreferrer">docs</a>.</p>';
    expect(sanitizePortalHtml(composerLink)).toBe(
      '<p>See <a href="https://amend.sh/docs" target="_blank" rel="noopener noreferrer">docs</a>.</p>',
    );
    const html = [
      "<h1>Release</h1>",
      "<h2>Fixes</h2>",
      "<ul><li><b>bold</b> <i>italic</i> <u>under</u> <strike>gone</strike></li></ul>",
      "<ol><li>one</li></ol>",
      "<blockquote>quote</blockquote>",
      '<pre class="amend-code-block" data-language="ts"><code><span class="tok-kw">const</span> a = "1 &lt; 2";</code></pre>',
      "<p><br></p>",
    ].join("");
    expect(sanitizePortalHtml(html)).toBe(html);
  });

  test("keeps text that looks like markup or attributes", () => {
    const html =
      '<pre><code>&lt;form action="data:text/plain,hello"&gt; x="y" 3 &lt; 4</code></pre>';
    expect(sanitizePortalHtml(html)).toBe(html);
    expect(sanitizePortalHtml("<p>1 < 2 and 3 > 2</p>")).toBe("<p>1 &lt; 2 and 3 > 2</p>");
  });

  test("drops attributes outside the allowlist, including URL-bearing ones", () => {
    expect(sanitizePortalHtml('<p style="color:red" onclick="x()">a</p>')).toBe("<p>a</p>");
    expect(sanitizePortalHtml('<img src="/a.png"onerror="x()" srcset="javascript:x 1x">')).toBe(
      '<img src="/a.png">',
    );
    expect(sanitizePortalHtml('<a title="x"href="https://a.dev">x</a>')).toBe(
      '<a title="x" href="https://a.dev">x</a>',
    );
  });

  test("allows only http(s), mailto and relative URLs", () => {
    const unsafe = [
      '<a href="javascript:alert(1)">x</a>',
      '<a href="vbscript:x">x</a>',
      '<a href="data:text/html,x">x</a>',
      '<a href="jav&#x09;ascript:alert(1)">x</a>',
      '<a href="&#106;avascript:alert(1)">x</a>',
      '<a href="javascript&colon;alert(1)">x</a>',
      '<a href=" \njavascript:alert(1)">x</a>',
      '<a href="java&Tab;script:alert(1)">x</a>',
      "<a HREF=javascript:alert(1)>x</a>",
    ];
    for (const html of unsafe) {
      expect(sanitizePortalHtml(html)).toBe("<a>x</a>");
    }
    for (const href of ["https://a.dev", "http://a.dev", "mailto:a@b.dev", "/docs", "#top"]) {
      expect(sanitizePortalHtml(`<a href="${href}">x</a>`)).toBe(`<a href="${href}">x</a>`);
    }
  });

  test("drops active elements with their content and unknown tags without it", () => {
    expect(sanitizePortalHtml("<p>a</p><script>alert(1)</script><style>p{}</style>")).toBe(
      "<p>a</p>",
    );
    expect(
      sanitizePortalHtml(
        '<svg><a href="/x"><animate attributeName="href" values="https://a;javascript:x"/></a></svg>ok',
      ),
    ).toBe("ok");
    expect(sanitizePortalHtml('<form><button formaction="javascript:x">b</button></form>c')).toBe(
      "c",
    );
    expect(sanitizePortalHtml('<button formaction="javascript:x">b</button>')).toBe("b");
    expect(
      sanitizePortalHtml('<video poster="javascript:x"></video><iframe src="/x"></iframe>z'),
    ).toBe("z");
    expect(sanitizePortalHtml("<p>a<!-- <img src=x onerror=y> --></p>")).toBe("<p>a</p>");
  });

  test("forces noopener on links that open a new tab", () => {
    expect(sanitizePortalHtml('<a href="/x" target="_blank" rel="opener">x</a>')).toBe(
      '<a href="/x" target="_blank" rel="noopener noreferrer">x</a>',
    );
    expect(sanitizePortalHtml('<a href="/x" rel="opener">x</a>')).toBe('<a href="/x">x</a>');
  });

  test("keeps content after void elements it drops", () => {
    expect(sanitizePortalHtml('<embed src="/a.pdf"><ul><li>kept</li></ul>')).toBe(
      "<ul><li>kept</li></ul>",
    );
    expect(sanitizePortalHtml('<input value="x"><p>kept</p>')).toBe("<p>kept</p>");
    expect(sanitizePortalHtml("<svg/><p>Release details</p><math />")).toBe(
      "<p>Release details</p>",
    );
    expect(sanitizePortalHtml("<svg/><script>alert(1)</script>ok")).toBe("ok");
    expect(sanitizePortalHtml("<style/>p { color: red }</style>ok")).toBe("ok");
    expect(sanitizePortalHtml("<svg viewBox=0/><text>label</text></svg>ok")).toBe("ok");
  });

  test("escapes quotes in kept attribute values and drops unterminated tags", () => {
    expect(sanitizePortalHtml("<a title='say \"hi\"' href='/x'>x</a>")).toBe(
      '<a title="say &quot;hi&quot;" href="/x">x</a>',
    );
    expect(sanitizePortalHtml('<p>a</p><img src="/x" onerror="y')).toBe("<p>a</p>");
    expect(sanitizePortalHtml('<p title="</p><img src=x onerror=y>">t</p>')).toBe(
      '<p title="&lt;/p>&lt;img src=x onerror=y>">t</p>',
    );
  });
});
