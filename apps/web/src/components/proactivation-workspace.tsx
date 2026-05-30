import type { DashboardOverview, Workspace } from "@/components/amend-dashboard-types";
import { ProactivationInspector } from "@/components/proactivation-inspector";
import { ProactivationMainPanel } from "@/components/proactivation-main-panel";
import { useProactivationController } from "@/components/use-proactivation-controller";

export function ProactivationWorkspace({
  dashboard,
  onConfigureAutomation,
  onOpenSetup,
  workspace,
}: {
  dashboard: DashboardOverview | undefined;
  onConfigureAutomation: () => void;
  onOpenSetup: () => void;
  workspace: Workspace;
}) {
  const proactivation = useProactivationController({ dashboard, workspace });

  return (
    <div>
      <div className="flex h-[calc(100svh-5.5rem)] min-w-0 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <ProactivationMainPanel
            activity={proactivation.activity}
            analytics={proactivation.analytics}
            buildBriefCount={proactivation.buildBriefs.length}
            canRun={proactivation.canRun}
            channels={proactivation.channels}
            connectedChannelCount={proactivation.connectedChannels}
            decisionCount={proactivation.decisions.length}
            inputChannelCount={proactivation.inputChannels.length}
            onChannelStateChange={proactivation.updateChannelState}
            onConfigureAutomation={onConfigureAutomation}
            onOpenSetup={onOpenSetup}
            onRunAgent={proactivation.runAgentNow}
            runCount={proactivation.runs.length}
            running={proactivation.running}
            savingChannel={proactivation.savingChannel}
          />
        </div>

        <aside className="hidden w-[22rem] shrink-0 border-l border-border xl:block">
          <div className="h-full overflow-y-auto">
            <ProactivationInspector
              buildBriefs={proactivation.buildBriefs}
              canRun={proactivation.canRun}
              latestDecision={proactivation.latestDecision}
              latestReview={proactivation.latestReview}
              latestRun={proactivation.latestRun}
              onAutomationModeChange={proactivation.saveAutomationMode}
              onRevertDecision={proactivation.revertLatestDecision}
              onReviewStatusChange={proactivation.updateLatestReviewStatus}
              revertingDecision={proactivation.revertingDecision}
              reviews={proactivation.reviews}
              rules={proactivation.rules}
              savingMode={proactivation.savingMode}
              savingReview={proactivation.savingReview}
              sources={proactivation.sources}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
