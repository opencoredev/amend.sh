import { ConvexError, v } from "convex/values";

import { enrichWithModel } from "./projectWebsiteEnrichment";
import {
  extractDescription,
  extractLogoUrl,
  extractPageText,
  extractTitle,
  readHomepage,
} from "./projectWebsiteMetadata";
import { normalizeUrl, slugify } from "./projectWebsiteUrl";

export { slugify };

export const projectSuggestion = v.object({
  description: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  name: v.string(),
  slug: v.string(),
  websiteUrl: v.string(),
});

export async function suggestProjectFromWebsite(input: string) {
  const websiteUrl = normalizeUrl(input);
  const host = new URL(websiteUrl).hostname.replace(/^www\./, "");
  const { html, reachable } = await readHomepage(websiteUrl);
  if (!reachable) {
    throw new ConvexError({
      code: "INVALID_WEBSITE",
      message: "We could not verify that domain. Check the URL and try again.",
    });
  }

  const name = extractTitle(html) ?? host.split(".")[0] ?? "Project";
  const description = extractDescription(html);
  const logoUrl = extractLogoUrl(html, websiteUrl);
  const pageText = extractPageText(html);
  const suggestion = await enrichWithModel({
    description,
    host,
    name,
    pageText,
    websiteUrl,
  });

  return {
    ...suggestion,
    logoUrl,
  };
}
