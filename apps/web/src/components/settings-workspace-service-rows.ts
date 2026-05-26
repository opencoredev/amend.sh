import type { ProjectMenuItem } from "@/components/amend-dashboard-types";
import type { SettingsServiceRow } from "@/components/settings-workspace-panels";

export function settingsServiceRows(activeProject: ProjectMenuItem): SettingsServiceRow[] {
  const repositoryConnected =
    activeProject.sourceReady && activeProject.repo !== "Feedback board only";

  return [
    {
      label: "GitHub source",
      value: repositoryConnected ? activeProject.repo : "Connect repository",
      state: repositoryConnected ? "Connected" : "Required",
    },
    { label: "Feedback board", value: activeProject.portal, state: "Enabled" },
    { label: "Discord", value: "Signal channel", state: "Planned" },
    { label: "Slack", value: "Signal and update channel", state: "Planned" },
    { label: "Linear", value: "Roadmap signal", state: "Planned" },
  ];
}
