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
 * `javascript:` URLs, which covers the realistic vectors for this content.
 */

const DANGEROUS_BLOCK =
  /<\s*(script|style|iframe|object|embed|form|noscript|template)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DANGEROUS_VOID =
  /<\s*(script|style|iframe|object|embed|form|noscript|template|link|meta|base)\b[^>]*\/?>/gi;
const EVENT_HANDLER_ATTR = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URI_ATTR =
  /\s+(?:href|src|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi;

export function sanitizePortalHtml(html: string | null | undefined): string {
  if (!html) {
    return "";
  }
  return html
    .replace(DANGEROUS_BLOCK, "")
    .replace(DANGEROUS_VOID, "")
    .replace(EVENT_HANDLER_ATTR, "")
    .replace(JS_URI_ATTR, "");
}
