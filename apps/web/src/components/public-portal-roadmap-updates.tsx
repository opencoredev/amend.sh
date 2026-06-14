import { Bell, FolderOpen, GitPullRequestArrow, Map } from "@/lib/icons";

import { EmptyState, PORTAL_CHIP, PORTAL_SURFACE } from "@/components/portal-list-elements";
import type { PortalChangelog, PortalRoadmap } from "@/components/public-portal-types";

function SectionHeader({ icon: Icon, title }: { icon: typeof Bell; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <Icon className="size-4 text-primary" />
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  );
}

export function PortalRoadmapSection({ roadmap }: { roadmap: PortalRoadmap[] }) {
  return (
    <section id="roadmap" className={`scroll-mt-4 ${PORTAL_SURFACE}`}>
      <SectionHeader icon={Map} title="Product roadmap" />
      {roadmap.length === 0 ? (
        <EmptyState
          icon={Map}
          title="Roadmap is empty"
          text="New planned work appears here once requests are linked to source evidence."
        />
      ) : (
        <ul className="divide-y divide-border">
          {roadmap.map((item) => (
            <li key={item.stableKey}>
              <article className="px-4 py-4 transition-colors duration-150 ease-linear hover:bg-muted/50">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                  <span className={PORTAL_CHIP}>{item.status}</span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.impact}</p>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  {item.feedbackCount} feedback links · {item.target ?? "no target"}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PortalUpdatesSection({ changelog }: { changelog: PortalChangelog[] }) {
  return (
    <section id="updates" className={`scroll-mt-4 ${PORTAL_SURFACE}`}>
      <SectionHeader icon={Bell} title="Product updates" />
      {changelog.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No updates yet"
          text="Shipped source-linked updates appear here after publication."
        />
      ) : (
        <ul className="divide-y divide-border">
          {changelog.map((item) => (
            <li key={item.stableKey}>
              <article className="px-4 py-4 transition-colors duration-150 ease-linear hover:bg-muted/50">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                  <span className={PORTAL_CHIP}>{item.category}</span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                {item.sourceLinks.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {item.sourceLinks.slice(0, 3).map((link) => (
                      <a
                        key={link.externalId}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1 text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground"
                      >
                        <GitPullRequestArrow className="size-3.5" />
                        {link.title}
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
