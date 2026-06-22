import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";

import { PublicPortalView } from "@/components/public-portal-view";
import { PortalSkeleton } from "@/components/public-portal-shared";
import type { PortalData, PortalSearch } from "@/components/public-portal-types";
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
  validateSearch: (search: Record<string, unknown>): PortalSearch => {
    const next: PortalSearch = {};
    if (search.view === "roadmap" || search.view === "changelog") {
      next.view = search.view;
    }
    if (typeof search.post === "string") {
      next.post = search.post;
    }
    if (typeof search.entry === "string") {
      next.entry = search.entry;
    }
    return next;
  },
  component: PortalRoute,
});

const portalQuery = makeFunctionReference<"query">("amend:getPublicPortal");

function PortalRoute() {
  const { workspaceSlug } = Route.useParams();
  const search = Route.useSearch();
  const portal = useQuery(portalQuery, { workspaceSlug }) as PortalData | undefined;

  if (!portal) {
    return <PortalSkeleton workspaceSlug={workspaceSlug} />;
  }

  return <PublicPortalView portal={portal} search={search} workspaceSlug={workspaceSlug} />;
}
