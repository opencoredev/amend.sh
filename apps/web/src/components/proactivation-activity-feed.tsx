import { cn } from "@amend/ui/lib/utils";
import { ClipboardList, DatabaseZap, GitPullRequestArrow, Radio, Sparkles } from "lucide-react";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { DashboardAgentActivity } from "@/components/amend-dashboard-types";
import { formatDate, formatState } from "@/components/amend-dashboard-utils";

export function ProactivationActivityFeed({ activity }: { activity: DashboardAgentActivity[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Agent activity
        </h3>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {activity.length} events
        </span>
      </div>
      <div className="border border-border">
        {activity.length > 0 ? (
          <div className="grid gap-px bg-border">
            {activity.map((item) => (
              <article
                key={`${item.kind}-${item.id}`}
                className="grid grid-cols-[7rem_minmax(0,1fr)] items-start bg-card"
              >
                <div className="flex h-full flex-col justify-start border-r border-border px-3 py-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ActivityIcon kind={item.kind} />
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em]">
                      {formatState(item.kind)}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[0.6rem] text-muted-foreground/70">
                    {formatDate(item.timestamp)}
                  </div>
                  <StateChip state={item.state} />
                </div>
                <div className="min-w-0 px-4 py-3">
                  <p className="truncate text-xs font-semibold">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-[0.7rem] leading-5 text-muted-foreground">
                    {item.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyModule
            copy="The agent ledger will fill as channels receive feedback, GitHub work ships, or you run the agent."
            icon={<Sparkles />}
            title="No agent activity yet"
          />
        )}
      </div>
    </section>
  );
}

function StateChip({ state }: { state: string }) {
  const isPositive = ["completed", "applied", "approved", "published"].includes(state);
  const isWarning = ["pending", "needs_review", "attention"].includes(state);
  return (
    <span
      className={cn(
        "mt-2 w-fit px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide",
        isPositive && "bg-emerald-500/10 text-emerald-500",
        isWarning && "bg-amber-500/10 text-amber-500",
        !isPositive && !isWarning && "bg-muted text-muted-foreground",
      )}
    >
      {formatState(state)}
    </span>
  );
}

function ActivityIcon({ kind }: { kind: DashboardAgentActivity["kind"] }) {
  if (kind === "run") return <Sparkles className="size-3" />;
  if (kind === "decision") return <DatabaseZap className="size-3" />;
  if (kind === "review") return <ClipboardList className="size-3" />;
  if (kind === "notification") return <Radio className="size-3" />;
  return <GitPullRequestArrow className="size-3" />;
}
