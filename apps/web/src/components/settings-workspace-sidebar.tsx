import { Code2, DatabaseZap, Globe } from "lucide-react";

import { SettingsPanel, StatusRow } from "@/components/amend-dashboard-shared";
import type { ProjectMenuItem, WorkspaceSettingsData } from "@/components/amend-dashboard-types";

export function SettingsWorkspaceSidebar({
  activeProject,
  runtimeCommit,
  runtimeVersion,
  settings,
  updateCheckState,
}: {
  activeProject: ProjectMenuItem;
  runtimeCommit: string;
  runtimeVersion: string;
  settings: WorkspaceSettingsData | undefined;
  updateCheckState: string;
}) {
  return (
    <aside className="grid h-fit gap-4">
      <SettingsPanel icon={<Code2 />} title="Runtime">
        <StatusRow label="App version" value={runtimeVersion} />
        <StatusRow label="API version" value="v1" />
        <StatusRow label="Build" value={runtimeCommit} />
        <StatusRow label="Update checks" value={updateCheckState} />
      </SettingsPanel>
      <SettingsPanel icon={<Globe />} title="Domains">
        <StatusRow label="Project portal" value={activeProject.portal} />
      </SettingsPanel>
      <SettingsPanel icon={<DatabaseZap />} title="Rate limits">
        <StatusRow
          label="Website lookup"
          value={
            settings?.rateLimits?.projectWebsiteLookup
              ? `${settings.rateLimits.projectWebsiteLookup.rate}/${settings.rateLimits.projectWebsiteLookup.period}`
              : "12/minute"
          }
        />
        <StatusRow
          label="Burst capacity"
          value={String(settings?.rateLimits?.projectWebsiteLookup?.capacity ?? 4)}
        />
      </SettingsPanel>
    </aside>
  );
}
