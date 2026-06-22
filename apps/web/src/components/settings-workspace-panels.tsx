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
import { TagsSettingsPanel } from "@/components/settings-workspace-tags-panel";
import type {
  AutomationRulesDraft,
  LogoActionState,
  SettingsServiceRow,
} from "@/components/settings-workspace-panel-types";

export type {
  AutomationRulesDraft,
  LogoActionState,
  SettingsServiceRow,
} from "@/components/settings-workspace-panel-types";

export function SettingsWorkspaceSections({
  activeProject,
  activeSection,
  automation,
  canSave,
  customThemeCss,
  description,
  headline,
  intro,
  logoAction,
  logoFileInputRef,
  logoUrl,
  name,
  onLoadLogoFromWebsite,
  onLogoFileChange,
  serviceRows,
  settings,
  setAutomationRule,
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
  workspaceSlug,
}: {
  activeProject: ProjectMenuItem;
  activeSection: SettingsSection;
  automation: AutomationRulesDraft;
  canSave: boolean;
  customThemeCss: string;
  description: string;
  headline: string;
  intro: string;
  logoAction: LogoActionState;
  logoFileInputRef: RefObject<HTMLInputElement | null>;
  logoUrl: string;
  name: string;
  onLoadLogoFromWebsite: () => void;
  onLogoFileChange: (file: File | undefined) => void;
  serviceRows: SettingsServiceRow[];
  settings: WorkspaceSettingsData | undefined;
  setAutomationRule: (key: keyof AutomationRulesDraft, value: boolean) => void;
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
  workspaceSlug?: string;
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
          setDescription={setDescription}
          setLogoUrl={setLogoUrl}
          setName={setName}
          setWebsiteUrl={setWebsiteUrl}
          settings={settings}
          websiteUrl={websiteUrl}
        />
      ) : null}

      {activeSection === "services" ? <ServicesSettingsPanel serviceRows={serviceRows} /> : null}

      {activeSection === "portal" ? (
        <PortalSettingsPanel
          customThemeCss={customThemeCss}
          headline={headline}
          intro={intro}
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
          automation={automation}
          canSave={canSave}
          setAutomationRule={setAutomationRule}
        />
      ) : null}

      {activeSection === "accounts" ? <AccountsSettingsPanel settings={settings} /> : null}

      {activeSection === "tags" ? <TagsSettingsPanel workspaceSlug={workspaceSlug} /> : null}
    </div>
  );
}
