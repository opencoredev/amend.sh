import { ClipboardList, DatabaseZap, GitPullRequestArrow, Radio, Sparkles } from "lucide-react";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { DashboardAgentActivity } from "@/components/amend-dashboard-types";
import { formatDate, formatState } from "@/components/amend-dashboard-utils";

export function ProactivationActivityFeed({ activity }: { activity: DashboardAgentActivity[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Agent activity</h3>
        <span className="text-xs text-muted-foreground">{activity.length} recent events</span>
      </div>
      <div className="overflow-hidden border border-border bg-card">
        {activity.length > 0 ? (
          activity.map((item) => (
            <article
              key={`${item.kind}-${item.id}`}
              className="grid gap-3 border-b border-border p-4 last:border-b-0 md:grid-cols-[8rem_minmax(0,1fr)_9rem] md:items-center"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ActivityIcon kind={item.kind} />
                {formatState(item.kind)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {item.summary}
                </p>
              </div>
              <div className="text-xs text-muted-foreground md:text-right">
                <p>{formatState(item.state)}</p>
                <p className="mt-1">{formatDate(item.timestamp)}</p>
              </div>
            </article>
          ))
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

function ActivityIcon({ kind }: { kind: DashboardAgentActivity["kind"] }) {
  if (kind === "run") return <Sparkles className="size-3.5" />;
  if (kind === "decision") return <DatabaseZap className="size-3.5" />;
  if (kind === "review") return <ClipboardList className="size-3.5" />;
  if (kind === "notification") return <Radio className="size-3.5" />;
  return <GitPullRequestArrow className="size-3.5" />;
}
