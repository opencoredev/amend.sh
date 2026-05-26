import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";

import { PortalSkeleton } from "@/components/portal-list-elements";
import { PublicPortalView } from "@/components/public-portal-view";
import type { PortalData } from "@/components/public-portal-types";
import { canonicalLink, openGraphMeta } from "@/lib/seo";

export const Route = createFileRoute("/portal/$workspaceSlug")({
  head: ({ params }) => ({
    links: [canonicalLink(`/portal/${params.workspaceSlug}`)],
    meta: [
      {
        title: `${params.workspaceSlug} - Amend public portal`,
      },
      {
        name: "description",
        content: "Source-linked changelog, roadmap, and feedback portal powered by Amend.sh.",
      },
      ...openGraphMeta({
        description: "Source-linked changelog, roadmap, and feedback portal powered by Amend.sh.",
        path: `/portal/${params.workspaceSlug}`,
        title: `${params.workspaceSlug} - Amend public portal`,
      }),
    ],
  }),
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
