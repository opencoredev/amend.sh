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
  workspace,
}: {
  activeProject: ProjectMenuItem;
  activeSection: SettingsSection;
  workspace: Workspace;
}) {
  const settings = useSettingsWorkspaceController({ activeProject, workspace });

  return (
    <div className="t-panel-slide mx-auto grid max-w-6xl gap-6 p-4 py-6 md:p-8" data-open="true">
      <div className="min-w-0">
        <SettingsWorkspaceHeader
          activeProject={activeProject}
          logoUrl={settings.logoUrl}
          websiteUrl={settings.websiteUrl}
        />

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
