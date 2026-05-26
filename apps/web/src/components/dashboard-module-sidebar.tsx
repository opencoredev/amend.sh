import {
  ChangelogModuleSidebar,
  AnalyticsModuleSidebar,
  FeedbackModuleSidebar,
  ProactivationModuleSidebar,
  RoadmapModuleSidebar,
  SettingsModuleSidebar,
  SetupModuleSidebar,
} from "@/components/dashboard-module-sidebar-panels";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function ModuleSidebar(props: ModuleSidebarProps) {
  if (props.activeView === "roadmap") {
    return (
      <RoadmapModuleSidebar
        activeRoadmap={props.activeRoadmap}
        activeStatus={props.activeStatus}
        onRoadmapChange={props.onRoadmapChange}
        onStatusChange={props.onStatusChange}
        roadmapViews={props.roadmapViews}
      />
    );
  }

  if (props.activeView === "changelog") {
    return (
      <ChangelogModuleSidebar
        activeChangelogCategory={props.activeChangelogCategory}
        activeChangelogStatus={props.activeChangelogStatus}
        changelogEntries={props.changelogEntries}
        onChangelogCategoryChange={props.onChangelogCategoryChange}
        onChangelogStatusChange={props.onChangelogStatusChange}
      />
    );
  }

  if (props.activeView === "setup") {
    return <SetupModuleSidebar onViewChange={props.onViewChange} />;
  }

  if (props.activeView === "analytics") {
    return (
      <AnalyticsModuleSidebar
        onSettingsSectionChange={props.onSettingsSectionChange}
        onViewChange={props.onViewChange}
      />
    );
  }

  if (props.activeView === "settings") {
    return (
      <SettingsModuleSidebar
        activeSettingsSection={props.activeSettingsSection}
        onSettingsSectionChange={props.onSettingsSectionChange}
      />
    );
  }

  if (props.activeView === "proactivation") {
    return (
      <ProactivationModuleSidebar
        onSettingsSectionChange={props.onSettingsSectionChange}
        onViewChange={props.onViewChange}
      />
    );
  }

  return (
    <FeedbackModuleSidebar
      activeStatus={props.activeStatus}
      feedbackPosts={props.feedbackPosts}
      onStatusChange={props.onStatusChange}
    />
  );
}
