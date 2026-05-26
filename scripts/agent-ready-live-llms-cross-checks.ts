import {
  duplicateValues,
  extractMarkdownLinks,
  extractSitemapLocs,
} from "./agent-ready-live-parsing";
import { fetchText } from "./agent-ready-live-fetch-client";
import type { AddCheck } from "./agent-ready-live-types";

export async function checkLlmsLinksAgainstSitemaps({
  add,
  docsOrigin,
  webOrigin,
}: {
  add: AddCheck;
  docsOrigin: string;
  webOrigin: string;
}) {
  try {
    const [webLlms, webSitemap, docsLlms, docsSitemap] = await Promise.all([
      fetchText(`${webOrigin}/llms.txt`),
      fetchText(`${webOrigin}/sitemap.xml`),
      fetchText(`${docsOrigin}/llms.txt`),
      fetchText(`${docsOrigin}/sitemap.xml`),
    ]);
    const webLlmsLinks = extractMarkdownLinks(webLlms.body);
    const docsLlmsLinks = extractMarkdownLinks(docsLlms.body);
    const webSitemapLocs = extractSitemapLocs(webSitemap.body);
    const docsSitemapLocs = extractSitemapLocs(docsSitemap.body);
    const webLlmsDuplicateLinks = duplicateValues(webLlmsLinks);
    const docsLlmsDuplicateLinks = duplicateValues(docsLlmsLinks);

    add(
      "web /llms.txt has Markdown links",
      webLlmsLinks.length > 0,
      `${webLlmsLinks.length} links`,
    );
    add(
      "web /llms.txt has no duplicate links",
      webLlmsDuplicateLinks.length === 0,
      webLlmsDuplicateLinks.join(", ") || "none",
    );
    add(
      "web /llms.txt links stay on web or docs origins",
      webLlmsLinks.every((link) => link.startsWith(webOrigin) || link.startsWith(docsOrigin)),
    );
    add(
      "web /llms.txt web links appear in web sitemap",
      webLlmsLinks
        .filter((link) => link.startsWith(webOrigin))
        .every((link) => webSitemapLocs.includes(link)),
    );
    add(
      "web /llms.txt docs links appear in docs sitemap",
      webLlmsLinks
        .filter((link) => link.startsWith(docsOrigin))
        .every((link) => docsSitemapLocs.includes(link)),
    );
    add(
      "docs /llms.txt has no duplicate links",
      docsLlmsDuplicateLinks.length === 0,
      docsLlmsDuplicateLinks.join(", ") || "none",
    );
    add(
      "docs /llms.txt relative links appear in docs sitemap",
      docsLlmsLinks.length > 0 &&
        docsLlmsLinks.every((link) => docsSitemapLocs.includes(`${docsOrigin}${link}`)),
      `${docsLlmsLinks.length} links`,
    );
  } catch (error) {
    add(
      "llms links cross-check fetches",
      false,
      error instanceof Error ? error.message : "unknown fetch error",
    );
  }
}
