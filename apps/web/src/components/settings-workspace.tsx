import type {
  ProjectMenuItem,
  SettingsSection,
  Workspace,
} from "@/components/amend-dashboard-types";
import { fallbackWorkspace } from "@/components/amend-dashboard-constants";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { ProjectLogo } from "@/components/project-logo";
import { SettingsWorkspaceSections } from "@/components/settings-workspace-panels";
import { SettingsAutoSaveIndicator } from "@/components/settings-workspace-toolbar";
import { useSettingsWorkspaceController } from "@/components/use-settings-workspace-controller";

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
    <DashboardWorkspaceSurface>
      <div className="amend-page-enter mx-auto w-full max-w-2xl px-6 py-8 md:px-8 md:py-10">
        {/* Identity — grounds every section in the project being configured. The
            autosave cue rides here now that the section nav lives in the header. */}
        <div className="mb-9 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#151518] ring-1 ring-white/[0.06] ring-inset">
              <ProjectLogo
                className="size-full"
                fallbackIconClassName="size-5"
                logoUrl={settings.logoUrl}
                websiteUrl={settings.websiteUrl}
              />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-tight text-foreground">
                {activeProject.name}
              </h1>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {activeProject.repo} · Project settings
              </p>
            </div>
          </div>
          <SettingsAutoSaveIndicator
            canSave={settings.canSave}
            isDirty={settings.isDirty}
            onRetry={settings.onRetrySave}
            status={settings.autoSaveStatus}
          />
        </div>

        <SettingsWorkspaceSections
          activeProject={activeProject}
          activeSection={activeSection}
          automation={settings.automation}
          canSave={settings.canSave}
          customThemeCss={settings.customThemeCss}
          description={settings.description}
          headline={settings.headline}
          intro={settings.intro}
          logoAction={settings.logoAction}
          logoFileInputRef={settings.logoFileInputRef}
          logoUrl={settings.logoUrl}
          name={settings.name}
          onLoadLogoFromWebsite={settings.onLoadLogoFromWebsite}
          onLogoFileChange={settings.onLogoFileChange}
          serviceRows={settings.serviceRows}
          settings={settings.settings}
          setAutomationRule={settings.setAutomationRule}
          setCustomThemeCss={settings.setCustomThemeCss}
          setDescription={settings.setDescription}
          setHeadline={settings.setHeadline}
          setIntro={settings.setIntro}
          setLogoUrl={settings.setLogoUrl}
          setName={settings.setName}
          setThemeAppearance={settings.setThemeAppearance}
          setThemePreset={settings.setThemePreset}
          setWebsiteUrl={settings.setWebsiteUrl}
          themeAppearance={settings.themeAppearance}
          themePreset={settings.themePreset}
          websiteUrl={settings.websiteUrl}
          workspaceSlug={workspace.id === fallbackWorkspace.id ? undefined : workspace.id}
        />
      </div>
    </DashboardWorkspaceSurface>
  );
}
