/**
 * INSIGHTS — the "is the agent earning its keep" view.
 *
 * Wears the same chrome as the other agent views (PageHeader + workspace
 * surface). The dithering effect is the data, not the backdrop: each KPI carries
 * a dithered sparkline and the Signal-vs-Shipped hero chart is filled with the
 * same grain. Every number derives from the same needs/changelog/memory the
 * board renders, so Insights reconciles with the rest of the console. Color does
 * the semantic work — gold = demand, success-green = shipped.
 */
import { cn } from "@amend/ui/lib/utils";
import { type ReactNode, Suspense, lazy, useState } from "react";

import {
  EmptyState,
  ErrorState,
  SkeletonBar,
  StrengthMeter,
} from "@/components/amend-agent-shared";
import { PageHeader } from "@/components/amend-agent-chrome";
import {
  DitheredAreaChart,
  DitheredSparkline,
  usePrefersReducedMotion,
} from "@/components/amend-dithered-area";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { ToolbarBar, ToolbarGroup, ToolbarPill } from "@/components/dashboard-toolbar";
import { Activity, ArrowUpRight, ChartNoAxesCombined, Radio, type LucideIcon } from "@/lib/icons";
import type { InsightsDemandItem, InsightsSummary } from "@/lib/amend-contract";
import { useInsights } from "@/lib/amend-data";

// Recharts is heavy (~135 kB gzip) and only the channel bar chart needs it, so
// load it on demand. The chart well has a fixed height — no layout shift.
const ChannelBarChart = lazy(() =>
  import("@/components/amend-insights-charts").then((m) => ({ default: m.ChannelBarChart })),
);

function ChartFallback() {
  return <SkeletonBar className="h-full w-full rounded-xl" />;
}

type RangeKey = "6w" | "12w";

const PANEL =
  "rounded-2xl bg-amend-inset shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05]";

// One identity color per KPI, used for both its number's trend and its sparkline.
const SIGNAL_COLOR = "#ef9836";
const SHIPPED_COLOR = "#67e19f";
const REACHED_COLOR = "#5b9bf5";
const NOISE_COLOR = "#ef7a72";

function formatNum(value: number): string {
  return value.toLocaleString("en-US");
}

type Kpi = {
  label: string;
  value: number;
  hint: string;
  spark: number[];
  color: string;
  deltaPct?: number;
};

function buildKpis(insights: InsightsSummary): Kpi[] {
  return [
    {
      label: "Signal captured",
      value: insights.signalCaptured,
      hint: "mentions ingested this quarter",
      spark: insights.sparks.signal,
      color: SIGNAL_COLOR,
      deltaPct: insights.signalTrendPct,
    },
    {
      label: "Shipped",
      value: insights.shipped,
      hint: "releases tied back to demand",
      spark: insights.sparks.shipped,
      color: SHIPPED_COLOR,
    },
    {
      label: "People reached",
      value: insights.peopleReached,
      hint: "notified when their ask shipped",
      spark: insights.sparks.reached,
      color: REACHED_COLOR,
    },
    {
      label: "Noise filtered",
      value: insights.noiseFiltered,
      hint: "per month, by memory rules",
      spark: insights.sparks.noise,
      color: NOISE_COLOR,
    },
  ];
}

function TrendBadge({ pct }: { pct: number }) {
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-[0.7rem] font-semibold tabular-nums",
        up ? "text-amend-success" : "text-destructive",
      )}
      title="Captured signal, recent 6 weeks vs the prior 6"
    >
      <ArrowUpRight className={cn("size-3", up ? "" : "rotate-90")} />
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

function KpiCell({ kpi, index }: { kpi: Kpi; index: number }) {
  return (
    <div
      className={cn(
        "flex flex-col px-5 pt-5 pb-4",
        // Hairline separators that read in both the 2-col (mobile) and 4-col
        // (desktop) layouts.
        index % 2 === 1 && "border-l border-white/[0.05]",
        index >= 2 && "border-t border-white/[0.05] lg:border-t-0",
        index > 0 && "lg:border-l lg:border-white/[0.05]",
      )}
    >
      <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {kpi.label}
      </span>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="font-mono text-[1.7rem] font-semibold leading-none tabular-nums text-foreground">
          {formatNum(kpi.value)}
        </span>
        {kpi.deltaPct !== undefined ? <TrendBadge pct={kpi.deltaPct} /> : null}
      </div>
      <p className="mt-1.5 text-[0.7rem] leading-4 text-muted-foreground/80">{kpi.hint}</p>
      <div className="mt-3 -mb-1">
        <DitheredSparkline color={kpi.color} height={38} values={kpi.spark} />
      </div>
    </div>
  );
}

