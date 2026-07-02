import { api } from "@amend/backend/convex/_generated/api";
import { cn } from "@amend/ui/lib/utils";
import { useMutation } from "convex/react";
import type { ReactNode } from "react";

import { usePortalVoter } from "@/lib/use-portal-voter";
import { sanitizePortalHtml } from "@/lib/sanitize-portal-html";

/**
 * Public portal primitives. The portal shares the dashboard's dark shadcn theme
 * — same tokens, same raised `--workspace-surface-*` panel, same gold VoteButton
 * and StatusPill (imported directly from the dashboard) — so it reads as the same
 * product. The portal chrome is a slim top bar (not the app sidebar), and the
 * content fills the width.
 */

/** The dashboard's raised surface, but content-height (the page scrolls) rather
 *  than the app shell's fixed-height internal scroll. */
export function PortalSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[var(--workspace-surface-background)] shadow-[var(--workspace-surface-shadow)] ring-1 ring-[color:var(--workspace-surface-ring)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Shared feedback-vote wiring: anonymous voter id + the public toggle mutation. */
export function useFeedbackVote(workspaceSlug: string) {
  const voter = usePortalVoter(workspaceSlug);
  const recordInteraction = useMutation(api.amend.recordFeedbackInteraction);
  const vote = async (stableKey: string) => {
    const next = !voter.hasVoted(stableKey);
    await recordInteraction({
      externalUserId: voter.voterId,
      feedbackKey: stableKey,
      kind: "vote",
      workspaceSlug,
    });
    voter.remember(stableKey, next);
  };
  return { vote, voter };
}

export function formatPortalDate(value?: number) {
  if (!value) {
    return "Recently";
  }
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export function changelogCategoryLabel(category: string) {
  return category
    .split(/[\s_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Rendered changelog body — sanitized owner HTML in the shared composer styles. */
export function PortalProse({ className, html }: { className?: string; html: string }) {
  return (
    <div
      className={cn("amend-composer-editor text-[0.95rem] leading-7 text-foreground/90", className)}
      // Sanitized via sanitize-portal-html.ts before injection.
      dangerouslySetInnerHTML={{ __html: sanitizePortalHtml(html) }}
    />
  );
}

/** Loading silhouette — top bar + a single wide surface, dark. */
export function PortalSkeleton({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div className="min-h-svh bg-background font-ui text-13 text-default antialiased">
      <div className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <div className="size-7 animate-pulse rounded-lg bg-foreground/[0.08]" />
          <div className="h-4 w-32 animate-pulse rounded bg-foreground/[0.06]" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <span className="sr-only">Loading {workspaceSlug}</span>
        <div className="h-7 w-40 animate-pulse rounded bg-foreground/[0.07]" />
        <PortalSurface className="mt-4 divide-y divide-white/[0.045]">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center gap-4 px-5 py-4">
              <div className="size-11 animate-pulse rounded-xl bg-foreground/[0.05]" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-1/2 animate-pulse rounded bg-foreground/[0.06]" />
                <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-foreground/[0.04]" />
              </div>
            </div>
          ))}
        </PortalSurface>
      </div>
    </div>
  );
}
