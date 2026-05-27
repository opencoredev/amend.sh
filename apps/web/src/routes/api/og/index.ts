import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/og/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        return Response.redirect(`${origin}/og-image.png`, 308);
      },
    },
  },
});
