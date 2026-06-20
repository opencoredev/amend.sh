import { cn } from "@amend/ui/lib/utils";
import {
  Activity,
  ChartNoAxesCombined,
  DatabaseZap,
  GitBranch,
  Inbox,
  RadioTower,
  Send,
  Sparkles,
} from "@/lib/icons";
import type { ReactElement } from "react";

import { formatDate, formatState } from "@/components/amend-dashboard-format";
import type { DashboardOverview } from "@/components/amend-dashboard-types";

type AnalyticsOverview = NonNullable<DashboardOverview["analytics"]>;

export function TopEventsPanel({ analytics }: { analytics?: AnalyticsOverview }) {
  const events = analytics?.topEvents ?? [];
  const max = Math.max(...events.map((event) => event.count), 1);

  return (
    <section className="rounded-2xl bg-[#151518] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]">
      <SectionHeader eyebrow="PostHog stream" icon={<RadioTower />} title="Top events" />
      {events.length ? (
        <div className="mt-3 grid gap-1.5">
          {events.slice(0, 8).map((event) => (
            <div
              className="flex items-center gap-3 rounded-xl bg-background/65 px-3 py-2.5 ring-1 ring-white/[0.035]"
              key={event.event}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-medium">{formatState(event.event)}</span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                    {event.count}
                  </span>
                </div>
                <div className="mt-1.5 h-px bg-foreground/[0.08]">
                  <div
                    className="h-full bg-foreground/60"
                    style={{ width: `${Math.max(6, Math.round((event.count / max) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          icon={<RadioTower />}
          text="Events will populate after SDK, portal, REST, or agent activity is captured."
        />
      )}
    </section>
  );
}

export function EventLedgerPanel({ analytics }: { analytics?: AnalyticsOverview }) {
  const events = analytics?.recentEvents ?? [];

  return (
    <section className="rounded-2xl bg-[#151518] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]">
      <SectionHeader eyebrow="Ledger" icon={<Activity />} title="Recent analytics events" />
      {events.length ? (
        <div className="mt-3 grid gap-1.5">
          {events.slice(0, 10).map((event) => (
            <div
              className="grid gap-0.5 rounded-xl bg-background/65 px-3 py-2.5 text-xs ring-1 ring-white/[0.035]"
              key={`${event.event}-${event.createdAt}-${event.source}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium">{formatState(event.event)}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatDate(event.createdAt)}
                </span>
              </div>
              <div className="flex min-w-0 gap-3 text-muted-foreground/70">
                <span className="truncate">
                  {event.externalUserId ?? event.accountId ?? "anonymous"}
                </span>
                <span className="shrink-0 truncate">{event.updateKey ?? event.source}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          icon={<Activity />}
          text="The event ledger is ready. It stays empty until the first captured action arrives."
        />
      )}
    </section>
  );
}

export function CategoryPanel({ analytics }: { analytics?: AnalyticsOverview }) {
  const categories = analytics?.topCategories ?? [];
  const max = Math.max(...categories.map((category) => category.count), 1);

  return (
    <section className="rounded-2xl bg-[#151518] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]">
      <SectionHeader eyebrow="Contract" icon={<DatabaseZap />} title="Event categories" />
      {categories.length ? (
        <div className="mt-3 grid gap-1.5">
          {categories.map((category) => (
            <div
              className="flex items-center gap-3 rounded-xl bg-background/65 px-3 py-2.5 ring-1 ring-white/[0.035]"
              key={category.category}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-medium">{formatState(category.category)}</span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                    {category.count}
                  </span>
                </div>
                <div className="mt-1.5 h-px bg-foreground/[0.08]">
                  <div
                    className="h-full bg-foreground/60"
                    style={{
                      width: `${Math.max(6, Math.round((category.count / max) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          icon={<DatabaseZap />}
          text="Tracked events are grouped into identity, feedback, source, agent, roadmap, update, and delivery categories."
        />
      )}
    </section>
  );
}

export function SourceHealthPanel({
  channels,
  sourceEvents,
}: {
  channels: DashboardOverview["channels"];
  sourceEvents: DashboardOverview["sourceEvents"];
}) {
  return (
    <section className="rounded-2xl bg-[#151518] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]">
      <SectionHeader eyebrow="Sources" icon={<GitBranch />} title="Channel health" />
      {channels.length ? (
        <div className="mt-3 grid gap-1.5">
          {channels.slice(0, 6).map((channel) => (
            <div
              className="grid gap-1 rounded-xl bg-background/65 px-3 py-2.5 text-xs ring-1 ring-white/[0.035]"
              key={channel.id}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium">{channel.label}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] ring-1",
                    channel.state === "connected"
                      ? "text-foreground ring-white/[0.14]"
                      : "text-muted-foreground ring-white/[0.04]",
                  )}
                >
                  {channel.state}
                </span>
              </div>
              <span className="font-mono text-muted-foreground/70">
                {channel.signalCount} signals
                {channel.lastEventAt ? ` · ${formatDate(channel.lastEventAt)}` : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          icon={<GitBranch />}
          text="Connect feedback, GitHub, or SDK sources to start measuring source health."
        />
      )}
      <p className="mt-3 text-xs text-muted-foreground/60">
        {sourceEvents.length} normalized source events available.
      </p>
    </section>
  );
}

export function AgentOutputPanel({
  agentRuns,
  changelog,
  decisions,
  notifications,
  reviews,
  roadmap,
}: {
  agentRuns: number;
  changelog: number;
  decisions: number;
  notifications: number;
  reviews: number;
  roadmap: number;
}) {
  const rows = [
    ["Runs", agentRuns, <Sparkles key="runs" />],
    ["Decisions", decisions, <Activity key="decisions" />],
    ["Reviews", reviews, <Inbox key="reviews" />],
    ["Roadmap", roadmap, <GitBranch key="roadmap" />],
    ["Changelog", changelog, <ChartNoAxesCombined key="changelog" />],
    ["Delivery", notifications, <Send key="delivery" />],
  ] as const;

  return (
    <section className="rounded-2xl bg-[#151518] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]">
      <SectionHeader eyebrow="Automation" icon={<Sparkles />} title="Agent output" />
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {rows.map(([label, value, icon]) => (
          <div
            className="grid gap-1.5 rounded-xl bg-background/65 p-3 ring-1 ring-white/[0.035]"
            key={label}
          >
            <div className="flex items-center justify-between gap-1 text-muted-foreground [&_svg]:size-3">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em]">
                {label}
              </span>
              {icon}
            </div>
            <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  icon,
  title,
}: {
  eyebrow: string;
  icon: ReactElement;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 text-xs font-semibold">{title}</h2>
      </div>
      <span className="grid size-8 place-items-center rounded-lg bg-background/70 text-muted-foreground ring-1 ring-white/[0.045] [&_svg]:size-3.5">
        {icon}
      </span>
    </div>
  );
}

function EmptyPanel({ icon, text }: { icon: ReactElement; text: string }) {
  return (
    <div className="mt-3 grid min-h-24 place-items-center p-4 text-center">
      <div className="grid justify-items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-background/70 text-muted-foreground ring-1 ring-white/[0.045] [&_svg]:size-3.5">
          {icon}
        </span>
        <p className="max-w-xs text-xs leading-5 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
