import { Button } from "@amend/ui/components/button";

import type { DashboardRoadmap } from "@/components/amend-dashboard-types";
import {
  formatDate,
  priorityLabel,
  roadmapStatusToRoadmapStatus,
  sourceFeedbackKey,
} from "@/components/amend-dashboard-utils";
import { DetailSectionLabel, SourceEvidenceList } from "@/components/dashboard-detail-shared";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { StatusPill } from "@/components/status-pill";
import { VoteButton } from "@/components/vote-button";

export function RoadmapDetailWorkspace({
  item,
  onOpenFeedback,
  onVote,
}: {
  item: DashboardRoadmap;
  onOpenFeedback: (stableKey: string) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const feedbackKey = sourceFeedbackKey(item);
  const status = roadmapStatusToRoadmapStatus(item.status);

  return (
    <DashboardWorkspaceSurface>
      <div className="w-full max-w-3xl px-5 py-6 md:px-8 md:py-8">
        <header className="flex items-start gap-4">
          <VoteButton
            count={item.feedbackCount}
            voted={item.viewerHasVoted ?? false}
            onVote={() => onVote(item)}
            title={item.title}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <StatusPill status={status} />
              <span aria-hidden>·</span>
              <span>{priorityLabel(item.priority)}</span>
              {item.target ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{item.target}</span>
                </>
              ) : null}
              <span aria-hidden>·</span>
              <span>Updated {formatDate(item.updatedAt)}</span>
            </div>
            <h1 className="mt-2.5 text-balance text-2xl font-semibold leading-tight md:text-[1.75rem]">
              {item.title}
            </h1>
          </div>
        </header>

        <div className="mt-8 grid gap-8">
          <section className="grid gap-3">
            <DetailSectionLabel>Description</DetailSectionLabel>
            <p className="whitespace-pre-wrap text-pretty text-sm leading-7 text-muted-foreground">
              {item.description || item.impact || "No description was added."}
            </p>
          </section>

          {item.sourceLinks.length > 0 ? (
            <section className="grid gap-3">
              <DetailSectionLabel>Source evidence</DetailSectionLabel>
              <SourceEvidenceList links={item.sourceLinks} />
            </section>
          ) : null}

          {feedbackKey ? (
            <section className="grid gap-3">
              <DetailSectionLabel>Linked feedback</DetailSectionLabel>
              <Button
                className="h-10 w-fit justify-center rounded-xl border border-foreground bg-foreground px-4 text-xs font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75"
                type="button"
                onClick={() => onOpenFeedback(feedbackKey)}
              >
                Open feedback
              </Button>
            </section>
          ) : null}
        </div>
      </div>
    </DashboardWorkspaceSurface>
  );
}
