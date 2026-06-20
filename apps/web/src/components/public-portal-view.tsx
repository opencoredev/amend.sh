import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PortalChangelogDetail, PortalChangelogView } from "@/components/public-portal-changelog";
import { PortalComposeDialog } from "@/components/public-portal-compose";
import { PortalFeedbackDetail, PortalFeedbackView } from "@/components/public-portal-feedback";
import { PortalRoadmapView } from "@/components/public-portal-roadmap";
import { PortalTopNav } from "@/components/public-portal-topnav";
import type { PortalData, PortalSearch, PortalView } from "@/components/public-portal-types";
import { normalizePortalView } from "@/components/public-portal-types";
import { changelogJsonLd } from "@/lib/seo";

export function PublicPortalView({
  portal,
  search,
  workspaceSlug,
}: {
  portal: PortalData;
  search: PortalSearch;
  workspaceSlug: string;
}) {
  const navigate = useNavigate();
  const [composeOpen, setComposeOpen] = useState(false);

  const settings = portal.workspace.portalSettings;
  const roadmap = settings?.roadmapVisibility === "private" ? [] : portal.roadmap;
  const changelog = settings?.changelogVisibility === "private" ? [] : portal.changelog;
  const feedback = settings?.feedbackMode === "closed" ? [] : portal.feedback;
  const feedbackMode = settings?.feedbackMode ?? "open";
  const view = normalizePortalView(search.view);

  // One-shot: honor a #roadmap / #updates / #feedback hash (post-sign-in redirect
  // + legacy deep links) → the matching tab, then drop the hash.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.location.hash.replace(/^#/, "");
    const mapped: PortalView | null =
      raw === "roadmap"
        ? "roadmap"
        : raw === "updates"
          ? "changelog"
          : raw === "feedback"
            ? "feedback"
            : null;
    if (!mapped) {
      return;
    }
    void navigate({
      hash: "",
      params: { workspaceSlug },
      replace: true,
      search: mapped === "feedback" ? {} : { view: mapped },
      to: "/portal/$workspaceSlug",
    });
  }, [navigate, workspaceSlug]);

  const setSearch = (next: PortalSearch) =>
    void navigate({ params: { workspaceSlug }, search: next, to: "/portal/$workspaceSlug" });

  const activePost = search.post
    ? feedback.find((item) => item.stableKey === search.post)
    : undefined;
  const activeEntry = search.entry
    ? changelog.find((item) => item.stableKey === search.entry)
    : undefined;
  const activeView: PortalView = activeEntry ? "changelog" : activePost ? "feedback" : view;

  return (
    <div className="min-h-svh bg-background font-ui text-13 text-default antialiased">
      {changelog.length > 0 ? (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": changelogJsonLd(changelog, workspaceSlug),
            }),
          }}
        />
      ) : null}

      <PortalTopNav
        activeView={activeView}
        onCompose={() => setComposeOpen(true)}
        workspace={portal.workspace}
      />

      <main
        key={`${activeView}:${activePost?.stableKey ?? activeEntry?.stableKey ?? "list"}`}
        className="amend-page-enter mx-auto max-w-7xl px-4 pb-16 sm:px-6"
      >
        {activePost ? (
          <PortalFeedbackDetail
            post={activePost}
            workspaceSlug={workspaceSlug}
            onBack={() => setSearch({})}
          />
        ) : activeEntry ? (
          <PortalChangelogDetail
            entry={activeEntry}
            onBack={() => setSearch({ view: "changelog" })}
          />
        ) : view === "roadmap" ? (
          <PortalRoadmapView roadmap={roadmap} />
        ) : view === "changelog" ? (
          <PortalChangelogView
            changelog={changelog}
            onOpenEntry={(stableKey) => setSearch({ entry: stableKey, view: "changelog" })}
          />
        ) : (
          <PortalFeedbackView
            feedback={feedback}
            workspaceSlug={workspaceSlug}
            onOpenPost={(stableKey) => setSearch({ post: stableKey })}
          />
        )}
      </main>

      <PortalComposeDialog
        feedbackMode={feedbackMode}
        open={composeOpen}
        workspaceSlug={workspaceSlug}
        onClose={() => setComposeOpen(false)}
      />
    </div>
  );
}
