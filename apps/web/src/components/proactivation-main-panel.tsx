import { Button } from "@amend/ui/components/button";
import { Settings, Sparkles } from "lucide-react";

import type { DashboardAgentActivity, DashboardChannel } from "@/components/amend-dashboard-types";
import { ProactivationActivityFeed } from "@/components/proactivation-activity-feed";
import { ProactivationAgentMetrics } from "@/components/proactivation-agent-metrics";
import {
  ProactivationChannelList,
  type ProactivationChannelState,
} from "@/components/proactivation-channel-list";

export function ProactivationMainPanel({
  activity,
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
    <section className="min-w-0 border-r border-border">
      <ProactivationAgentMetrics
        buildBriefCount={buildBriefCount}
        connectedChannelCount={connectedChannelCount}
        decisionCount={decisionCount}
        inputChannelCount={inputChannelCount}
        runCount={runCount}
      />

      <div className="border-b border-border p-4 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Proactivation
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              Agent operations and automation control
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This is the working surface for the background agent. Channels bring in signals;
              integrations provide context or delivery; every automated move lands in the ledger
              before public changes go out.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-10 border border-border bg-background px-4 text-xs font-semibold text-foreground transition-[background-color,color,scale] duration-200 hover:border-foreground hover:bg-muted active:scale-[0.96]"
              onClick={onConfigureAutomation}
              type="button"
            >
              <Settings data-icon="inline-start" />
              Configure
            </Button>
            <Button
              className="h-10 border border-foreground bg-foreground px-4 text-xs font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-background hover:text-foreground active:scale-[0.96]"
              disabled={!canRun || running}
              onClick={onRunAgent}
              type="button"
            >
              <Sparkles data-icon="inline-start" />
              {running ? "Running agent..." : "Run agent"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-4 md:p-6">
        <ProactivationChannelList
          canRun={canRun}
          channels={channels}
          onChannelStateChange={onChannelStateChange}
          onOpenSetup={onOpenSetup}
          savingChannel={savingChannel}
        />
        <ProactivationActivityFeed activity={activity} />
      </div>
    </section>
  );
}
