import { excludesAll, includesAll } from "./agent-ready-completion-audit-helpers";
import type {
  CompletionArtifactCheckAdder,
  CompletionAuditContext,
} from "./agent-ready-completion-audit-artifact-types";
import { aiCrawlerNames } from "./agent-ready-policy";

export function addCrawlerArtifactChecks(
  add: CompletionArtifactCheckAdder,
  context: CompletionAuditContext,
) {
  add(
    "maximum-visibility web robots policy exists",
    includesAll(context.webRobots, [
      "User-agent: *",
      "Allow: /",
      "Sitemap: https://amend.sh/sitemap.xml",
    ]) && excludesAll(context.webRobots, ["Disallow:", ...aiCrawlerNames]),
  );
  add(
    "maximum-visibility docs robots policy exists",
    includesAll(context.docsRobotsRoute, [
      "docsUrl",
      "User-agent: *",
      "Allow: /",
      "/sitemap.xml",
    ]) && excludesAll(context.docsRobotsRoute, ["Disallow:", ...aiCrawlerNames]),
  );
  add(
    "canonical web sitemap names public routes",
    includesAll(context.webSitemap, [
      "https://amend.sh/",
      "https://amend.sh/brand",
      "https://amend.sh/embed-demo",
      "https://amend.sh/portal/amend-labs",
      "<lastmod>",
      "<changefreq>",
      "<priority>",
    ]) && excludesAll(context.webSitemap, ["/dashboard", "/sign-in", "/sign-up", "/api/auth"]),
  );
  add(
    "canonical docs sitemap is generated from docs pages",
    includesAll(context.docsSitemapRoute, [
      "https://docs.amend.sh",
      "source.getPages()",
      "/schemas/agent-ready-production-report.schema.json",
      "/schemas/agent-ready-live-report.schema.json",
      "/schemas/agent-ready-status-report.schema.json",
      "/schemas/agent-ready-completion-audit-report.schema.json",
      "lastmod",
      "changefreq",
      "priority",
    ]),
  );
  add(
    "web llms.txt maps web and docs resources",
    includesAll(context.webLlms, [
      "https://amend.sh/",
      "https://amend.sh/brand",
      "https://amend.sh/embed-demo",
      "https://amend.sh/portal/amend-labs",
      "https://docs.amend.sh/docs",
      "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
      "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
      "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
    ]),
  );
}