function InsightsHero({ insights }: { insights: InsightsSummary }) {
  const kpis = buildKpis(insights);
  return (
    <section className={cn("overflow-hidden", PANEL)}>
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KpiCell index={index} key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}

function ChartPanel({
  title,
  eyebrow,
  icon: Icon,
  right,
  children,
}: {
  title: string;
  eyebrow?: string;
  icon: LucideIcon;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={cn("p-4", PANEL)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.06] ring-inset [&_svg]:size-3.5">
            <Icon />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {eyebrow ? <p className="text-[0.7rem] text-muted-foreground">{eyebrow}</p> : null}
          </div>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

function SeriesLegend() {
  return (
    <div className="flex items-center gap-3 text-[0.7rem] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-amend-warm" />
        Signal
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-amend-success" />
        Shipped
      </span>
    </div>
  );
}

function DemandPanel({ items }: { items: InsightsDemandItem[] }) {
  const max = Math.max(...items.map((item) => item.people), 1);
  return (
    <section className={cn("p-4", PANEL)}>
      <header className="mb-4 flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-lg bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.06] ring-inset [&_svg]:size-3.5">
          <ChartNoAxesCombined />
        </span>
        <h2 className="text-sm font-semibold text-foreground">Top demand</h2>
      </header>
      <ul className="grid gap-3.5">
        {items.map((item) => {
          const width = `${Math.max(6, Math.round((item.people / max) * 100))}%`;
          return (
            <li key={item.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[0.82rem] text-foreground/90">{item.title}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {item.people}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2.5">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span className="block h-full rounded-full bg-amend-warm" style={{ width }} />
                </span>
                <StrengthMeter className="shrink-0" strength={item.strength} withLabel={false} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function InsightsToolbar({
  range,
  onRangeChange,
}: {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
}) {
  return (
    <ToolbarBar>
      <ToolbarGroup>
        <ToolbarPill active={range === "6w"} onClick={() => onRangeChange("6w")}>
          6 weeks
        </ToolbarPill>
        <ToolbarPill active={range === "12w"} onClick={() => onRangeChange("12w")}>
          12 weeks
        </ToolbarPill>
      </ToolbarGroup>
    </ToolbarBar>
  );
}

function CenteredSurface({ children }: { children: ReactNode }) {
  return <div className="grid min-h-0 flex-1 place-items-center p-6">{children}</div>;
}

function InsightsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className={cn("grid grid-cols-2 lg:grid-cols-4", PANEL)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="px-5 pt-5 pb-4" key={i}>
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="mt-3 h-7 w-16" />
            <SkeletonBar className="mt-2 h-3 w-28" />
            <SkeletonBar className="mt-3 h-9 w-full" />
          </div>
        ))}
      </div>
      <div className={cn("p-4", PANEL)}>
        <SkeletonBar className="h-4 w-40" />
        <SkeletonBar className="mt-4 h-[248px] w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className={cn("p-4", PANEL)}>
          <SkeletonBar className="h-4 w-44" />
          <SkeletonBar className="mt-4 h-[192px] w-full" />
        </div>
        <div className={cn("p-4", PANEL)}>
          <SkeletonBar className="h-4 w-28" />
          <div className="mt-4 grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBar className="h-6 w-full" key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AmendInsightsScreen() {
  const { data, isLoading, isError } = useInsights();
  const reduced = usePrefersReducedMotion();
  const [range, setRange] = useState<RangeKey>("12w");

  const hasData = !isLoading && !isError && data !== undefined && data.signalCaptured > 0;
  const timeline = data ? (range === "6w" ? data.timeline.slice(-6) : data.timeline) : [];

  return (
    <>
      <PageHeader
        className="relative z-20 bg-background"
        filters={hasData ? <InsightsToolbar onRangeChange={setRange} range={range} /> : undefined}
        icon={ChartNoAxesCombined}
        title="Insights"
      />

      <DashboardWorkspaceSurface contentClassName="overflow-y-auto p-4 sm:p-5">
        {isError ? (
          <CenteredSurface>
            <ErrorState />
          </CenteredSurface>
        ) : isLoading ? (
          <InsightsSkeleton />
        ) : !data || data.signalCaptured === 0 ? (
          <CenteredSurface>
            <EmptyState
              hint="As soon as the agent starts ingesting feedback across your channels, the trends, sources, and demand it finds show up here."
              icon={ChartNoAxesCombined}
              title="No signal to chart yet"
            />
          </CenteredSurface>
        ) : (
          <div className="grid gap-4">
            <InsightsHero insights={data} />

            <ChartPanel
              eyebrow={`Last ${timeline.length} weeks`}
              icon={Activity}
              right={<SeriesLegend />}
              title="Signal vs shipped"
            >
              <DitheredAreaChart timeline={timeline} />
            </ChartPanel>

            <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              <ChartPanel
                eyebrow="Mentions by channel"
                icon={Radio}
                title="Where signal comes from"
              >
                <div className="h-[208px]">
                  <Suspense fallback={<ChartFallback />}>
                    <ChannelBarChart animate={!reduced} data={data.channels} />
                  </Suspense>
                </div>
              </ChartPanel>

              <DemandPanel items={data.topDemand} />
            </div>
          </div>
        )}
      </DashboardWorkspaceSurface>
    </>
  );
}
