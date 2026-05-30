import { cn } from "@amend/ui/lib/utils";
import { DatabaseZap, GitPullRequestArrow, Globe, Settings, Users } from "lucide-react";
import type { ReactElement } from "react";

import type {
  ProjectMenuItem,
  SettingsSection,
  Workspace,
} from "@/components/amend-dashboard-types";
import {
  SettingsWorkspaceHeader,
  SettingsWorkspaceSections,
  SettingsWorkspaceSidebar,
} from "@/components/settings-workspace-panels";
import { useSettingsWorkspaceController } from "@/components/use-settings-workspace-controller";

const amendRuntimeVersion = import.meta.env.VITE_AMEND_VERSION ?? "0.1.0-beta";
const amendRuntimeCommit =
  import.meta.env.VITE_AMEND_COMMIT_SHA ?? import.meta.env.VITE_AMEND_BUILD_SHA ?? "local";
const amendUpdateCheckState =
  import.meta.env.VITE_AMEND_DISABLE_VERSION_CHECK === "1" ? "Disabled" : "CLI opt-in";

export function SettingsWorkspace({
  activeProject,
  activeSection,
  onSectionChange,
  workspace,
}: {
  activeProject: ProjectMenuItem;
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  workspace: Workspace;
}) {
  const settings = useSettingsWorkspaceController({ activeProject, workspace });

  return (
    <div className="mx-auto grid max-w-6xl gap-5 p-4 py-5 md:p-8">
      <div className="min-w-0">
        <SettingsWorkspaceHeader
          activeProject={activeProject}
          logoUrl={settings.logoUrl}
          websiteUrl={settings.websiteUrl}
        />

        <SettingsSectionNav activeSection={activeSection} onSectionChange={onSectionChange} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <SettingsWorkspaceSections
            activeProject={activeProject}
            activeSection={activeSection}
            canSave={settings.canSave}
            description={settings.description}
            headline={settings.headline}
            intro={settings.intro}
            logoAction={settings.logoAction}
            logoFileInputRef={settings.logoFileInputRef}
            logoUrl={settings.logoUrl}
            name={settings.name}
            onAutomationSave={settings.onAutomationSave}
            onLoadLogoFromWebsite={settings.onLoadLogoFromWebsite}
            onLogoFileChange={settings.onLogoFileChange}
            onPortalSave={settings.onPortalSave}
            onProjectSave={settings.onProjectSave}
            saving={settings.saving}
            serviceRows={settings.serviceRows}
            settings={settings.settings}
            setDescription={settings.setDescription}
            setHeadline={settings.setHeadline}
            setIntro={settings.setIntro}
            setLogoUrl={settings.setLogoUrl}
            setName={settings.setName}
            setWebsiteUrl={settings.setWebsiteUrl}
            websiteUrl={settings.websiteUrl}
          />

          <SettingsWorkspaceSidebar
            activeProject={activeProject}
            runtimeCommit={amendRuntimeCommit}
            runtimeVersion={amendRuntimeVersion}
            settings={settings.settings}
            updateCheckState={amendUpdateCheckState}
          />
        </div>
      </div>
    </div>
  );
}

const SETTINGS_SECTIONS: Array<{
  icon: ReactElement;
  id: SettingsSection;
  label: string;
}> = [
  { id: "general", icon: <Settings />, label: "General" },
  { id: "services", icon: <GitPullRequestArrow />, label: "Services" },
  { id: "portal", icon: <Globe />, label: "Portal" },
  { id: "automation", icon: <DatabaseZap />, label: "Automation" },
  { id: "accounts", icon: <Users />, label: "Accounts" },
];

function SettingsSectionNav({
  activeSection,
  onSectionChange,
}: {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}) {
  return (
    <nav className="mb-4 flex gap-1 overflow-x-auto rounded-2xl bg-[#151518] p-1 ring-1 ring-white/[0.055]">
      {SETTINGS_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors duration-150 ease-linear active:opacity-75 [&_svg]:size-3.5 [&_svg]:shrink-0",
            activeSection === section.id
              ? "bg-[#232327] text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] ring-1 ring-white/[0.06]"
              : "text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground",
          )}
          onClick={() => onSectionChange(section.id)}
        >
          {section.icon}
          {section.label}
        </button>
      ))}
    </nav>
  );
}
