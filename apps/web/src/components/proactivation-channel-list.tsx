import { cn } from "@amend/ui/lib/utils";
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
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Channels &amp; integrations
        </h3>
        {channels.length > 0 && (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {channels.length} configured
          </span>
        )}
      </div>
      <div className="grid gap-px border border-border bg-border lg:grid-cols-2">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              canRun={canRun}
              channel={channel}
              onChannelStateChange={onChannelStateChange}
              savingChannel={savingChannel}
            />
          ))
        ) : (
          <div className="col-span-2 bg-card">
            <EmptyModule
              action="Create project"
              copy="Create a project and connect the first channel before the agent can observe signals."
              icon={<DatabaseZap />}
              onAction={onOpenSetup}
              title="No channels yet"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ChannelCard({
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
  const isConnected = channel.health === "healthy";
  const isAttention = channel.state === "attention";

  return (
    <div className="flex flex-col gap-3 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <HealthDot connected={isConnected} attention={isAttention} />
            <p className="truncate text-sm font-semibold">{channel.label}</p>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {channel.detail}
          </p>
        </div>
        <span className="shrink-0 border border-border px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {channel.kind}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusPill label={formatState(channel.state)} />
        <StatusPill label={formatState(channel.health)} />
        <StatusPill label={`${channel.signalCount} signals`} mono />
      </div>

      {isConfigurableProvider(channel.provider) ? (
        <div className="flex gap-1.5 border-t border-border pt-3">
          <button
            type="button"
            className="h-7 border border-border px-2.5 text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/50 hover:text-foreground active:opacity-75 disabled:opacity-40"
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
            className="h-7 border border-border px-2.5 text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/50 hover:text-foreground active:opacity-75 disabled:opacity-40"
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

function HealthDot({ connected, attention }: { connected: boolean; attention: boolean }) {
  return (
    <span
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        attention ? "bg-amber-400" : connected ? "bg-emerald-400" : "bg-muted-foreground/40",
      )}
    />
  );
}

function StatusPill({ label, mono }: { label: string; mono?: boolean }) {
  return (
    <span
      className={cn(
        "border border-border bg-background px-2 py-0.5 text-[0.65rem] text-muted-foreground",
        mono && "font-mono tabular-nums",
      )}
    >
      {label}
    </span>
  );
}

function isConfigurableProvider(provider: string) {
  return ["discord", "github", "linear", "posthog", "slack", "support", "x"].includes(provider);
}
