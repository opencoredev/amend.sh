import { Button } from "@amend/ui/components/button";
import { Settings, Sparkles } from "lucide-react";

import type { DashboardAgentActivity, DashboardChannel } from "@/components/amend-dashboard-types";
import type { DashboardOverview } from "@/components/amend-dashboard-types";
import { ProactivationActivityFeed } from "@/components/proactivation-activity-feed";
import { ProactivationAgentMetrics } from "@/components/proactivation-agent-metrics";
import { ProactivationAnalyticsPanel } from "@/components/proactivation-analytics-panel";
import {
  ProactivationChannelList,
  type ProactivationChannelState,
} from "@/components/proactivation-channel-list";

export function ProactivationMainPanel({
  activity,
  analytics,
  buildBriefCount,
  canRun,
  channels,
  connectedChannelCount,
  decisionCount,
  inputChannelCount,
  onChannelStateChange,
  onConfigureAutomation,
  onOpenSetup,
  onRunAgent,
  runCount,
  running,
  savingChannel,
}: {
  activity: DashboardAgentActivity[];
  analytics: DashboardOverview["analytics"] | undefined;
  buildBriefCount: number;
  canRun: boolean;
  channels: DashboardChannel[];
  connectedChannelCount: number;
  decisionCount: number;
  inputChannelCount: number;
  onChannelStateChange: (channel: DashboardChannel, state: ProactivationChannelState) => void;
  onConfigureAutomation: () => void;
  onOpenSetup: () => void;
  onRunAgent: () => void;
  runCount: number;
  running: boolean;
  savingChannel: string;
}) {
  return (
    <section className="min-w-0">
      <ProactivationAgentMetrics
        buildBriefCount={buildBriefCount}
        connectedChannelCount={connectedChannelCount}
        decisionCount={decisionCount}
        inputChannelCount={inputChannelCount}
        runCount={runCount}
      />

      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Proactivation
          </p>
          <h2 className="mt-1 truncate text-base font-semibold">
            Agent operations and automation control
          </h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            className="h-8 border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors duration-150 ease-linear hover:border-foreground/50 hover:bg-muted active:opacity-75"
            onClick={onConfigureAutomation}
            type="button"
          >
            <Settings className="size-3" />
            Configure
          </Button>
          <Button
            className="h-8 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75 disabled:opacity-40"
            disabled={!canRun || running}
            onClick={onRunAgent}
            type="button"
          >
            <Sparkles className="size-3" />
            {running ? "Running..." : "Run agent"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-6">
        <ProactivationChannelList
          canRun={canRun}
          channels={channels}
          onChannelStateChange={onChannelStateChange}
          onOpenSetup={onOpenSetup}
          savingChannel={savingChannel}
        />
        <ProactivationAnalyticsPanel analytics={analytics} />
        <ProactivationActivityFeed activity={activity} />
      </div>
    </section>
  );
}
