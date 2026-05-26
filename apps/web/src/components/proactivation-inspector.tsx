import {
  AutomationControlsPanel,
  CurrentReviewPanel,
  LatestDecisionPanel,
  RuntimeStatusPanel,
} from "@/components/proactivation-inspector-control-panels";
import {
  BuildBriefsPanel,
  SetupChecklistPanel,
  SourceEvidencePanel,
} from "@/components/proactivation-inspector-evidence-panels";
import type {
  DashboardAgentRun,
  DashboardAutomationDecision,
  DashboardBuildBrief,
  DashboardReview,
  DashboardSourceEvent,
  WorkspaceSettingsData,
} from "@/components/amend-dashboard-types";
import type { AutomationMode, ReviewStatus } from "@/components/use-proactivation-controller";

export function ProactivationInspector({
  buildBriefs,
  canRun,
  latestDecision,
  latestReview,
  latestRun,
  onAutomationModeChange,
  onRevertDecision,
  onReviewStatusChange,
  revertingDecision,
  reviews,
  rules,
  savingMode,
  savingReview,
  sources,
}: {
  buildBriefs: DashboardBuildBrief[];
  canRun: boolean;
  latestDecision: DashboardAutomationDecision | undefined;
  latestReview: DashboardReview | undefined;
  latestRun: DashboardAgentRun | undefined;
  onAutomationModeChange: (mode: AutomationMode) => void;
  onRevertDecision: () => void;
  onReviewStatusChange: (status: ReviewStatus) => void;
  revertingDecision: boolean;
  reviews: DashboardReview[];
  rules: WorkspaceSettingsData["automationRules"] | undefined;
  savingMode: AutomationMode | null;
  savingReview: ReviewStatus | "";
  sources: DashboardSourceEvent[];
}) {
  return (
    <div className="grid gap-px bg-border">
      <AutomationControlsPanel
        canRun={canRun}
        rules={rules}
        savingMode={savingMode}
        onAutomationModeChange={onAutomationModeChange}
      />
      <RuntimeStatusPanel latestRun={latestRun} reviews={reviews} />
      <CurrentReviewPanel
        latestReview={latestReview}
        savingReview={savingReview}
        onReviewStatusChange={onReviewStatusChange}
      />
      <LatestDecisionPanel
        latestDecision={latestDecision}
        revertingDecision={revertingDecision}
        onRevertDecision={onRevertDecision}
      />
      <BuildBriefsPanel buildBriefs={buildBriefs} />
      <SourceEvidencePanel sources={sources} />
      <SetupChecklistPanel />
    </div>
  );
}
