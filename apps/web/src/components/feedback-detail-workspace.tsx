import type { Post } from "@/components/amend-dashboard-types";
import { formatDate } from "@/components/amend-dashboard-utils";
import { DetailSectionLabel, SourceEvidenceList } from "@/components/dashboard-detail-shared";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { FeedbackDetailCommentsPanel } from "@/components/feedback-detail-comments-panel";
import { StatusPill } from "@/components/status-pill";
import { VoteButton } from "@/components/vote-button";

export function FeedbackDetailWorkspace({
  onAddNote,
  onVote,
  post,
}: {
  onAddNote: (note: string) => Promise<void>;
  onVote: (post: Post) => Promise<unknown>;
  post: Post;
}) {
  return (
    <DashboardWorkspaceSurface>
      <div className="w-full max-w-3xl px-5 py-6 md:px-8 md:py-8">
        <header className="flex items-start gap-4">
          <VoteButton
            count={post.voters}
            voted={post.hasVoted}
            onVote={() => onVote(post)}
            title={post.title}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <StatusPill status={post.status} />
              <span aria-hidden>·</span>
              <span className="truncate">{post.source}</span>
              <span aria-hidden>·</span>
              <span>Updated {formatDate(post.updatedAt)}</span>
            </div>
            <h1 className="mt-2.5 text-balance text-2xl font-semibold leading-tight md:text-[1.75rem]">
              {post.title}
            </h1>
          </div>
        </header>

        <div className="mt-8 grid gap-8">
          <section className="grid gap-3">
            <DetailSectionLabel>Description</DetailSectionLabel>
            <p className="whitespace-pre-wrap text-pretty text-sm leading-7 text-muted-foreground">
              {post.body || "No description was added."}
            </p>
            {post.labels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {post.labels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-white/[0.06]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section className="grid gap-3">
            <DetailSectionLabel>Comments</DetailSectionLabel>
            <FeedbackDetailCommentsPanel onAddNote={onAddNote} />
          </section>

          {post.sourceLinks.length > 0 ? (
            <section className="grid gap-3">
              <DetailSectionLabel>Source evidence</DetailSectionLabel>
              <SourceEvidenceList links={post.sourceLinks} />
            </section>
          ) : null}
        </div>
      </div>
    </DashboardWorkspaceSurface>
  );
}
