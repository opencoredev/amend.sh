import { includesAll } from "./agent-ready-completion-audit-helpers";
import type {
  CompletionArtifactCheckAdder,
  CompletionAuditContext,
} from "./agent-ready-completion-audit-artifact-types";

export function addDocsArtifactChecks(
  add: CompletionArtifactCheckAdder,
  context: CompletionAuditContext,
) {
  add(
    "docs llms resources and Markdown mirrors exist",
    includesAll(context.docsLlmsRoute, [
      "llms(source)",
      "Agent-ready production report JSON Schema",
      "Agent-ready live report JSON Schema",
      "Agent-ready status report JSON Schema",
      "Agent-ready completion audit report JSON Schema",
    ]) &&
      context.docsLlmsRoute.includes("/schemas/agent-ready-production-report.schema.json") &&
      context.docsLlmsRoute.includes("/schemas/agent-ready-live-report.schema.json") &&
      context.docsLlmsRoute.includes("/schemas/agent-ready-status-report.schema.json") &&
      context.docsLlmsRoute.includes("/schemas/agent-ready-completion-audit-report.schema.json") &&
      includesAll(context.docsLlmsFullRoute, ["source.getPages()", "getLLMText"]) &&
      context.docsMarkdownRoute.includes("text/markdown"),
  );
  add(
    "canonical and social metadata are wired for web and docs",
    includesAll(context.webSeo, ["canonicalLink", "openGraphMeta", "twitter:card"]) &&
      [
        context.webIndexRoute,
        context.webBrandRoute,
        context.webEmbedDemoRoute,
        context.webPortalRoute,
      ].every((route) => route.includes("canonicalLink")) &&
      includesAll(context.docsLayoutRoute, [
        "metadataBase",
        "https://docs.amend.sh",
        "openGraph",
      ]) &&
      includesAll(context.docsHomeRoute, ["canonical", "openGraph"]) &&
      includesAll(context.docsPageRoute, ["canonical", "openGraph"]),
  );
  add(
    "structured data is wired for web and docs",
    includesAll(context.webSeo, ["SoftwareApplication", "Organization"]) &&
      context.webIndexRoute.includes("application/ld+json") &&
      includesAll(context.docsHomeRoute, ['"@type": "WebSite"', '"@type": "Organization"']) &&
      context.docsPageRoute.includes('"@type": "TechArticle"'),
  );
}
