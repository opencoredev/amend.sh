import { createFileRoute } from "@tanstack/react-router";

import { generateOgPng } from "@/lib/og-image";

export const Route = createFileRoute("/api/og/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const origin = new URL(request.url).origin;
          const png = await generateOgPng({ type: "landing" }, origin);

          return new Response(new Blob([png as unknown as BlobPart], { type: "image/png" }), {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=604800, s-maxage=604800, immutable",
            },
          });
        } catch (error) {
          console.error("[og] landing image failed:", error);
          return new Response("OG image generation failed", { status: 500 });
        }
      },
    },
  },
});
