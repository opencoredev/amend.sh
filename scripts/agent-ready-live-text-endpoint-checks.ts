import {
  duplicateValues,
  extractJsonLdTypes,
  extractSitemapLocs,
} from "./agent-ready-live-parsing";
import type { AddCheck, TextEndpointOptions } from "./agent-ready-live-types";
import { fetchText } from "./agent-ready-live-fetch-client";

export async function checkTextEndpoint({
  add,
  allowIndexing = false,
  contentTypes,
  excludes = [],
  includes,
  label,
  path,
  parseJsonObject = false,
  origin,
  structuredDataTypes = [],
}: TextEndpointOptions & { add: AddCheck }) {
  const url = `${origin}${path}`;
  try {
    const { body, response } = await fetchText(url);
    add(`${label} ${path} returns 2xx`, response.ok, `${response.status} ${response.statusText}`);
    const finalUrl = new URL(response.url);
    add(
      `${label} ${path} stays on expected origin`,
      finalUrl.origin === origin,
      finalUrl.toString(),
    );
    if (contentTypes) {
      const contentType = response.headers.get("content-type") ?? "";
      add(
        `${label} ${path} content-type`,
        contentTypes.some((expected) => contentType.includes(expected)),
        contentType || "missing content-type",
      );
    }
    if (allowIndexing) {
      const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
      add(
        `${label} ${path} x-robots-tag allows indexing`,
        !/\b(?:noindex|none)\b/i.test(xRobotsTag),
        xRobotsTag || "not set",
      );
    }
    for (const expected of includes) {
      add(`${label} ${path} includes ${expected}`, body.includes(expected));
    }
    for (const unexpected of excludes) {
      add(`${label} ${path} excludes ${unexpected}`, !body.includes(unexpected));
    }
    checkJsonObject({ add, body, label, parseJsonObject, path });
    checkSitemap({ add, body, label, origin, path });
    checkStructuredData({ add, body, label, path, structuredDataTypes });
  } catch (error) {
    add(
      `${label} ${path} fetches`,
      false,
      error instanceof Error ? error.message : "unknown fetch error",
    );
  }
}

function checkJsonObject({
  add,
  body,
  label,
  parseJsonObject,
  path,
}: {
  add: AddCheck;
  body: string;
  label: string;
  parseJsonObject: boolean;
  path: string;
}) {
  if (!parseJsonObject) return;

  try {
    const parsed = JSON.parse(body);
    add(
      `${label} ${path} is parseable JSON object`,
      Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed)),
    );
  } catch (error) {
    add(
      `${label} ${path} is parseable JSON object`,
      false,
      error instanceof Error ? error.message : "invalid JSON",
    );
  }
}

function checkSitemap({
  add,
  body,
  label,
  origin,
  path,
}: {
  add: AddCheck;
  body: string;
  label: string;
  origin: string;
  path: string;
}) {
  if (path !== "/sitemap.xml") return;

  const locs = extractSitemapLocs(body);
  const duplicates = duplicateValues(locs);
  add(`${label} ${path} has sitemap loc entries`, locs.length > 0, `${locs.length} locs`);
  add(
    `${label} ${path} has no duplicate sitemap locs`,
    duplicates.length === 0,
    duplicates.join(", ") || "none",
  );
  add(
    `${label} ${path} sitemap locs stay on expected origin`,
    locs.every((loc) => loc === origin || loc.startsWith(`${origin}/`)),
  );
}

function checkStructuredData({
  add,
  body,
  label,
  path,
  structuredDataTypes,
}: {
  add: AddCheck;
  body: string;
  label: string;
  path: string;
  structuredDataTypes: string[];
}) {
  if (structuredDataTypes.length === 0) return;

  const actualTypes = extractJsonLdTypes(body);
  add(
    `${label} ${path} has valid JSON-LD`,
    actualTypes.length > 0 && !actualTypes.includes("__INVALID_JSON_LD__"),
    actualTypes.join(", ") || "none",
  );
  for (const expectedType of structuredDataTypes) {
    add(
      `${label} ${path} JSON-LD includes ${expectedType}`,
      actualTypes.includes(expectedType),
      actualTypes.join(", ") || "none",
    );
  }
}
