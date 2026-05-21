const docsUrl = "https://docs.amend.sh";

export const revalidate = false;

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${docsUrl}/sitemap.xml\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
