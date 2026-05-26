import { ChevronDown, Inbox } from "lucide-react";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { Board, Post, RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusTitle } from "@/components/amend-dashboard-utils";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";

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
        className={
          scopedPosts.length > 0
            ? "min-h-[calc(100svh-8.5rem)] overflow-hidden"
            : "grid min-h-[calc(100svh-8.5rem)] place-items-center"
        }
      >
        {scopedPosts.length > 0 ? (
          <div className="grid divide-y divide-white/[0.045]">
            {scopedPosts.map((post) => (
              <article
                key={post.id}
                className="group grid min-h-[4.5rem] gap-3 px-5 py-4 text-sm transition-colors duration-150 ease-linear hover:bg-foreground/[0.04] md:grid-cols-[4.25rem_minmax(0,1fr)_7rem_11rem_7rem] md:items-center md:px-6"
              >
                <span className="inline-flex items-center gap-2 text-muted-foreground tabular-nums">
                  <ChevronDown className="size-3 rotate-180" />
                  <span>{post.voters}</span>
                </span>
                <button
                  type="button"
                  className="min-w-0 text-left transition-colors duration-150 ease-linear hover:text-foreground active:opacity-75"
                  onClick={() => onOpenFeedback(post)}
                >
                  <span className="block truncate text-base font-semibold leading-6">
                    {post.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {post.source}
                  </span>
                </button>
                <p className="text-muted-foreground">{post.date}</p>
                <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-background/80 px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-white/[0.04]">
                  {activeBoard.icon}
                  {activeBoard.name}
                </span>
                <span className="w-fit rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.04]">
                  {statusTitle(post.status)}
                </span>
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
