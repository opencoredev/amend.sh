import {
  Activity,
  ChartNoAxesCombined,
  DatabaseZap,
  GitPullRequestArrow,
  Globe,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import {
  SidebarFrame,
  SidebarItem,
  SidebarSection,
  SidebarTitle,
} from "@/components/dashboard-module-sidebar-primitives";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function SetupModuleSidebar({ onViewChange }: Pick<ModuleSidebarProps, "onViewChange">) {
  return (
    <SidebarFrame>
      <SidebarTitle title="Setup" />
      <SidebarSection title="Project">
        <SidebarItem
          active
          icon={<GitPullRequestArrow />}
          label="Connect source"
          onClick={() => onViewChange("setup")}
        />
      </SidebarSection>
    </SidebarFrame>
  );
}

export function SettingsModuleSidebar({
  activeSettingsSection,
  onSettingsSectionChange,
}: Pick<ModuleSidebarProps, "activeSettingsSection" | "onSettingsSectionChange">) {
  return (
    <SidebarFrame>
      <SidebarTitle title="Settings" />
      <SidebarSection title="Project settings">
        <SidebarItem
          active={activeSettingsSection === "general"}
          icon={<Settings />}
          label="General"
          onClick={() => onSettingsSectionChange("general")}
        />
        <SidebarItem
          active={activeSettingsSection === "services"}
          icon={<GitPullRequestArrow />}
          label="Connected services"
          onClick={() => onSettingsSectionChange("services")}
        />
        <SidebarItem
          active={activeSettingsSection === "portal"}
          icon={<Globe />}
          label="Public portal"
          onClick={() => onSettingsSectionChange("portal")}
        />
        <SidebarItem
          active={activeSettingsSection === "automation"}
          icon={<DatabaseZap />}
          label="Automation"
          onClick={() => onSettingsSectionChange("automation")}
        />
        <SidebarItem
          active={activeSettingsSection === "accounts"}
          icon={<Users />}
          label="Accounts"
          onClick={() => onSettingsSectionChange("accounts")}
        />
      </SidebarSection>
    </SidebarFrame>
  );
}

export function AnalyticsModuleSidebar({
  onSettingsSectionChange,
  onViewChange,
}: Pick<ModuleSidebarProps, "onSettingsSectionChange" | "onViewChange">) {
  return (
    <SidebarFrame>
      <SidebarTitle title="Analytics" />
      <SidebarSection title="In-house dashboards">
        <SidebarItem
          active
          icon={<ChartNoAxesCombined />}
          label="Overview"
          onClick={() => onViewChange("analytics")}
        />
        <SidebarItem
          icon={<Activity />}
          label="Agent funnel"
          onClick={() => onViewChange("proactivation")}
        />
        <SidebarItem
          icon={<DatabaseZap />}
          label="PostHog setup"
          onClick={() => {
            onSettingsSectionChange("services");
            onViewChange("settings");
          }}
        />
      </SidebarSection>
    </SidebarFrame>
  );
}

export function ProactivationModuleSidebar({
  onSettingsSectionChange,
  onViewChange,
}: Pick<ModuleSidebarProps, "onSettingsSectionChange" | "onViewChange">) {
  return (
    <SidebarFrame>
      <SidebarTitle title="Proactivation" />
      <SidebarSection title="Command center">
        <SidebarItem
          active
          icon={<Sparkles />}
          label="Run and review"
          onClick={() => onViewChange("proactivation")}
        />
        <SidebarItem
          icon={<DatabaseZap />}
          label="Automation rules"
          onClick={() => {
            onSettingsSectionChange("automation");
            onViewChange("settings");
          }}
        />
        <SidebarItem
          icon={<GitPullRequestArrow />}
          label="Source setup"
          onClick={() => onViewChange("setup")}
        />
      </SidebarSection>
    </SidebarFrame>
  );
}
