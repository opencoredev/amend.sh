import { ChevronRight, Inbox, Link2, Map, Megaphone, MessageSquare } from "@/lib/icons";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { Board, Post, RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusTitle } from "@/components/amend-dashboard-utils";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { StatusPill } from "@/components/status-pill";
import { VoteButton } from "@/components/vote-button";

function MetaDot() {
  return (
    <span aria-hidden className="text-muted-foreground/30">
      ·
    </span>
  );
}

/**
 * A single feedback request in the ranked list. Mirrors the roadmap card's
 * information density — a leading vote chip, a title with a one-line blurb, and a
 * meta line that surfaces where the request came from and whether it has already
 * reached the roadmap or shipped — but keeps the flat, scannable list shape that
 * suits a long, vote-ordered backlog.
 *
 * The whole row opens the post via a stretched button beneath the content (which
 * is `pointer-events-none`), so the entire surface is one large hit target. The
 * vote control re-enables pointer events and stops propagation, so upvoting never
 * also opens the detail view.
 */
function PostRow({
  post,
  onOpenFeedback,
  onVote,
}: {
  post: Post;
  onOpenFeedback: (post: Post) => void;
  onVote: (post: Post) => Promise<unknown>;
}) {
  const primarySource = post.sourceLinks[0];
  const visibleLabels = post.labels.slice(0, 2);
  const extraLabels = post.labels.length - visibleLabels.length;

  return (
    <article className="group relative grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-3 px-5 py-3.5 transition-colors duration-150 ease-out hover:bg-foreground/[0.04] md:gap-4 md:px-6">
      {/* Full-row click target. It sits beneath the pointer-events-none content, so
          a click anywhere on the row opens the post — except the vote control, which
          re-enables its own pointer events above this layer. */}
      <button
        type="button"
        aria-label={`Open feedback: ${post.title}`}
        onClick={() => onOpenFeedback(post)}
        className="absolute inset-0 rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amend-warm/60"
      />

      <div className="pointer-events-none relative z-10">
        <div className="pointer-events-auto inline-flex">
          <VoteButton
            count={post.voters}
            voted={post.hasVoted}
            onVote={() => onVote(post)}
            title={post.title}
          />
        </div>
      </div>

      <div className="pointer-events-none relative z-10 min-w-0">
        <h3 className="truncate text-[0.9rem] font-semibold leading-5 text-foreground/90 transition-colors duration-150 ease-out group-hover:text-foreground">
          {post.title}
        </h3>

        {post.body ? (
          <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">{post.body}</p>
        ) : null}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {primarySource ? (
              <Link2 className="size-3 shrink-0" />
            ) : (
              <MessageSquare className="size-3 shrink-0" />
            )}
            <span className="truncate">{post.source}</span>
          </span>

          {post.linkedRoadmapCount > 0 ? (
            <>
              <MetaDot />
              <span className="inline-flex items-center gap-1.5 text-foreground/70">
                <Map className="size-3 shrink-0" />
                On roadmap
              </span>
            </>
          ) : null}

          {post.linkedChangelogCount > 0 ? (
            <>
              <MetaDot />
              <span
                className="inline-flex items-center gap-1.5 text-foreground/70"
                aria-label={`Shipped in ${post.linkedChangelogCount} changelog ${post.linkedChangelogCount === 1 ? "update" : "updates"}`}
              >
                <Megaphone className="size-3 shrink-0" />
                Shipped
              </span>
            </>
          ) : null}

          {visibleLabels.length > 0 ? (
            <span className="flex flex-wrap items-center gap-1.5">
              {visibleLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground ring-1 ring-white/[0.06]"
                >
                  {label}
                </span>
              ))}
              {extraLabels > 0 ? (
                <span className="text-[0.68rem] tabular-nums text-muted-foreground/70">
                  +{extraLabels}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none relative z-10 flex shrink-0 items-start gap-2.5">
        <div className="flex flex-col items-end gap-1.5 pt-0.5">
          <StatusPill status={post.status} hideLabelOnMobile />
          <span className="text-[0.7rem] tabular-nums text-muted-foreground/60">{post.date}</span>
        </div>
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground/30 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100" />
      </div>
    </article>
  );
}

export function PostsWorkspace({
  activeBoard,
  activeStatus,
  onCreate,
  onOpenFeedback,
  onVote,
  posts: scopedPosts,
}: {
  activeBoard: Board;
  activeStatus: RoadmapStatus | "all";
  onCreate?: () => void;
  onOpenFeedback: (post: Post) => void;
  onVote: (post: Post) => Promise<unknown>;
  posts: Post[];
}) {
  const scopeLabel =
    activeStatus === "all"
      ? activeBoard.name.toLowerCase()
      : statusTitle(activeStatus).toLowerCase();

  return (
    <DashboardWorkspaceSurface>
      <div
        className={scopedPosts.length > 0 ? "min-h-0" : "grid min-h-0 flex-1 place-items-center"}
      >
        {scopedPosts.length > 0 ? (
          <div className="grid divide-y divide-white/[0.045]">
            {scopedPosts.map((post) => (
              <PostRow key={post.id} post={post} onOpenFeedback={onOpenFeedback} onVote={onVote} />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <EmptyModule
              action={onCreate ? "New feedback" : undefined}
              copy={`No ${scopeLabel} yet. Capture a request yourself, or let Amend surface one from your connected sources.`}
              icon={<Inbox />}
              onAction={onCreate}
              title="Start from real feedback"
            />
          </div>
        )}
      </div>
    </DashboardWorkspaceSurface>
  );
}
