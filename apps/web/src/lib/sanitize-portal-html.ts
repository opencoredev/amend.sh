/**
 * Minimal, dependency-free sanitizer for changelog body HTML.
 *
 * Changelog bodies are authored by workspace owners in the dashboard composer (a
 * contentEditable that emits a small set of formatting tags: headings, lists,
 * blockquotes, links, `pre`, inline marks). They render on the *public* portal,
 * so before the markup reaches `dangerouslySetInnerHTML` we strip the script-y
 * vectors an owner could paste in. The work is pure string manipulation so it
 * produces identical output on the server and the client — no hydration drift.
 *
 * This is a trust-model safety net (authors are semi-trusted), not a hardened
 * parser. It removes whole dangerous elements, inline event handlers, and
 * unsafe URL schemes, which covers the realistic vectors for this content.
 */

const DANGEROUS_BLOCK =
  /<\s*(script|style|iframe|object|embed|form|noscript|template)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DANGEROUS_VOID =
  /<\s*(script|style|iframe|object|embed|form|noscript|template|link|meta|base)\b[^>]*\/?>/gi;
// Browsers accept an attribute right after a quoted value with no space, so a
// quote counts as a separator too.
const ATTRIBUTE = /(?:\s+|(?<=[/"']))([^\s"'>/=]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g;
const UNSAFE_URL_SCHEME = /^(?:javascript|data|vbscript):/i;
// Characters a browser ignores while reading a URL scheme.
const IGNORED_URL_CHARACTERS = /[\p{Cc}\s]/gu;

function fromCodePoint(codePoint: number): string {
  return codePoint > 0x10ffff ? "\ufffd" : String.fromCodePoint(codePoint);
}

function decodeCharacterReferences(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, decimal: string) => fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&colon;/gi, ":")
    .replace(/&(?:tab|newline);/gi, "");
}

function isUnsafeAttribute(name: string, value: string): boolean {
  if (/^on/i.test(name)) {
    return true;
  }
  const unquoted = /^["']/.test(value) ? value.slice(1, -1) : value;
  const scheme = decodeCharacterReferences(unquoted).replace(IGNORED_URL_CHARACTERS, "");
  return UNSAFE_URL_SCHEME.test(scheme);
}

export function sanitizePortalHtml(html: string | null | undefined): string {
  if (!html) {
    return "";
  }
  return html
    .replace(DANGEROUS_BLOCK, "")
    .replace(DANGEROUS_VOID, "")
    .replace(ATTRIBUTE, (attribute, name: string, value: string) =>
      isUnsafeAttribute(name, value) ? "" : attribute,
    );
}
