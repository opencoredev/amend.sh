import { cn } from "@amend/ui/lib/utils";
import { DatabaseZap, GitPullRequestArrow, Globe, Settings, Users } from "@/lib/icons";
import type { ComponentType } from "react";

import type {
  ProjectMenuItem,
  SettingsSection,
  Workspace,
} from "@/components/amend-dashboard-types";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { ProjectLogo } from "@/components/project-logo";
import {
  SettingsWorkspaceSections,
  SettingsWorkspaceSidebar,
} from "@/components/settings-workspace-panels";
import { useSettingsWorkspaceController } from "@/components/use-settings-workspace-controller";

const amendRuntimeVersion = import.meta.env.VITE_AMEND_VERSION ?? "0.1.0-beta";
const amendRuntimeCommit =
  import.meta.env.VITE_AMEND_COMMIT_SHA ?? import.meta.env.VITE_AMEND_BUILD_SHA ?? "local";
const amendUpdateCheckState =
  import.meta.env.VITE_AMEND_DISABLE_VERSION_CHECK === "1" ? "Disabled" : "CLI opt-in";

const SECTION_TABS: Array<{
  id: SettingsSection;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "general", label: "General", icon: Settings },
  { id: "services", label: "Connected services", icon: GitPullRequestArrow },
  { id: "portal", label: "Public portal", icon: Globe },
  { id: "automation", label: "Automation", icon: DatabaseZap },
  { id: "accounts", label: "Accounts", icon: Users },
];

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
    <DashboardWorkspaceSurface contentClassName="px-4 py-6 md:px-7 md:py-7">
      <div className="t-panel-slide w-full" data-open="true">
        {/* Identity */}
        <div className="flex items-center gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-card ring-1 ring-white/[0.06]">
            <ProjectLogo
              className="size-full"
              fallbackIconClassName="size-5"
              logoUrl={settings.logoUrl}
              websiteUrl={settings.websiteUrl}
            />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold leading-tight">{activeProject.name}</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {activeProject.repo} · Project settings
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-white/[0.06]">
          {SECTION_TABS.map((tab) => {
            const active = activeSection === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={cn(
                  "relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-linear active:opacity-75 [&_svg]:size-4",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => onSectionChange(tab.id)}
              >
                <Icon />
                {tab.label}
                {active ? (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Active section */}
        <div
          className={cn(
            "mt-6 grid items-start gap-4",
            activeSection === "general" && "lg:grid-cols-[minmax(0,1fr)_19rem]",
          )}
        >
          <SettingsWorkspaceSections
            activeProject={activeProject}
            activeSection={activeSection}
            canSave={settings.canSave}
            customThemeCss={settings.customThemeCss}
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
          />

          {activeSection === "general" ? (
            <SettingsWorkspaceSidebar
              activeProject={activeProject}
              runtimeCommit={amendRuntimeCommit}
              runtimeVersion={amendRuntimeVersion}
              settings={settings.settings}
              updateCheckState={amendUpdateCheckState}
            />
          ) : null}
        </div>
      </div>
    </DashboardWorkspaceSurface>
  );
}
