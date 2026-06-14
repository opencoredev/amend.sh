import { cn } from "@amend/ui/lib/utils";

import { ChevronUp, Inbox } from "@/lib/icons";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { Board, Post, RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusTitle } from "@/components/amend-dashboard-utils";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";

function statusDotColor(status: RoadmapStatus) {
  switch (status) {
    case "next":
      return "bg-blue-400";
    case "progress":
      return "bg-violet-400";
    case "done":
      return "bg-emerald-400";
    default:
      return "bg-amber-400";
  }
}

export function PostsWorkspace({
  activeBoard,
  activeStatus,
  onOpenFeedback,
  posts: scopedPosts,
}: {
  activeBoard: Board;
  activeStatus: RoadmapStatus | "all";
  onOpenFeedback: (post: Post) => void;
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
              <article
                key={post.id}
                className="group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 text-sm transition-colors duration-150 ease-linear hover:bg-foreground/[0.04] md:gap-4 md:px-6"
              >
                <button
                  type="button"
                  className="flex flex-col items-center justify-center rounded-lg bg-white/[0.03] py-1.5 ring-1 ring-white/[0.06] transition-colors duration-150 ease-linear hover:bg-white/[0.06] active:opacity-75"
                  onClick={() => onOpenFeedback(post)}
                  aria-label={`${post.voters} votes`}
                >
                  <ChevronUp className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold tabular-nums">{post.voters}</span>
                </button>
                <button
                  type="button"
                  className="min-w-0 text-left transition-colors duration-150 ease-linear active:opacity-75"
                  onClick={() => onOpenFeedback(post)}
                >
                  <span className="block truncate text-[0.9rem] font-semibold leading-5 transition-colors group-hover:text-foreground">
                    {post.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {post.source}
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-3 md:gap-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span className={cn("size-1.5 rounded-full", statusDotColor(post.status))} />
                    <span className="hidden sm:inline">{statusTitle(post.status)}</span>
                  </span>
                  <span className="w-16 text-right text-xs tabular-nums text-muted-foreground/70">
                    {post.date}
                  </span>
                </div>
              </article>
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
