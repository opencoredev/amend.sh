import { Button } from "@amend/ui/components/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { DetailStat, SourceEvidenceList } from "@/components/dashboard-detail-shared";
import type { DashboardRoadmap } from "@/components/amend-dashboard-types";
import {
  formatDate,
  priorityLabel,
  roadmapStatusToRoadmapStatus,
  sourceFeedbackKey,
  statusTitle,
} from "@/components/amend-dashboard-utils";
import { errorMessage, toast } from "@/lib/toast";

export function RoadmapDetailWorkspace({
  item,
  onBack,
  onOpenFeedback,
  onVote,
}: {
  item: DashboardRoadmap;
  onBack: () => void;
  onOpenFeedback: (stableKey: string) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const feedbackKey = sourceFeedbackKey(item);
  const [voting, setVoting] = useState(false);

  return (
    <div className="t-panel-slide min-h-svh bg-card/40" data-open="true">
      <div className="border-b border-border bg-background/70 px-4 py-4 backdrop-blur md:px-6">
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-[color,scale] duration-200 hover:text-foreground active:scale-[0.96]"
          onClick={onBack}
        >
          <ChevronDown className="size-3 rotate-90" />
          Back to roadmap
        </button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-muted/25 px-3 py-1 font-semibold">
                {statusTitle(roadmapStatusToRoadmapStatus(item.status))}
              </span>
              <span>{priorityLabel(item.priority)}</span>
              <span>{formatDate(item.updatedAt)}</span>
            </div>
            <h1 className="mt-3 max-w-4xl text-balance text-2xl font-semibold leading-tight md:text-3xl">
              {item.title}
            </h1>
          </div>
          <button
            type="button"
            className="flex min-h-10 items-center gap-2 border border-border bg-background px-3 text-sm text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
            disabled={voting}
            onClick={() => {
              setVoting(true);
              void onVote(item)
                .catch((error: unknown) =>
                  toast.error({
                    title: "Vote was not saved",
                    description: errorMessage(
                      error,
                      "The roadmap vote could not be saved. Refresh the project and try again.",
                    ),
                  }),
                )
                .finally(() => setVoting(false));
            }}
          >
            <ChevronDown className="size-3 rotate-180" />
            <span className="font-semibold tabular-nums text-foreground">{item.feedbackCount}</span>
            <span>votes</span>
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0 border-b border-border bg-background/45 lg:border-b-0 lg:border-r">
          <div className="mx-auto grid max-w-4xl gap-6 px-4 py-6 md:px-6 md:py-8">
            <section className="grid gap-4">
              <h2 className="text-sm font-semibold">Roadmap item</h2>
              <p className="max-w-3xl whitespace-pre-wrap text-pretty text-sm leading-7 text-muted-foreground">
                {item.description || item.impact || "No description was added."}
              </p>
            </section>
            <section className="grid gap-3 sm:grid-cols-2">
              <DetailStat
                label="Status"
                value={statusTitle(roadmapStatusToRoadmapStatus(item.status))}
              />
              <DetailStat label="Priority" value={priorityLabel(item.priority)} />
              <DetailStat label="Votes" value={String(item.feedbackCount)} />
              <DetailStat label="Changelog links" value={String(item.changelogCount)} />
              <DetailStat label="Target" value={item.target ?? "No target"} />
              <DetailStat label="Updated" value={formatDate(item.updatedAt)} />
            </section>
            <SourceEvidenceList links={item.sourceLinks} />
          </div>
        </article>

        <aside className="grid min-w-0 content-start gap-4 bg-card/35 p-4 md:p-6">
          <section className="grid gap-3">
            <h2 className="text-sm font-semibold">Linked feedback</h2>
            {feedbackKey ? (
              <Button
                className="h-10 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-[background-color,color,scale] hover:bg-background hover:text-foreground active:scale-[0.96]"
                type="button"
                onClick={() => onOpenFeedback(feedbackKey)}
              >
                Open feedback
              </Button>
            ) : (
              <p className="text-pretty text-xs leading-5 text-muted-foreground">
                This was created directly on the roadmap. It is also listed on the feedback screen
                so the board and roadmap stay aligned.
              </p>
            )}
          </section>
          <section className="grid gap-3">
            <h2 className="text-sm font-semibold">Source evidence</h2>
            <SourceEvidenceList compact links={item.sourceLinks} />
          </section>
        </aside>
      </div>
    </div>
  );
}
