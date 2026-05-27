import { createFileRoute } from "@tanstack/react-router";

import { generateOgPng } from "@/lib/og-image";
import { getPublicPortalData } from "@/lib/public-portal-data";

export const Route = createFileRoute("/api/og/portal/$slug")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const origin = new URL(request.url).origin;

        try {
          const url = new URL(request.url);
          const portal = await getPublicPortalData(params.slug);
          const settings = portal.workspace.portalSettings;

          const workspaceName =
            url.searchParams.get("name") ?? portal.workspace.name ?? params.slug.replace(/-/g, " ");
          const description =
            url.searchParams.get("desc") ??
            settings?.intro ??
            portal.workspace.description ??
            settings?.headline ??
            undefined;
          const accentColor = url.searchParams.get("accent") ?? settings?.accentColor;
          const label = settings?.feedbackMode === "closed" ? "Roadmap · Updates" : "Feedback · Roadmap · Updates";

          const png = await generateOgPng(
            { type: "portal", workspaceName, description, accentColor, label },
            origin,
          );

          return new Response(new Blob([png as unknown as BlobPart], { type: "image/png" }), {
            headers: {
              "Content-Type": "image/png",
              // Portal data can change — cache for 1 day, revalidate in background
              "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
            },
          });
        } catch (error) {
          console.error(`[og] portal image failed for ${params.slug}:`, error);
          return Response.redirect(`${origin}/og-image.png`, 307);
        }
      },
    },
  },
});
