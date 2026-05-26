import { Code2, GitPullRequestArrow } from "lucide-react";

import { SettingsPanel, StatusRow } from "@/components/amend-dashboard-shared";
import type { DashboardBuildBrief, DashboardSourceEvent } from "@/components/amend-dashboard-types";
import { formatState, providerLabel } from "@/components/amend-dashboard-utils";
import { InspectorBlock } from "@/components/proactivation-inspector-block";

export function BuildBriefsPanel({ buildBriefs }: { buildBriefs: DashboardBuildBrief[] }) {
  return (
    <SettingsPanel icon={<Code2 />} title="Build briefs">
      <div className="grid gap-3">
        {buildBriefs.slice(0, 2).map((brief) => (
          <div key={brief.recordId ?? brief.stableKey} className="grid gap-3">
            <InspectorBlock
              meta={`${brief.priority} / ${formatState(brief.status)}`}
              sourceLinks={brief.sourceLinks}
              summary={brief.evidenceSummary}
              title={brief.title}
            />
            <div className="grid gap-1 text-xs text-muted-foreground">
              {brief.acceptanceCriteria.slice(0, 2).map((criterion) => (
                <p key={criterion} className="border-l border-border/70 pl-3 leading-5">
                  {criterion}
                </p>
              ))}
            </div>
          </div>
        ))}
        {buildBriefs.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Approved agent briefs will show the customer problem, source evidence, scope, and
            acceptance criteria before coding starts.
          </p>
        ) : null}
      </div>
    </SettingsPanel>
  );
}

export function SourceEvidencePanel({ sources }: { sources: DashboardSourceEvent[] }) {
  return (
    <SettingsPanel icon={<GitPullRequestArrow />} title="Source evidence">
      <div className="grid gap-2">
        {sources.slice(0, 4).map((source) => (
          <a
            key={source.recordId ?? source.externalId}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="grid gap-1 rounded-md border border-border/70 bg-background/70 p-3 text-xs transition-colors duration-150 ease-linear hover:border-foreground/35 hover:bg-muted/45"
          >
            <span className="truncate font-semibold">{source.title}</span>
            <span className="truncate text-muted-foreground">
              {providerLabel(source.provider)} / {formatState(source.kind)}
            </span>
          </a>
        ))}
        {sources.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Connect GitHub or submit channel feedback to give the agent evidence.
          </p>
        ) : null}
      </div>
    </SettingsPanel>
  );
}

export function SetupChecklistPanel() {
  return (
    <SettingsPanel icon={<Code2 />} title="Setup checklist">
      <StatusRow label="GitHub source channel" value="Connect repo or app install" />
      <StatusRow label="Feedback board" value="Built in channel" />
      <StatusRow label="SDK install" value="Customer app channel" />
      <StatusRow label="Side panel" value="Embed channel" />
      <StatusRow label="Crof / Kimi" value="Server-side provider" />
      <StatusRow label="Email delivery" value="Outbound integration" />
      <StatusRow label="Custom domains" value="Portal and API hosts" />
      <StatusRow label="API security" value="Owner token and webhooks" />
      <StatusRow label="Launch gate" value="Readiness before production" />
    </SettingsPanel>
  );
}
