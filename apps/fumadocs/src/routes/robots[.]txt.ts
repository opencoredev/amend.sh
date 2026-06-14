import { createFileRoute } from "@tanstack/react-router";

import { docsUrl } from "@/lib/shared";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(`User-agent: *\nAllow: /\n\nSitemap: ${docsUrl}/sitemap.xml\n`, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    },
  },
});
