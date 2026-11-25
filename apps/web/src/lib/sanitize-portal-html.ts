/**
 * Minimal, dependency-free sanitizer for changelog body HTML.
 *
 * Changelog bodies are authored by workspace owners in the dashboard composer (a
 * contentEditable that emits a small set of formatting tags: headings, lists,
 * blockquotes, links, `pre`, inline marks). They render on the *public* portal,
 * so before the markup reaches `dangerouslySetInnerHTML` the markup is rebuilt
 * from an allowlist: only known formatting tags and attributes survive, links
 * and images keep only http(s), mailto and relative URLs, and every other tag
 * is dropped while its text stays. The work is pure string manipulation so it
 * produces identical output on the server and the client — no hydration drift.
 */

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strike",
  "strong",
  "sub",
  "sup",
  "u",
  "ul",
]);
const VOID_TAGS = new Set(["br", "hr", "img"]);
// Dropped together with everything inside them.
const DROPPED_WITH_CONTENT = new Set([
  "form",
  "iframe",
  "math",
  "noembed",
  "noframes",
  "noscript",
  "object",
  "script",
  "select",
  "style",
  "svg",
  "template",
  "textarea",
  "title",
  "xmp",
]);
const GLOBAL_ATTRIBUTES = new Set(["class", "title"]);
const TAG_ATTRIBUTES: Record<string, ReadonlySet<string>> = {
  a: new Set(["href", "target"]),
  img: new Set(["alt", "height", "src", "width"]),
  ol: new Set(["start"]),
  pre: new Set(["data-language"]),
};
const URL_ATTRIBUTES = new Set(["href", "src"]);
const SAFE_URL_SCHEMES = new Set(["http", "https", "mailto"]);
const URL_SCHEME = /^([a-z][a-z0-9+.-]*):/i;
// Characters a browser ignores while reading a URL scheme.
const IGNORED_URL_CHARACTERS = /[\p{Cc}\s]/gu;
const TAG_NAME = /^[a-z][a-z0-9-]*/i;
const ATTRIBUTE_NAME = /^[^\s/>=]+/;
const WHITESPACE = /\s/;

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

function isSafeUrl(value: string): boolean {
  const scheme = URL_SCHEME.exec(
    decodeCharacterReferences(value).replace(IGNORED_URL_CHARACTERS, ""),
  );
  return !scheme || SAFE_URL_SCHEMES.has(scheme[1].toLowerCase());
}

function isAllowedAttribute(tag: string, name: string): boolean {
  return GLOBAL_ATTRIBUTES.has(name) || (TAG_ATTRIBUTES[tag]?.has(name) ?? false);
}

type ParsedTag = {
  name: string;
  closing: boolean;
  selfClosing: boolean;
  attributes: Array<[string, string]>;
  end: number;
};

/** Reads one tag starting at `start` (a `<`) the way a browser tokenizes it. */
function readTag(html: string, start: number): ParsedTag | null {
  let index = start + 1;
  const closing = html[index] === "/";
  if (closing) index++;
  const name = TAG_NAME.exec(html.slice(index))?.[0];
  if (!name) return null;
  index += name.length;
  const attributes: Array<[string, string]> = [];
  while (index < html.length) {
    const char = html[index];
    if (char === ">") {
      const selfClosing = html[index - 1] === "/";
      return { name: name.toLowerCase(), closing, selfClosing, attributes, end: index + 1 };
    }
    if (WHITESPACE.test(char) || char === "/") {
      index++;
      continue;
    }
    const attributeName = (ATTRIBUTE_NAME.exec(html.slice(index))?.[0] ?? char).toLowerCase();
    index += attributeName.length;
    while (WHITESPACE.test(html[index] ?? "")) index++;
    let value = "";
    if (html[index] === "=") {
      index++;
      while (WHITESPACE.test(html[index] ?? "")) index++;
      const quote = html[index];
      if (quote === '"' || quote === "'") {
        const close = html.indexOf(quote, index + 1);
        if (close === -1) return null;
        value = html.slice(index + 1, close);
        index = close + 1;
      } else {
        const unquoted = /^[^\s>]*/.exec(html.slice(index))?.[0] ?? "";
        value = unquoted;
        index += unquoted.length;
      }
    }
    attributes.push([attributeName, value]);
  }
  return null;
}

function renderTag(tag: ParsedTag): string {
  if (tag.closing) return VOID_TAGS.has(tag.name) ? "" : `</${tag.name}>`;
  const attributes = tag.attributes
    .filter(
      ([name, value]) =>
        isAllowedAttribute(tag.name, name) && (!URL_ATTRIBUTES.has(name) || isSafeUrl(value)),
    )
    .map(([name, value]) => ` ${name}="${value.replaceAll('"', "&quot;").replaceAll("<", "&lt;")}"`)
    .join("");
  // A link that opens a new tab never gets a handle back to the portal.
  const rel =
    tag.name === "a" && tag.attributes.some(([name]) => name === "target")
      ? ' rel="noopener noreferrer"'
      : "";
  return `<${tag.name}${attributes}${rel}>`;
}

/** Index just past the closing tag of a dropped element, or the end of the input. */
function skipElement(html: string, name: string, from: number): number {
  const close = new RegExp(`</${name}[\\s/>]`, "i").exec(html.slice(from));
  if (!close) return html.length;
  const end = html.indexOf(">", from + close.index);
  return end === -1 ? html.length : end + 1;
}

export function sanitizePortalHtml(html: string | null | undefined): string {
  if (!html) {
    return "";
  }
  let output = "";
  let index = 0;
  while (index < html.length) {
    const next = html.indexOf("<", index);
    if (next === -1) {
      output += html.slice(index);
      break;
    }
    output += html.slice(index, next);
    if (html.startsWith("<!--", next)) {
      const end = html.indexOf("-->", next + 4);
      index = end === -1 ? html.length : end + 3;
      continue;
    }
    if (html[next + 1] === "!" || html[next + 1] === "?") {
      const end = html.indexOf(">", next);
      index = end === -1 ? html.length : end + 1;
      continue;
    }
    const tag = readTag(html, next);
    if (!tag) {
      // A browser drops an unterminated tag together with the rest of the input.
      if (TAG_NAME.test(html.slice(next + 1))) break;
      if (html[next + 1] === "/") {
        const end = html.indexOf(">", next);
        index = end === -1 ? html.length : end + 1;
        continue;
      }
      output += "&lt;";
      index = next + 1;
      continue;
    }
    index = tag.end;
    // A self-closing tag has no content to skip; whatever follows is sanitized as usual.
    if (!tag.closing && !tag.selfClosing && DROPPED_WITH_CONTENT.has(tag.name)) {
      index = skipElement(html, tag.name, index);
      continue;
    }
    if (ALLOWED_TAGS.has(tag.name)) output += renderTag(tag);
  }
  return output;
}
