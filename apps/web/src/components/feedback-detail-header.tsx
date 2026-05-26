import { ChevronDown } from "lucide-react";

import type { Post } from "@/components/amend-dashboard-types";
import { formatDate, statusTitle } from "@/components/amend-dashboard-utils";

export function FeedbackDetailHeader({ onBack, post }: { onBack: () => void; post: Post }) {
  return (
    <div className="border-b border-border bg-background/70 px-4 py-4 backdrop-blur md:px-6">
      <button
        type="button"
        className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-[color,scale] duration-200 hover:text-foreground active:scale-[0.96]"
        onClick={onBack}
      >
        <ChevronDown className="size-3 rotate-90" />
        Back to feedback
      </button>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-muted/25 px-3 py-1 font-semibold">
              {statusTitle(post.status)}
            </span>
            <span>{post.source}</span>
            <span>{formatDate(post.updatedAt)}</span>
          </div>
          <h1 className="mt-3 max-w-4xl text-balance text-2xl font-semibold leading-tight md:text-3xl">
            {post.title}
          </h1>
        </div>
        <div className="flex min-h-10 items-center gap-2 border border-border bg-background px-3 text-sm text-muted-foreground">
          <ChevronDown className="size-3 rotate-180" />
          <span className="font-semibold tabular-nums text-foreground">{post.voters}</span>
          <span>votes</span>
        </div>
      </div>
    </div>
  );
}
