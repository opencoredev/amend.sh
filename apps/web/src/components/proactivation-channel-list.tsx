import { DatabaseZap } from "lucide-react";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { DashboardChannel } from "@/components/amend-dashboard-types";
import { formatState } from "@/components/amend-dashboard-utils";

export type ProactivationChannelState = "attention" | "connected" | "disabled";

export function ProactivationChannelList({
  canRun,
  channels,
  onChannelStateChange,
  onOpenSetup,
  savingChannel,
}: {
  canRun: boolean;
  channels: DashboardChannel[];
  onChannelStateChange: (channel: DashboardChannel, state: ProactivationChannelState) => void;
  onOpenSetup: () => void;
  savingChannel: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Channels and integrations</h3>
        <span className="text-xs text-muted-foreground">{channels.length} configured</span>
      </div>
      <div className="grid overflow-hidden border border-border bg-card lg:grid-cols-2">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <ChannelRow
              key={channel.id}
              canRun={canRun}
              channel={channel}
              onChannelStateChange={onChannelStateChange}
              savingChannel={savingChannel}
            />
          ))
        ) : (
          <EmptyModule
            action="Create project"
            copy="Create a project and connect the first channel before the agent can observe signals."
            icon={<DatabaseZap />}
            onAction={onOpenSetup}
            title="No channels yet"
          />
        )}
      </div>
    </section>
  );
}

function ChannelRow({
  canRun,
  channel,
  onChannelStateChange,
  savingChannel,
}: {
  canRun: boolean;
  channel: DashboardChannel;
  onChannelStateChange: (channel: DashboardChannel, state: ProactivationChannelState) => void;
  savingChannel: string;
}) {
  const disabled = savingChannel === channel.id || !canRun;

  return (
    <div className="grid gap-2 border-b border-border p-4 last:border-b-0 lg:border-r lg:[&:nth-child(even)]:border-r-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{channel.label}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {channel.detail}
          </p>
        </div>
        <span className="shrink-0 border border-border bg-muted/25 px-2 py-1 text-xs text-muted-foreground">
          {channel.kind}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="border border-border bg-background px-2 py-1">
          {formatState(channel.state)}
        </span>
        <span className="border border-border bg-background px-2 py-1">
          {formatState(channel.health)}
        </span>
        <span className="border border-border bg-background px-2 py-1">
          {channel.signalCount} signals
        </span>
      </div>
      {isConfigurableProvider(channel.provider) ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            className="h-8 border border-border px-2 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
            disabled={disabled}
            onClick={() =>
              onChannelStateChange(
                channel,
                channel.state === "connected" ? "attention" : "connected",
              )
            }
          >
            {channel.state === "connected" ? "Needs attention" : "Mark connected"}
          </button>
          <button
            type="button"
            className="h-8 border border-border px-2 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
            disabled={disabled}
            onClick={() => onChannelStateChange(channel, "disabled")}
          >
            Disable
          </button>
        </div>
      ) : null}
    </div>
  );
}

function isConfigurableProvider(provider: string) {
  return ["discord", "github", "linear", "posthog", "slack", "support", "x"].includes(provider);
}
