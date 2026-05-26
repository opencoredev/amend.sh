export function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function extractSitemapLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) =>
    decodeHtml(match[1].trim()),
  );
}

export function extractMarkdownLinks(markdown: string) {
  return Array.from(markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g), (match) =>
    decodeHtml(match[1].trim()),
  );
}

export function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return Array.from(duplicates);
}

export function extractJsonLdTypes(html: string) {
  const matches = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const types: string[] = [];
  for (const match of matches) {
    try {
      types.push(...collectJsonLdTypes(JSON.parse(decodeHtml(match[1].trim()))));
    } catch {
      types.push("__INVALID_JSON_LD__");
    }
  }
  return types;
}

function collectJsonLdTypes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectJsonLdTypes);
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  const ownTypes = Array.isArray(record["@type"])
    ? record["@type"].filter((type): type is string => typeof type === "string")
    : typeof record["@type"] === "string"
      ? [record["@type"]]
      : [];
  const graphTypes = collectJsonLdTypes(record["@graph"]);
  return [...ownTypes, ...graphTypes];
}
