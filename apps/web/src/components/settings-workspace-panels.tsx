import type {
  ProjectMenuItem,
  SettingsSection,
  WorkspaceSettingsData,
} from "@/components/amend-dashboard-types";
import type { RefObject } from "react";
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
  setDescription,
  setHeadline,
  setIntro,
  setLogoUrl,
  setName,
  setWebsiteUrl,
  websiteUrl,
}: {
  activeProject: ProjectMenuItem;
  activeSection: SettingsSection;
  canSave: boolean;
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
  setDescription: (value: string) => void;
  setHeadline: (value: string) => void;
  setIntro: (value: string) => void;
  setLogoUrl: (value: string) => void;
  setName: (value: string) => void;
  setWebsiteUrl: (value: string) => void;
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
          headline={headline}
          intro={intro}
          onPortalSave={onPortalSave}
          saving={saving}
          setHeadline={setHeadline}
          setIntro={setIntro}
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
