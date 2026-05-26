import { Button } from "@amend/ui/components/button";
import { FolderOpen, MessageSquareText } from "lucide-react";

import { FeedbackSubmissionPanel } from "@/components/portal-feedback-submission-panel";
import { BoardRow, EmptyState } from "@/components/portal-list-elements";
import type { PortalFeedback } from "@/components/public-portal-types";

export function PortalFeedbackSection({
  changelogCount,
  feedback,
  feedbackMode,
  roadmapCount,
  workspaceSlug,
}: {
  changelogCount: number;
  feedback: PortalFeedback[];
  feedbackMode: "open" | "authenticated" | "closed";
  roadmapCount: number;
  workspaceSlug: string;
}) {
  return (
    <div id="feedback" className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section className="rounded-lg border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold">All feedback</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              Filter
            </Button>
            <Button size="sm" variant="outline">
              Top
            </Button>
          </div>
        </div>

        {feedback.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Ready to collect feedback"
            text="Share this portal with users to start collecting source-linked requests."
          />
        ) : (
          <div className="divide-y">
            {feedback.map((item) => (
              <article key={item.stableKey} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs text-foreground">
                    {item.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="grid size-8 place-items-center rounded-full bg-primary font-medium text-primary-foreground">
                    {item.authorName.slice(0, 2).toUpperCase()}
                  </span>
                  <span>{item.authorName}</span>
                  <span>{item.sourceLinks.length} sources</span>
                  <span className="ml-auto rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-foreground">
                    {item.votes} votes
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <PortalFeedbackAside
        changelogCount={changelogCount}
        feedbackCount={feedback.length}
        feedbackMode={feedbackMode}
        roadmapCount={roadmapCount}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}

function PortalFeedbackAside({
  changelogCount,
  feedbackCount,
  feedbackMode,
  roadmapCount,
  workspaceSlug,
}: {
  changelogCount: number;
  feedbackCount: number;
  feedbackMode: "open" | "authenticated" | "closed";
  roadmapCount: number;
  workspaceSlug: string;
}) {
  return (
    <aside className="grid gap-3">
      <FeedbackSubmissionPanel feedbackMode={feedbackMode} workspaceSlug={workspaceSlug} />
      <section className="rounded-lg border bg-card p-3">
        <div className="mb-2 flex items-center gap-2 px-1">
          <FolderOpen className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Boards</h2>
        </div>
        <BoardRow active count={feedbackCount} href="#feedback" label="All feedback" />
        <BoardRow count={roadmapCount} href="#roadmap" label="Roadmap" />
        <BoardRow count={changelogCount} href="#updates" label="Updates" />
      </section>
      <p className="mx-auto rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
        Powered by Amend
      </p>
    </aside>
  );
}
