import { Activity, ChartNoAxesCombined, DatabaseZap, Sparkles, Users } from "lucide-react";
import type { ReactElement } from "react";

import {
  AgentOutputPanel,
  CategoryPanel,
  EventLedgerPanel,
  SectionHeader,
  SourceHealthPanel,
  TopEventsPanel,
} from "@/components/analytics-workspace-panels";
import type { DashboardOverview, Workspace } from "@/components/amend-dashboard-types";

type AnalyticsWorkspaceProps = {
  dashboard?: DashboardOverview;
  workspace: Workspace;
  onOpenProactivation: () => void;
  onOpenSetup: () => void;
};

type Metric = {
  detail: string;
  icon: ReactElement;
  label: string;
  value: number;
};

export function AnalyticsWorkspace({
  dashboard,
  workspace,
  onOpenProactivation,
  onOpenSetup,
}: AnalyticsWorkspaceProps) {
  const analytics = dashboard?.analytics;
  const sourceEvents = dashboard?.sourceEvents ?? [];
  const agentRuns = dashboard?.agentRuns ?? [];
  const decisions = dashboard?.automationDecisions ?? [];
  const feedback = dashboard?.feedback ?? [];
  const roadmap = dashboard?.roadmap ?? [];
  const changelog = dashboard?.recentChangelog ?? [];
  const notifications = dashboard?.notifications ?? [];
  const reviews = dashboard?.reviewQueue ?? [];
  const channels = dashboard?.channels ?? [];
  const eventTotal = analytics?.totalEvents ?? 0;
  const workflowTotal =
    feedback.length +
    sourceEvents.length +
    agentRuns.length +
    decisions.length +
    roadmap.length +
    changelog.length;

  const metrics: Metric[] = [
    {
      detail: "Captured through PostHog plus Convex event records",
      icon: <Activity />,
      label: "Events",
      value: eventTotal,
    },
    {
      detail: "Known app visitors and identified SDK contacts",
      icon: <Users />,
      label: "Users",
      value: analytics?.uniqueUsers ?? 0,
    },
    {
      detail: "Companies, tenants, or external accounts observed",
      icon: <DatabaseZap />,
      label: "Accounts",
      value: analytics?.uniqueAccounts ?? 0,
    },
    {
      detail: "Autonomous product loops completed or attempted",
      icon: <Sparkles />,
      label: "Agent runs",
      value: agentRuns.length,
    },
  ];

  const funnel = [
    {
      count: feedback.length + eventTotal,
      detail: "Portal, SDK, and product events enter Amend",
      label: "Customer signal",
    },
    {
      count: sourceEvents.length,
      detail: "GitHub, feedback, and source-channel events normalized",
      label: "Source ingestion",
    },
    {
      count: decisions.length + reviews.length,
      detail: "Automation decisions queued with human review where needed",
      label: "Agent review",
    },
    {
      count: roadmap.length + changelog.length + notifications.length,
      detail: "Roadmap movement, changelog work, and customer delivery",
      label: "Product output",
    },
  ];

  return (
    <main className="grid min-h-0 flex-1 overflow-y-auto bg-background">
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="grid gap-6">
          <AnalyticsHero
            eventTotal={eventTotal}
            onOpenProactivation={onOpenProactivation}
            onOpenSetup={onOpenSetup}
            sourceName={workspace.name}
            workflowTotal={workflowTotal}
          />

          <div className="grid border border-border bg-background md:grid-cols-4">
            {metrics.map((metric) => (
              <MetricTile key={metric.label} metric={metric} />
            ))}
          </div>

          <section className="grid gap-3 border border-border bg-background p-4">
            <SectionHeader
              eyebrow="Signal flow"
              icon={<ChartNoAxesCombined />}
              title="From raw events to shipped work"
            />
            <div className="grid gap-3 lg:grid-cols-4">
              {funnel.map((step, index) => (
                <FunnelStep
                  count={step.count}
                  detail={step.detail}
                  index={index}
                  key={step.label}
                  label={step.label}
                  max={Math.max(...funnel.map((item) => item.count), 1)}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <TopEventsPanel analytics={analytics} />
            <EventLedgerPanel analytics={analytics} />
          </section>
        </section>

        <aside className="grid content-start gap-4">
          <CategoryPanel analytics={analytics} />
          <SourceHealthPanel channels={channels} sourceEvents={sourceEvents} />
          <AgentOutputPanel
            agentRuns={agentRuns.length}
            changelog={changelog.length}
            decisions={decisions.length}
            notifications={notifications.length}
            reviews={reviews.length}
            roadmap={roadmap.length}
          />
        </aside>
      </div>
    </main>
  );
}

function AnalyticsHero({
  eventTotal,
  sourceName,
  workflowTotal,
  onOpenProactivation,
  onOpenSetup,
}: {
  eventTotal: number;
  sourceName: string;
  workflowTotal: number;
  onOpenProactivation: () => void;
  onOpenSetup: () => void;
}) {
  return (
    <section className="border border-border bg-muted/30 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Analytics command center
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
            {sourceName} signal, product usage, and agent output in one place.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            PostHog keeps collecting the raw stream; Amend turns it into a readable product-ops
            dashboard for feedback, sources, automation, releases, and customer delivery.
          </p>
        </div>
        <div className="grid min-w-56 grid-cols-2 border border-border bg-background">
          <HeroStat label="Events" value={eventTotal} />
          <HeroStat label="Workflow" value={workflowTotal} />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-[opacity,scale] duration-200 hover:opacity-90 active:scale-[0.98] [&_svg]:size-3.5"
          onClick={onOpenProactivation}
        >
          <Sparkles />
          Agent funnel
        </button>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-semibold text-foreground transition-[background-color,scale] duration-200 hover:bg-muted active:scale-[0.98] [&_svg]:size-3.5"
          onClick={onOpenSetup}
        >
          <DatabaseZap />
          Connect sources
        </button>
      </div>
    </section>
  );
}

function MetricTile({ metric }: { metric: Metric }) {
  return (
    <div className="grid min-h-36 content-between gap-5 border-b border-border p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {metric.label}
        </span>
        <span className="grid size-8 place-items-center border border-border text-muted-foreground [&_svg]:size-4">
          {metric.icon}
        </span>
      </div>
      <div className="grid gap-2">
        <span className="font-mono text-3xl font-semibold tabular-nums">{metric.value}</span>
        <p className="text-xs leading-5 text-muted-foreground">{metric.detail}</p>
      </div>
    </div>
  );
}

function FunnelStep({
  count,
  detail,
  index,
  label,
  max,
}: {
  count: number;
  detail: string;
  index: number;
  label: string;
  max: number;
}) {
  const width = `${Math.max(8, Math.round((count / max) * 100))}%`;

  return (
    <div className="grid min-h-36 content-between gap-4 border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[0.65rem] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-2 text-sm font-semibold">{label}</h3>
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums">{count}</span>
      </div>
      <div className="grid gap-3">
        <div className="h-1.5 bg-muted">
          <div className="h-full bg-foreground" style={{ width }} />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-1 border-r border-border p-3 last:border-r-0">
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}
