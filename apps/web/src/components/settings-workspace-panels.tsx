import type {
  ProjectMenuItem,
  SettingsSection,
  WorkspaceSettingsData,
} from "@/components/amend-dashboard-types";
import type { RefObject } from "react";
import type { PortalThemeAppearance } from "@/lib/portal-themes";
import { AccountsSettingsPanel } from "@/components/settings-workspace-accounts-panel";
import { AutomationSettingsPanel } from "@/components/settings-workspace-automation-panel";
import { GeneralSettingsPanel } from "@/components/settings-workspace-general-panel";
import { PortalSettingsPanel } from "@/components/settings-workspace-portal-panel";
import { ServicesSettingsPanel } from "@/components/settings-workspace-services-panel";
import type {
  LogoActionState,
  SettingsSavingState,
  SettingsServiceRow,
} from "@/components/settings-workspace-panel-types";

export type {
  LogoActionState,
  SettingsSavingState,
  SettingsServiceRow,
} from "@/components/settings-workspace-panel-types";
export { SettingsWorkspaceHeader } from "./settings-workspace-header";
export { SettingsWorkspaceSidebar } from "./settings-workspace-sidebar";

export function SettingsWorkspaceSections({
  activeProject,
  activeSection,
  canSave,
  customThemeCss,
  description,
  headline,
  intro,
  logoAction,
  logoFileInputRef,
  logoUrl,
  name,
  onAutomationSave,
  onLoadLogoFromWebsite,
  onLogoFileChange,
  onPortalSave,
  onProjectSave,
  saving,
  serviceRows,
  settings,
  setCustomThemeCss,
  setDescription,
  setHeadline,
  setIntro,
  setLogoUrl,
  setName,
  setThemeAppearance,
  setThemePreset,
  setWebsiteUrl,
  themeAppearance,
  themePreset,
  websiteUrl,
}: {
  activeProject: ProjectMenuItem;
  activeSection: SettingsSection;
  canSave: boolean;
  customThemeCss: string;
  description: string;
  headline: string;
  intro: string;
  logoAction: LogoActionState;
  logoFileInputRef: RefObject<HTMLInputElement | null>;
  logoUrl: string;
  name: string;
  onAutomationSave: () => void;
  onLoadLogoFromWebsite: () => void;
  onLogoFileChange: (file: File | undefined) => void;
  onPortalSave: () => void;
  onProjectSave: () => void;
  saving: SettingsSavingState;
  serviceRows: SettingsServiceRow[];
  settings: WorkspaceSettingsData | undefined;
  setCustomThemeCss: (value: string) => void;
  setDescription: (value: string) => void;
  setHeadline: (value: string) => void;
  setIntro: (value: string) => void;
  setLogoUrl: (value: string) => void;
  setName: (value: string) => void;
  setThemeAppearance: (value: PortalThemeAppearance) => void;
  setThemePreset: (value: string) => void;
  setWebsiteUrl: (value: string) => void;
  themeAppearance: PortalThemeAppearance;
  themePreset: string;
  websiteUrl: string;
}) {
  return (
    <div className="min-w-0">
      {activeSection === "general" ? (
        <GeneralSettingsPanel
          activeProject={activeProject}
          canSave={canSave}
          description={description}
          logoAction={logoAction}
          logoFileInputRef={logoFileInputRef}
          logoUrl={logoUrl}
          name={name}
          onLoadLogoFromWebsite={onLoadLogoFromWebsite}
          onLogoFileChange={onLogoFileChange}
          onProjectSave={onProjectSave}
          saving={saving}
          setDescription={setDescription}
          setLogoUrl={setLogoUrl}
          setName={setName}
          setWebsiteUrl={setWebsiteUrl}
          websiteUrl={websiteUrl}
        />
      ) : null}

      {activeSection === "services" ? <ServicesSettingsPanel serviceRows={serviceRows} /> : null}

      {activeSection === "portal" ? (
        <PortalSettingsPanel
          canSave={canSave}
          customThemeCss={customThemeCss}
          headline={headline}
          intro={intro}
          onPortalSave={onPortalSave}
          saving={saving}
          setCustomThemeCss={setCustomThemeCss}
          setHeadline={setHeadline}
          setIntro={setIntro}
          setThemeAppearance={setThemeAppearance}
          setThemePreset={setThemePreset}
          themeAppearance={themeAppearance}
          themePreset={themePreset}
        />
      ) : null}

      {activeSection === "automation" ? (
        <AutomationSettingsPanel
          canSave={canSave}
          onAutomationSave={onAutomationSave}
          saving={saving}
          settings={settings}
        />
      ) : null}

      {activeSection === "accounts" ? <AccountsSettingsPanel settings={settings} /> : null}
    </div>
  );
}
