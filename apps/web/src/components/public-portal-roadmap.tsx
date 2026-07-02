import { cn } from "@amend/ui/lib/utils";
import { useState } from "react";

import { statusMeta } from "@/components/amend-dashboard-status";
import {
  priorityLabel,
  roadmapStatusToRoadmapStatus,
} from "@/components/amend-dashboard-status-utils";
import type { RoadmapStatus } from "@/components/amend-dashboard-types";
import { ToolbarPill } from "@/components/dashboard-toolbar";
import { PortalSurface } from "@/components/public-portal-shared";
import type { PortalRoadmap } from "@/components/public-portal-types";
import { ChevronUp, ExternalLink, Inbox, Map as MapIcon, Sparkles } from "@/lib/icons";

const COLUMN_ORDER = Object.keys(statusMeta) as RoadmapStatus[];

function RoadmapScore({ count }: { count: number }) {
  return (
    <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 text-xs font-semibold text-foreground/90 ring-1 ring-white/[0.07]">
      <ChevronUp className="size-3.5 text-muted-foreground" />
      {count}
    </span>
  );
}

function RoadmapCard({ item }: { item: PortalRoadmap }) {
  const primarySource = item.sourceLinks[0];
  return (
    <article className="rounded-xl bg-amend-inset p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.045]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-semibold leading-5">{item.title}</h3>
        <RoadmapScore count={item.feedbackCount} />
      </div>
      {item.impact ? (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.impact}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-lg bg-background/70 px-2 py-1 ring-1 ring-white/[0.04]">
          <Sparkles className="size-3" />
          {priorityLabel(item.priority)}
        </span>
        {item.target ? (
          <span className="rounded-lg bg-background/70 px-2 py-1 ring-1 ring-white/[0.04]">
            {item.target}
          </span>
        ) : null}
        {primarySource ? (
          <a
            href={primarySource.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-1 truncate transition-colors duration-150 ease-linear hover:text-foreground"
          >
            <ExternalLink className="size-3 shrink-0" />
            <span className="truncate">{primarySource.title ?? "Evidence"}</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function PortalRoadmapView({ roadmap }: { roadmap: PortalRoadmap[] }) {
  const [active, setActive] = useState<RoadmapStatus | "all">("all");
  const columns = active === "all" ? COLUMN_ORDER : [active];
  const cardsFor = (status: RoadmapStatus) =>
    roadmap.filter((item) => roadmapStatusToRoadmapStatus(item.status) === status);

  if (roadmap.length === 0) {
    return (
      <div className="py-5">
        <h1 className="text-lg font-semibold tracking-tight">Roadmap</h1>
        <PortalSurface className="mt-4 min-h-[calc(100svh-11rem)]">
          <div className="grid place-items-center px-6 py-20 text-center">
            <MapIcon className="size-7 text-muted-foreground/30" />
            <h3 className="mt-3 text-sm font-semibold">The roadmap is taking shape</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Planned and in-progress work appears here once requests are linked to source evidence.
            </p>
          </div>
        </PortalSurface>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-tight">Roadmap</h1>
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarPill
            active={active === "all"}
            count={roadmap.length}
            onClick={() => setActive("all")}
          >
            All
          </ToolbarPill>
          {COLUMN_ORDER.map((status) => (
            <ToolbarPill
              key={status}
              active={active === status}
              count={cardsFor(status).length}
              onClick={() => setActive(status)}
            >
              {statusMeta[status].label}
            </ToolbarPill>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "mt-4 flex gap-3 overflow-x-auto pb-2",
          active !== "all" && "flex-col overflow-visible",
        )}
      >
        {columns.map((status) => {
          const cards = cardsFor(status);
          const meta = statusMeta[status];
          return (
            <section
              key={status}
              className={cn(
                "flex min-h-[calc(100svh-12rem)] flex-col rounded-2xl bg-background/65 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] ring-1 ring-white/[0.04]",
                active === "all" ? "min-w-[240px] flex-1" : "w-full",
              )}
            >
              <div className="flex min-h-12 items-center gap-2 px-3.5">
                <span className="inline-flex items-center gap-2 text-xs font-semibold [&_svg]:size-3.5">
                  {meta.icon}
                  {meta.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground/70">
                  {cards.length}
                </span>
              </div>
              <div className="grid gap-1.5 p-2.5 pt-0">
                {cards.length > 0 ? (
                  cards.map((item) => <RoadmapCard key={item.stableKey} item={item} />)
                ) : (
                  <div className="grid min-h-28 place-items-center text-center">
                    <div>
                      <Inbox className="mx-auto size-5 text-muted-foreground/25" />
                      <p className="mt-2 text-xs text-muted-foreground/50">
                        No {meta.label.toLowerCase()} posts
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
