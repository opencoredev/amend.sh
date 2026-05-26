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
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";

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
    <DashboardWorkspaceSurface className="min-h-0" contentClassName="min-h-[calc(100svh-8.5rem)] overflow-y-auto p-4 sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="grid gap-4">
          <AnalyticsHero
            eventTotal={eventTotal}
            onOpenProactivation={onOpenProactivation}
            onOpenSetup={onOpenSetup}
            sourceName={workspace.name}
            workflowTotal={workflowTotal}
          />

          <div className="grid gap-3 md:grid-cols-4">
            {metrics.map((metric) => (
              <MetricTile key={metric.label} metric={metric} />
            ))}
          </div>

          <section className="rounded-2xl bg-[#151518] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]">
            <SectionHeader
              eyebrow="Signal flow"
              icon={<ChartNoAxesCombined />}
              title="From raw events to shipped work"
            />
            <div className="mt-4 grid gap-2 lg:grid-cols-4">
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
    </DashboardWorkspaceSurface>
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
    <section className="rounded-2xl bg-[#151518] p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Analytics command center
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-snug">
            {sourceName} signal, product usage, and agent output in one place.
          </h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            PostHog keeps collecting the raw stream; Amend turns it into a readable product-ops
            dashboard for feedback, sources, automation, releases, and customer delivery.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-background/65 p-2 ring-1 ring-white/[0.04]">
          <HeroStat label="Events" value={eventTotal} />
          <HeroStat label="Workflow" value={workflowTotal} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-foreground px-3 text-xs font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75 [&_svg]:size-3.5"
          onClick={onOpenProactivation}
        >
          <Sparkles />
          Agent funnel
        </button>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-background/65 px-3 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.04] transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75 [&_svg]:size-3.5"
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
    <div className="grid min-h-32 content-between gap-4 rounded-2xl bg-[#151518] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {metric.label}
        </span>
        <span className="grid size-8 place-items-center rounded-lg bg-background/70 text-muted-foreground ring-1 ring-white/[0.045] [&_svg]:size-3.5">
          {metric.icon}
        </span>
      </div>
      <div>
        <span className="font-mono text-2xl font-semibold tabular-nums">{metric.value}</span>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{metric.detail}</p>
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
    <div className="grid min-h-32 content-between gap-3 rounded-xl bg-background/65 p-3 ring-1 ring-white/[0.035]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[0.6rem] text-muted-foreground/60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-1 text-xs font-semibold">{label}</h3>
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums">{count}</span>
      </div>
      <div className="grid gap-2">
        <div className="h-px bg-foreground/[0.08]">
          <div className="h-full bg-foreground" style={{ width }} />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid min-w-24 gap-1 rounded-xl bg-[#151518] px-4 py-3 ring-1 ring-white/[0.04]">
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}
