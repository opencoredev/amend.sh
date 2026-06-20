import { Inbox } from "@/lib/icons";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { Board, Post, RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusTitle } from "@/components/amend-dashboard-utils";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { StatusPill } from "@/components/status-pill";
import { VoteButton } from "@/components/vote-button";

function PostRow({
  post,
  onOpenFeedback,
  onVote,
}: {
  post: Post;
  onOpenFeedback: (post: Post) => void;
  onVote: (post: Post) => Promise<unknown>;
}) {
  return (
    <article className="group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 text-sm transition-colors duration-150 ease-linear hover:bg-foreground/[0.04] md:gap-4 md:px-6">
      <VoteButton
        count={post.voters}
        voted={post.hasVoted}
        onVote={() => onVote(post)}
        title={post.title}
      />
      <button
        type="button"
        className="min-w-0 text-left transition-colors duration-150 ease-linear active:opacity-75"
        onClick={() => onOpenFeedback(post)}
      >
        <span className="block truncate text-[0.9rem] font-semibold leading-5 transition-colors group-hover:text-foreground">
          {post.title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{post.source}</span>
      </button>
      <div className="flex shrink-0 items-center gap-3 md:gap-4">
        <StatusPill status={post.status} hideLabelOnMobile />
        <span className="w-14 text-right text-xs tabular-nums text-muted-foreground/70">
          {post.date}
        </span>
      </div>
    </article>
  );
}

export function PostsWorkspace({
  activeBoard,
  activeStatus,
  onOpenFeedback,
  onVote,
  posts: scopedPosts,
}: {
  activeBoard: Board;
  activeStatus: RoadmapStatus | "all";
  onOpenFeedback: (post: Post) => void;
  onVote: (post: Post) => Promise<unknown>;
  posts: Post[];
}) {
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
              copy={`No ${activeStatus === "all" ? activeBoard.name.toLowerCase() : statusTitle(activeStatus).toLowerCase()} yet.`}
              icon={<Inbox />}
              title="Start from real feedback"
            />
          </div>
        )}
      </div>
    </DashboardWorkspaceSurface>
  );
}
