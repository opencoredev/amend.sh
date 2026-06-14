import { ChevronDown, MessageSquareText } from "@/lib/icons";

import { FeedbackSubmissionPanel } from "@/components/portal-feedback-submission-panel";
import { EmptyState, PORTAL_CHIP, PORTAL_SURFACE } from "@/components/portal-list-elements";
import type { PortalFeedback } from "@/components/public-portal-types";

export function PortalFeedbackSection({
  feedback,
  feedbackMode,
  workspaceSlug,
}: {
  feedback: PortalFeedback[];
  feedbackMode: "open" | "authenticated" | "closed";
  workspaceSlug: string;
}) {
  return (
    <div id="feedback" className="grid scroll-mt-4 gap-4">
      <FeedbackSubmissionPanel feedbackMode={feedbackMode} workspaceSlug={workspaceSlug} />

      <section className={PORTAL_SURFACE}>
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <h2 className="text-sm font-semibold">All feedback</h2>
          </div>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground"
          >
            Recent
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        {feedback.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Ready to collect feedback"
            text="Share this portal with users to start collecting source-linked requests."
          />
        ) : (
          <ul className="divide-y divide-border">
            {feedback.map((item) => (
              <li key={item.stableKey}>
                <article className="flex items-start gap-4 px-4 py-4 transition-colors duration-150 ease-linear hover:bg-muted/50">
                  <span className="grid w-12 shrink-0 gap-0.5 rounded-lg border border-border bg-muted py-2 text-center">
                    <span className="text-sm font-semibold tabular-nums leading-none">
                      {item.votes}
                    </span>
                    <span className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                      votes
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                      <span className={PORTAL_CHIP}>{item.status}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                      <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.625rem] font-semibold text-primary-foreground">
                        {item.authorName.slice(0, 2).toUpperCase()}
                      </span>
                      <span>{item.authorName}</span>
                      {item.sourceLinks.length > 0 ? (
                        <>
                          <span className="opacity-40">·</span>
                          <span>{item.sourceLinks.length} sources</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
