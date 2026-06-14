import { ChevronDown } from "@/lib/icons";

import type { Post } from "@/components/amend-dashboard-types";
import { formatDate, statusTitle } from "@/components/amend-dashboard-utils";

export function FeedbackDetailHeader({ onBack, post }: { onBack: () => void; post: Post }) {
  return (
    <div className="border-b border-border bg-background/70 px-4 py-4 backdrop-blur md:px-6">
      <button
        type="button"
        className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground active:opacity-75"
        onClick={onBack}
      >
        <ChevronDown className="size-3 rotate-90" />
        Back to feedback
      </button>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-white/[0.05] px-2.5 py-0.5 font-semibold ring-1 ring-white/[0.06]">
              {statusTitle(post.status)}
            </span>
            <span>{post.source}</span>
            <span>{formatDate(post.updatedAt)}</span>
          </div>
          <h1 className="mt-3 max-w-4xl text-balance text-2xl font-semibold leading-tight md:text-3xl">
            {post.title}
          </h1>
        </div>
        <div className="flex min-h-10 items-center gap-2 rounded-xl bg-[#151518] px-3 text-sm text-muted-foreground ring-1 ring-white/[0.055]">
          <ChevronDown className="size-3 rotate-180" />
          <span className="font-semibold tabular-nums text-foreground">{post.voters}</span>
          <span>votes</span>
        </div>
      </div>
    </div>
  );
}
