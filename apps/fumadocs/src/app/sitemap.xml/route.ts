import { source } from "@/lib/source";

const docsUrl = "https://docs.amend.sh";
const lastModified = new Date("2026-05-13T00:00:00.000Z").toISOString();

export const revalidate = false;

export function GET() {
  const urlsByLoc = new Map(
    [
      { loc: docsUrl, priority: "0.8" },
      { loc: `${docsUrl}/docs`, priority: "1.0" },
      {
        loc: `${docsUrl}/schemas/agent-ready-production-report.schema.json`,
        priority: "0.4",
      },
      {
        loc: `${docsUrl}/schemas/agent-ready-live-report.schema.json`,
        priority: "0.4",
      },
      {
        loc: `${docsUrl}/schemas/agent-ready-status-report.schema.json`,
        priority: "0.4",
      },
      {
        loc: `${docsUrl}/schemas/agent-ready-completion-audit-report.schema.json`,
        priority: "0.4",
      },
      ...source.getPages().map((page) => ({
        loc: `${docsUrl}${page.url}`,
        priority: page.url === "/docs" ? "1.0" : "0.7",
      })),
    ].map((url) => [url.loc, url]),
  );
  const urls = Array.from(urlsByLoc.values());

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return character;
    }
  });
}
