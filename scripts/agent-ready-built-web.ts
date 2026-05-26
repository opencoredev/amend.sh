import { aiCrawlerNames } from "./agent-ready-policy";
import {
  add,
  excludesAll,
  extractMarkdownLinks,
  extractSitemapLocs,
  hasNoDuplicateValues,
  includesAll,
  locsStayOnOrigin,
  read,
  readBundleContaining,
  webPublicPages,
} from "./agent-ready-built-utils";

export async function checkBuiltWebArtifacts() {
  const webRobots = await read("apps/web/dist/client/robots.txt");
  const webSitemap = await read("apps/web/dist/client/sitemap.xml");
  const webLlms = await read("apps/web/dist/client/llms.txt");
  const webSitemapLocs = extractSitemapLocs(webSitemap);
  const webLlmsLinks = extractMarkdownLinks(webLlms);
  const webSeoBundle = await readBundleContaining(
    "apps/web/dist/server/assets",
    "SoftwareApplication",
  );
  const webRouterBundle = await readBundleContaining(
    "apps/web/dist/server/assets",
    'canonicalLink("/")',
  );

  add(
    "built web robots keeps maximum-visibility policy",
    includesAll(webRobots, [
      "User-agent: *",
      "Allow: /",
      "Sitemap: https://amend.sh/sitemap.xml",
    ]) && excludesAll(webRobots, ["Disallow:", ...aiCrawlerNames]),
  );

  add(
    "built web sitemap includes public canonical routes only",
    includesAll(webSitemap, [
      "<loc>https://amend.sh/</loc>",
      "<loc>https://amend.sh/brand</loc>",
      "<loc>https://amend.sh/embed-demo</loc>",
      "<loc>https://amend.sh/portal/amend-labs</loc>",
      "<lastmod>",
      "<changefreq>",
      "<priority>",
    ]) &&
      excludesAll(webSitemap, [
        "https://amend.sh/dashboard",
        "https://amend.sh/sign-in",
        "https://amend.sh/sign-up",
        "https://amend.sh/api/auth",
      ]),
  );

  add(
    "built web sitemap has unique on-origin locs",
    webSitemapLocs.length > 0 &&
      hasNoDuplicateValues(webSitemapLocs) &&
      locsStayOnOrigin(webSitemapLocs, "https://amend.sh"),
    `${webSitemapLocs.length} locs`,
  );

  add(
    "built web llms.txt points to web and docs public resources",
    includesAll(webLlms, [
      "https://amend.sh/",
      "https://amend.sh/brand",
      "https://amend.sh/embed-demo",
      "https://amend.sh/portal/amend-labs",
      "https://docs.amend.sh",
      "https://docs.amend.sh/docs",
      "https://docs.amend.sh/docs/quickstart",
      "Authenticated dashboard pages and API/auth routes",
      "not a guarantee of AI search inclusion",
    ]),
  );

  add(
    "built web llms.txt links are unique and on allowed origins",
    webLlmsLinks.length > 0 &&
      hasNoDuplicateValues(webLlmsLinks) &&
      webLlmsLinks.every(
        (link) => link.startsWith("https://amend.sh") || link.startsWith("https://docs.amend.sh"),
      ),
    `${webLlmsLinks.length} links`,
  );

  add(
    "built web llms.txt web links appear in web sitemap",
    webLlmsLinks
      .filter((link) => link.startsWith("https://amend.sh"))
      .every((link) => webSitemapLocs.includes(link)),
  );

  add(
    "built web server bundle preserves metadata helpers and JSON-LD",
    includesAll(webSeoBundle, [
      "canonicalLink",
      "og:url",
      "twitter:card",
      "noindex, nofollow",
      "SoftwareApplication",
      "Organization",
    ]) && includesAll(webRouterBundle, ['canonicalLink("/")', 'canonicalLink("/brand")']),
  );

  for (const page of webPublicPages) {
    const bundle = await readBundleContaining("apps/web/dist/server/assets", page.marker);
    add(
      `built web route bundle exposes crawlable copy for ${page.path}`,
      includesAll(bundle, page.copy) && !bundle.includes("noindex, nofollow"),
    );
  }

  return {
    webLlmsLinks,
  };
}
