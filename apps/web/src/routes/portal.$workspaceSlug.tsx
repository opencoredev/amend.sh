import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";

import { PortalSkeleton } from "@/components/portal-list-elements";
import { PublicPortalView } from "@/components/public-portal-view";
import type { PortalData } from "@/components/public-portal-types";
import { canonicalLink, openGraphMeta, siteUrl } from "@/lib/seo";

export const Route = createFileRoute("/portal/$workspaceSlug")({
  head: ({ params }) => {
    const displayName = params.workspaceSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const title = `${displayName} — Changelog, Roadmap & Feedback`;
    const description =
      "Source-linked changelog, roadmap, and feedback portal powered by Amend.sh.";
    const ogImageUrl = `${siteUrl}/api/og/portal/${params.workspaceSlug}`;

    return {
      links: [canonicalLink(`/portal/${params.workspaceSlug}`)],
      meta: [
        { title },
        { name: "description", content: description },
        ...openGraphMeta({
          description,
          image: ogImageUrl,
          path: `/portal/${params.workspaceSlug}`,
          title,
        }),
      ],
    };
  },
  component: PortalRoute,
});

const portalQuery = makeFunctionReference<"query">("amend:getPublicPortal");

function PortalRoute() {
  const { workspaceSlug } = Route.useParams();
  const portal = useQuery(portalQuery, { workspaceSlug }) as PortalData | undefined;

  if (!portal) {
    return <PortalSkeleton workspaceSlug={workspaceSlug} />;
  }

  return <PublicPortalView portal={portal} workspaceSlug={workspaceSlug} />;
}
