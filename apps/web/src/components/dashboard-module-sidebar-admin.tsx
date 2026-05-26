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
  SidebarNavItem,
  SidebarNavList,
} from "@/components/dashboard-module-sidebar-primitives";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function SetupModuleSidebar({ onViewChange }: Pick<ModuleSidebarProps, "onViewChange">) {
  return (
    <SidebarFrame>
      <SidebarNavList>
        <SidebarNavItem
          active
          icon={<GitPullRequestArrow />}
          label="Connect source"
          onClick={() => onViewChange("setup")}
        />
      </SidebarNavList>
    </SidebarFrame>
  );
}

export function SettingsModuleSidebar({
  activeSettingsSection,
  onSettingsSectionChange,
}: Pick<ModuleSidebarProps, "activeSettingsSection" | "onSettingsSectionChange">) {
  return (
    <SidebarFrame>
      <SidebarNavList>
        <SidebarNavItem
          active={activeSettingsSection === "general"}
          icon={<Settings />}
          label="General"
          onClick={() => onSettingsSectionChange("general")}
        />
        <SidebarNavItem
          active={activeSettingsSection === "services"}
          icon={<GitPullRequestArrow />}
          label="Connected services"
          onClick={() => onSettingsSectionChange("services")}
        />
        <SidebarNavItem
          active={activeSettingsSection === "portal"}
          icon={<Globe />}
          label="Public portal"
          onClick={() => onSettingsSectionChange("portal")}
        />
        <SidebarNavItem
          active={activeSettingsSection === "automation"}
          icon={<DatabaseZap />}
          label="Automation"
          onClick={() => onSettingsSectionChange("automation")}
        />
        <SidebarNavItem
          active={activeSettingsSection === "accounts"}
          icon={<Users />}
          label="Accounts"
          onClick={() => onSettingsSectionChange("accounts")}
        />
      </SidebarNavList>
    </SidebarFrame>
  );
}

export function AnalyticsModuleSidebar({
  onSettingsSectionChange,
  onViewChange,
}: Pick<ModuleSidebarProps, "onSettingsSectionChange" | "onViewChange">) {
  return (
    <SidebarFrame>
      <SidebarNavList>
        <SidebarNavItem
          active
          icon={<ChartNoAxesCombined />}
          label="Overview"
          onClick={() => onViewChange("analytics")}
        />
        <SidebarNavItem
          icon={<Activity />}
          label="Agent funnel"
          onClick={() => onViewChange("proactivation")}
        />
        <SidebarNavItem
          icon={<DatabaseZap />}
          label="PostHog setup"
          onClick={() => {
            onSettingsSectionChange("services");
            onViewChange("settings");
          }}
        />
      </SidebarNavList>
    </SidebarFrame>
  );
}

export function ProactivationModuleSidebar({
  onSettingsSectionChange,
  onViewChange,
}: Pick<ModuleSidebarProps, "onSettingsSectionChange" | "onViewChange">) {
  return (
    <SidebarFrame>
      <SidebarNavList>
        <SidebarNavItem
          active
          icon={<Sparkles />}
          label="Run and review"
          onClick={() => onViewChange("proactivation")}
        />
        <SidebarNavItem
          icon={<DatabaseZap />}
          label="Automation rules"
          onClick={() => {
            onSettingsSectionChange("automation");
            onViewChange("settings");
          }}
        />
        <SidebarNavItem
          icon={<GitPullRequestArrow />}
          label="Source setup"
          onClick={() => onViewChange("setup")}
        />
      </SidebarNavList>
    </SidebarFrame>
  );
}
