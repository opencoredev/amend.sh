"use client";

import { Activity } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

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

  const chartData = topEvents.slice(0, 10).map((item) => ({
    name: formatState(item.event).split(" ").slice(0, 2).join(" "),
    count: item.count,
    full: formatState(item.event),
  }));

  return (
    <section className="border border-border">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-7 shrink-0 place-items-center border border-border bg-muted/30 text-muted-foreground [&_svg]:size-3.5">
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

      {chartData.length > 0 ? (
        <div className="border-b border-border px-4 pb-3 pt-4">
          <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Top events
          </p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              barCategoryGap="20%"
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: "currentColor", className: "text-muted-foreground" }}
                height={20}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="border border-border bg-popover px-3 py-2 shadow-lg">
                      <p className="text-xs font-semibold">{d?.full}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {payload[0]?.value} events
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={0}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 0
                        ? "var(--color-foreground)"
                        : `oklch(from var(--color-foreground) l c h / ${Math.max(0.2, 1 - i * 0.08)})`
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex min-h-28 items-center justify-center border-b border-border">
          <p className="text-xs text-muted-foreground">
            SDK, portal, and REST events will appear here
          </p>
        </div>
      )}

      {analytics?.topCategories?.length ? (
        <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
          {analytics.topCategories.slice(0, 5).map((category) => (
            <span
              className="border border-border px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
              key={category.category}
            >
              {formatState(category.category)} · {category.count}
            </span>
          ))}
        </div>
      ) : null}

      {recentEvents.length ? (
        <div className="grid gap-px bg-border">
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
