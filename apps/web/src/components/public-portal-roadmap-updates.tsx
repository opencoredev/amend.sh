import { Bell, FolderOpen, GitPullRequestArrow, Road } from "lucide-react";

import { EmptyState } from "@/components/portal-list-elements";
import type { PortalChangelog, PortalRoadmap } from "@/components/public-portal-types";

export function PortalRoadmapSection({ roadmap }: { roadmap: PortalRoadmap[] }) {
  return (
    <section id="roadmap" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Road className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Product roadmap</h2>
        </div>
        {roadmap.length === 0 ? (
          <EmptyState
            icon={Road}
            title="Roadmap is empty"
            text="New planned work will appear here once requests are linked to source evidence."
          />
        ) : (
          <div className="divide-y">
            {roadmap.map((item) => (
              <article key={item.stableKey} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs text-foreground">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.impact}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {item.feedbackCount} feedback links · {item.target ?? "no target"}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function PortalUpdatesSection({ changelog }: { changelog: PortalChangelog[] }) {
  return (
    <section id="updates" className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Product updates</h2>
      </div>
      {changelog.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No updates found"
          text="Shipped source-linked updates will appear here after publication."
        />
      ) : (
        <div className="grid gap-3">
          {changelog.map((item) => (
            <article key={item.stableKey} className="rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs text-foreground">
                  {item.category}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {item.sourceLinks.slice(0, 3).map((link) => (
                  <a
                    key={link.externalId}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:text-foreground"
                  >
                    <GitPullRequestArrow className="size-3.5" />
                    {link.title}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
