import { Activity } from "lucide-react";

import { formatDate, formatState } from "@/components/amend-dashboard-format";
import type { DashboardOverview } from "@/components/amend-dashboard-types";

type AnalyticsOverview = NonNullable<DashboardOverview["analytics"]>;

export function ProactivationAnalyticsPanel({
  analytics,
}: {
  analytics: AnalyticsOverview | undefined;
}) {
  const topEvents = analytics?.topEvents ?? [];
  const recentEvents = analytics?.recentEvents ?? [];

  const maxCount = topEvents.length > 0 ? Math.max(...topEvents.map((e) => e.count)) : 1;
  const chartItems = topEvents.slice(0, 10);

  return (
    <section className="rounded-lg border border-border/80 bg-card shadow-sm shadow-black/10">
      <div className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-md border border-border/80 bg-muted/60 text-muted-foreground [&_svg]:size-3.5">
            <Activity />
          </span>
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Analytics
            </p>
            <h3 className="text-xs font-semibold">Event capture</h3>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <AnalyticsStat label="Events" value={analytics?.totalEvents ?? 0} />
          <AnalyticsStat label="Users" value={analytics?.uniqueUsers ?? 0} />
          <AnalyticsStat label="Accounts" value={analytics?.uniqueAccounts ?? 0} />
        </div>
      </div>

      {chartItems.length > 0 ? (
        <div className="border-b border-border/70 px-4 pb-4 pt-3">
          <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Top events
          </p>
          <div className="flex h-20 items-end gap-1">
            {chartItems.map((item, i) => {
              const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const opacity = Math.max(0.2, 1 - i * 0.07);
              return (
                <div
                  key={item.event}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                >
                  <div
                    className="w-full min-h-[2px] rounded-t-sm bg-foreground transition-opacity duration-150"
                    style={{ height: `${pct}%`, opacity }}
                  />
                  <span className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/80 bg-popover px-2 py-1 text-[0.6rem] font-semibold opacity-0 shadow transition-opacity duration-150 ease-in-out group-hover:opacity-100">
                    {formatState(item.event)}
                    <span className="ml-1.5 font-mono text-muted-foreground">{item.count}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex gap-1">
            {chartItems.map((item) => (
              <div key={item.event} className="flex-1 overflow-hidden">
                <p className="truncate text-center text-[0.55rem] text-muted-foreground/60">
                  {formatState(item.event).split(" ")[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-28 items-center justify-center border-b border-border/70">
          <p className="text-xs text-muted-foreground">
            SDK, portal, and REST events will appear here
          </p>
        </div>
      )}

      {analytics?.topCategories?.length ? (
        <div className="flex flex-wrap gap-1.5 border-b border-border/70 px-4 py-3">
          {analytics.topCategories.slice(0, 5).map((category) => (
            <span
              className="rounded-md border border-border/70 bg-background/50 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
              key={category.category}
            >
              {formatState(category.category)} · {category.count}
            </span>
          ))}
        </div>
      ) : null}

      {recentEvents.length ? (
        <div className="grid gap-px bg-border/70">
          {recentEvents.slice(0, 4).map((item) => (
            <div
              className="flex items-center justify-between gap-3 bg-card px-4 py-2.5 text-xs"
              key={`${item.event}-${item.createdAt}`}
            >
              <span className="truncate font-medium">{formatState(item.event)}</span>
              <div className="flex shrink-0 items-center gap-3 text-muted-foreground">
                <span className="hidden truncate sm:block">
                  {item.externalUserId ?? item.accountId ?? item.updateKey ?? item.source}
                </span>
                <span className="tabular-nums">{formatDate(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function AnalyticsStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <p className="font-mono text-base font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-0.5 text-[0.6rem] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
