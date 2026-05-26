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
} from "lucide-react";
import type { ReactElement } from "react";

import { formatDate, formatState } from "@/components/amend-dashboard-format";
import type { DashboardOverview } from "@/components/amend-dashboard-types";

type AnalyticsOverview = NonNullable<DashboardOverview["analytics"]>;

export function TopEventsPanel({ analytics }: { analytics?: AnalyticsOverview }) {
  const events = analytics?.topEvents ?? [];
  const max = Math.max(...events.map((event) => event.count), 1);

  return (
    <section className="grid gap-3 border border-border bg-background p-4">
      <SectionHeader eyebrow="PostHog stream" icon={<RadioTower />} title="Top events" />
      {events.length ? (
        <div className="grid gap-2">
          {events.slice(0, 8).map((event) => (
            <div className="grid gap-2 border border-border p-3" key={event.event}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold">{formatState(event.event)}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{event.count}</span>
              </div>
              <div className="h-1 bg-muted">
                <div
                  className="h-full bg-foreground"
                  style={{ width: `${Math.max(6, Math.round((event.count / max) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          icon={<RadioTower />}
          text="Events will populate here after SDK, portal, REST, or agent activity is captured."
        />
      )}
    </section>
  );
}

export function EventLedgerPanel({ analytics }: { analytics?: AnalyticsOverview }) {
  const events = analytics?.recentEvents ?? [];

  return (
    <section className="grid gap-3 border border-border bg-background p-4">
      <SectionHeader eyebrow="Ledger" icon={<Activity />} title="Recent analytics events" />
      {events.length ? (
        <div className="grid gap-2">
          {events.slice(0, 10).map((event) => (
            <div
              className="grid gap-1 border border-border px-3 py-2 text-xs"
              key={`${event.event}-${event.createdAt}-${event.source}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-semibold">{formatState(event.event)}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatDate(event.createdAt)}
                </span>
              </div>
              <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                <span className="truncate">
                  {event.externalUserId ?? event.accountId ?? "anonymous"}
                </span>
                <span className="truncate">{event.updateKey ?? event.source}</span>
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
    <section className="grid gap-3 border border-border bg-background p-4">
      <SectionHeader eyebrow="Contract" icon={<DatabaseZap />} title="Event categories" />
      {categories.length ? (
        <div className="grid gap-2">
          {categories.map((category) => (
            <div className="grid gap-2 border border-border p-3" key={category.category}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold">{formatState(category.category)}</span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {category.count}
                </span>
              </div>
              <div className="h-1 bg-muted">
                <div
                  className="h-full bg-foreground"
                  style={{
                    width: `${Math.max(6, Math.round((category.count / max) * 100))}%`,
                  }}
                />
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
    <section className="grid gap-3 border border-border bg-background p-4">
      <SectionHeader eyebrow="Sources" icon={<GitBranch />} title="Channel health" />
      {channels.length ? (
        <div className="grid gap-2">
          {channels.slice(0, 6).map((channel) => (
            <div className="grid gap-2 border border-border p-3 text-xs" key={channel.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-semibold">{channel.label}</span>
                <span
                  className={cn(
                    "border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.08em]",
                    channel.state === "connected"
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {channel.state}
                </span>
              </div>
              <p className="line-clamp-2 text-muted-foreground">{channel.detail}</p>
              <span className="font-mono text-muted-foreground">
                {channel.signalCount} signals
                {channel.lastEventAt ? ` / ${formatDate(channel.lastEventAt)}` : ""}
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
      <div className="border-t border-border pt-3 text-xs text-muted-foreground">
        {sourceEvents.length} normalized source events available for product decisions.
      </div>
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
    <section className="grid gap-3 border border-border bg-background p-4">
      <SectionHeader eyebrow="Automation" icon={<Sparkles />} title="Agent output" />
      <div className="grid grid-cols-2 gap-2">
        {rows.map(([label, value, icon]) => (
          <div className="grid gap-2 border border-border p-3" key={label}>
            <div className="flex items-center justify-between gap-2 text-muted-foreground [&_svg]:size-3.5">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em]">
                {label}
              </span>
              {icon}
            </div>
            <span className="font-mono text-xl font-semibold tabular-nums">{value}</span>
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
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-sm font-semibold">{title}</h2>
      </div>
      <span className="grid size-8 place-items-center border border-border text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
    </div>
  );
}

function EmptyPanel({ icon, text }: { icon: ReactElement; text: string }) {
  return (
    <div className="grid min-h-32 place-items-center border border-dashed border-border p-5 text-center">
      <div className="grid justify-items-center gap-3">
        <span className="grid size-9 place-items-center border border-border text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
