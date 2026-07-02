export function extractTitle(html: string) {
  const ogTitle = findMetaContent(html, ["og:title", "twitter:title", "application-name"]);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  return cleanMetadata(ogTitle ?? title);
}

export function extractDescription(html: string) {
  return findMetaContent(html, ["og:description", "twitter:description", "description"]);
}

export function extractPageText(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  ).slice(0, 4_000);
}

export function extractLogoUrl(html: string, websiteUrl: string) {
  const href = findIconHref(html) ?? findMetaContent(html, ["og:image", "twitter:image"]);
  if (!href) return fallbackFaviconUrl(websiteUrl);
  try {
    return new URL(href, websiteUrl).toString();
  } catch {
    return fallbackFaviconUrl(websiteUrl);
  }
}

export async function readHomepage(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Amend project setup (+https://amend.sh)",
      },
    });
    const html = response.status < 500 ? await response.text() : "";
    return {
      html: html.slice(0, 16_000),
      reachable: response.status < 500,
    };
  } catch {
    return {
      html: "",
      reachable: false,
    };
  }
}

function cleanMetadata(value?: string) {
  return value ? decodeHtml(value).replace(/\s+/g, " ").trim() : undefined;
}

function readHtmlAttribute(tag: string, name: string) {
  const pattern = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
  return tag.match(pattern)?.[1];
}

function findMetaContent(html: string, names: string[]) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const key = (readHtmlAttribute(tag, "property") ?? readHtmlAttribute(tag, "name"))
      ?.toLowerCase()
      .trim();
    if (!key || !wanted.has(key)) continue;
    const content = readHtmlAttribute(tag, "content");
    if (content) return cleanMetadata(content);
  }
  return undefined;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function findIconHref(html: string) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const rel = readHtmlAttribute(tag, "rel")?.toLowerCase() ?? "";
    if (!rel.includes("icon")) continue;
    const href = readHtmlAttribute(tag, "href");
    if (href) return cleanMetadata(href);
  }
  return undefined;
}

function fallbackFaviconUrl(websiteUrl: string) {
  try {
    const host = new URL(websiteUrl).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return undefined;
  }
}
