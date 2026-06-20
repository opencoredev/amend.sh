import { cn } from "@amend/ui/lib/utils";

import type { RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusTitle } from "@/components/amend-dashboard-utils";

const STATUS_STYLE: Record<RoadmapStatus, { dot: string; pill: string }> = {
  backlog: { dot: "bg-amber-400", pill: "bg-amber-400/10 text-amber-300 ring-amber-400/25" },
  next: { dot: "bg-blue-400", pill: "bg-blue-400/10 text-blue-300 ring-blue-400/25" },
  progress: { dot: "bg-violet-400", pill: "bg-violet-400/10 text-violet-300 ring-violet-400/25" },
  done: { dot: "bg-emerald-400", pill: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25" },
};

export function statusDotColor(status: RoadmapStatus) {
  return STATUS_STYLE[status].dot;
}

/**
 * Status chip used across the feedback list, roadmap cards, and detail views —
 * a single shared source so colors stay consistent everywhere. Pass
 * `hideLabelOnMobile` in dense list rows where the label would crowd the layout.
 */
export function StatusPill({
  status,
  className,
  hideLabelOnMobile = false,
}: {
  status: RoadmapStatus;
  className?: string;
  hideLabelOnMobile?: boolean;
}) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ring-1",
        style.pill,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} />
      <span className={hideLabelOnMobile ? "hidden sm:inline" : undefined}>
        {statusTitle(status)}
      </span>
    </span>
  );
}
