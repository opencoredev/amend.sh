import type { BuiltDocsArtifacts } from "./agent-ready-built-docs-artifacts";
import {
  add,
  docsPages,
  hasNoDuplicateValues,
  includesAll,
  read,
  readMeta,
  metaHasContentType,
} from "./agent-ready-built-utils";

type BuiltDocsPageCheckArgs = {
  artifacts: BuiltDocsArtifacts;
  docsLlmsLinks: string[];
  docsSitemapLocs: string[];
  webLlmsLinks: string[];
};

export async function checkBuiltDocsPageArtifacts({
  artifacts,
  docsLlmsLinks,
  docsSitemapLocs,
  webLlmsLinks,
}: BuiltDocsPageCheckArgs) {
  add(
    "built web llms.txt docs links appear in docs sitemap",
    webLlmsLinks
      .filter((link) => link.startsWith("https://docs.amend.sh"))
      .every((link) => docsSitemapLocs.includes(link)),
  );

  add(
    "built docs llms.txt links are unique and represented in docs sitemap",
    docsLlmsLinks.length > 0 &&
      hasNoDuplicateValues(docsLlmsLinks) &&
      docsLlmsLinks.every((link) => docsSitemapLocs.includes(`https://docs.amend.sh${link}`)),
    `${docsLlmsLinks.length} links`,
  );

  add(
    "built docs landing has canonical metadata, crawlable copy, and WebSite JSON-LD",
    includesAll(artifacts.docsHome, [
      'rel="canonical" href="https://docs.amend.sh"',
      'property="og:url" content="https://docs.amend.sh"',
      '"@type":"WebSite"',
      '"@type":"Organization"',
      "Source-linked product updates",
    ]) && !artifacts.docsHome.includes("noindex"),
  );

  for (const page of docsPages) {
    const [html, markdown, markdownMeta] = await Promise.all([
      read(page.html),
      read(page.markdown),
      readMeta(page.markdown.replace(/\.body$/, ".meta")),
    ]);
    add(
      `built docs HTML exposes ${page.path}`,
      includesAll(html, [
        `rel="canonical" href="https://docs.amend.sh${page.path}"`,
        `property="og:url" content="https://docs.amend.sh${page.path}"`,
        '"@type":"TechArticle"',
        page.copy,
      ]) && !html.includes("noindex"),
    );
    add(
      `built docs Markdown mirror exposes ${page.path}`,
      includesAll(markdown, [page.markdownCopy, `(${page.path})`]) && !markdown.includes("noindex"),
    );
    add(
      `built docs Markdown mirror has text/markdown metadata for ${page.path}`,
      metaHasContentType(markdownMeta, "text/markdown"),
    );
  }
}
