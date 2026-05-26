import { ExternalLink } from "lucide-react";

import type { SourceLink } from "@/components/amend-dashboard-types";

export function InspectorBlock({
  meta,
  sourceLinks,
  summary,
  title,
}: {
  meta: string;
  sourceLinks: SourceLink[];
  summary: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {meta}
      </p>
      <h4 className="mt-2 text-sm font-semibold leading-5">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{summary}</p>
      <div className="mt-4 grid gap-2">
        {sourceLinks.slice(0, 3).map((link) => (
          <a
            key={link.externalId ?? link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-9 items-center justify-between gap-3 rounded-md border border-border/70 bg-background/70 px-3 text-xs text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/35 hover:bg-muted/45 hover:text-foreground"
          >
            <span className="truncate">{link.title}</span>
            <ExternalLink className="size-3" />
          </a>
        ))}
      </div>
    </div>
  );
}
