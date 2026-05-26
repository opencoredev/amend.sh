import { cn } from "@amend/ui/lib/utils";
import { ClipboardList, DatabaseZap, Radio, Settings } from "lucide-react";

import { SettingsPanel, StatusRow } from "@/components/amend-dashboard-shared";
import type {
  DashboardAgentRun,
  DashboardAutomationDecision,
  DashboardReview,
  WorkspaceSettingsData,
} from "@/components/amend-dashboard-types";
import { formatDate, formatState } from "@/components/amend-dashboard-utils";
import { InspectorBlock } from "@/components/proactivation-inspector-block";
import type { AutomationMode, ReviewStatus } from "@/components/use-proactivation-controller";

const MODE_LABELS: Record<string, string> = {
  mostly_auto: "Mostly Auto",
  review_first: "Review First",
  manual: "Manual",
};

export function AutomationControlsPanel({
  canRun,
  onAutomationModeChange,
  rules,
  savingMode,
}: {
  canRun: boolean;
  onAutomationModeChange: (mode: AutomationMode) => void;
  rules: WorkspaceSettingsData["automationRules"] | undefined;
  savingMode: AutomationMode | null;
}) {
  return (
    <SettingsPanel icon={<Settings />} title="Automation controls">
      <StatusRow label="Mode" value={rules ? formatState(rules.mode) : "Loading"} />
      <StatusRow
        label="Review below"
        value={rules ? `${Math.round(rules.requireReviewBelowConfidence * 100)}%` : "Loading"}
      />
      <StatusRow
        label="Public copy"
        value={rules?.requireReviewForPublicCopy ? "Review required" : "Can auto-apply"}
      />
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        {(["mostly_auto", "review_first", "manual"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={cn(
              "h-8 border px-2 text-[0.65rem] font-semibold transition-colors duration-150 ease-linear active:opacity-75 disabled:opacity-40",
              rules?.mode === mode
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground",
            )}
            disabled={!canRun || savingMode === mode}
            onClick={() => onAutomationModeChange(mode)}
          >
            {savingMode === mode ? "Saving…" : MODE_LABELS[mode]}
          </button>
        ))}
      </div>
    </SettingsPanel>
  );
}

export function RuntimeStatusPanel({
  latestRun,
  reviews,
}: {
  latestRun: DashboardAgentRun | undefined;
  reviews: DashboardReview[];
}) {
  return (
    <SettingsPanel icon={<Radio />} title="Runtime status">
      <StatusRow
        label="Latest run"
        value={latestRun ? formatDate(latestRun.completedAt) : "Not run yet"}
      />
      <StatusRow
        label="Provider"
        value={
          latestRun?.providerConfigured ? (latestRun.provider ?? "Configured") : "Local fallback"
        }
      />
      <StatusRow
        label="Review queue"
        value={`${reviews.filter((item) => item.status === "needs_review").length} pending`}
      />
    </SettingsPanel>
  );
}

export function CurrentReviewPanel({
  latestReview,
  onReviewStatusChange,
  savingReview,
}: {
  latestReview: DashboardReview | undefined;
  onReviewStatusChange: (status: ReviewStatus) => void;
  savingReview: ReviewStatus | "";
}) {
  return (
    <SettingsPanel icon={<ClipboardList />} title="Current review">
      {latestReview ? (
        <div className="grid gap-3">
          <InspectorBlock
            meta={formatState(latestReview.status)}
            sourceLinks={latestReview.sourceLinks}
            summary={latestReview.summary}
            title={latestReview.title}
          />
          <div className="grid grid-cols-3 gap-1.5">
            {(["approved", "changes_requested", "published"] as const).map((status) => (
              <button
                key={status}
                type="button"
                className="h-8 border border-border px-2 text-[0.65rem] font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/50 hover:text-foreground active:opacity-75 disabled:opacity-40"
                disabled={!latestReview.recordId || savingReview === status}
                onClick={() => onReviewStatusChange(status)}
              >
                {formatState(status)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs leading-5 text-muted-foreground">
          Public copy, low-confidence matches, and notification blasts will appear here before they
          ship.
        </p>
      )}
    </SettingsPanel>
  );
}

export function LatestDecisionPanel({
  latestDecision,
  onRevertDecision,
  revertingDecision,
}: {
  latestDecision: DashboardAutomationDecision | undefined;
  onRevertDecision: () => void;
  revertingDecision: boolean;
}) {
  return (
    <SettingsPanel icon={<DatabaseZap />} title="Latest decision">
      {latestDecision ? (
        <div className="grid gap-3">
          <InspectorBlock
            meta={`${Math.round(latestDecision.confidence * 100)}% confidence / ${formatState(latestDecision.outcome)}`}
            sourceLinks={latestDecision.sourceLinks}
            summary={latestDecision.summary}
            title={formatState(latestDecision.action)}
          />
          {latestDecision.recordId && latestDecision.outcome === "applied" ? (
            <button
              type="button"
              className="h-8 border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/50 hover:text-foreground active:opacity-75"
              disabled={revertingDecision}
              onClick={onRevertDecision}
            >
              {revertingDecision ? "Reverting…" : "Revert decision"}
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-xs leading-5 text-muted-foreground">
          Run the agent after a channel has source evidence or customer signals.
        </p>
      )}
    </SettingsPanel>
  );
}
