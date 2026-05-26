import { ChevronDown, Inbox } from "lucide-react";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { Board, Post, RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusTitle } from "@/components/amend-dashboard-utils";

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
    <div className="t-panel-slide min-h-[calc(100svh-5.5rem)] bg-card/40" data-open="true">
      <div className="divide-y divide-border border-b border-border">
        {scopedPosts.length > 0 ? (
          scopedPosts.map((post) => (
            <article
              key={post.id}
              className="group grid min-h-[3.75rem] gap-3 px-4 py-3 text-sm transition-[background-color] duration-150 hover:bg-muted/20 md:grid-cols-[4.25rem_minmax(0,1fr)_7rem_11rem_7rem] md:items-center md:px-6"
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground tabular-nums md:border-r md:border-border">
                <ChevronDown className="size-3 rotate-180 transition-transform group-hover:-translate-y-0.5" />
                <span>{post.voters}</span>
              </span>
              <button
                type="button"
                className="min-w-0 text-left transition-[color,transform] duration-200 hover:text-foreground active:scale-[0.99]"
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
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/25 px-3 py-1 text-xs text-muted-foreground">
                {activeBoard.icon}
                {activeBoard.name}
              </span>
              <span className="w-fit rounded-full border border-border bg-muted/25 px-3 py-1 text-xs font-semibold text-muted-foreground">
                {statusTitle(post.status)}
              </span>
            </article>
          ))
        ) : (
          <EmptyModule
            copy={`No ${activeStatus === "all" ? activeBoard.name.toLowerCase() : statusTitle(activeStatus).toLowerCase()} yet.`}
            icon={<Inbox />}
            title="Start from real feedback"
          />
        )}
      </div>
    </div>
  );
}
