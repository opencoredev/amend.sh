import type { ReactElement } from "react";

export type RoadmapStatus = "backlog" | "next" | "progress" | "done";
export type ChangelogStatusFilter = "all" | "draft" | "in_review" | "scheduled" | "published";
export type DashboardView =
  | "posts"
  | "roadmap"
  | "changelog"
  | "analytics"
  | "proactivation"
  | "settings"
  | "setup";
export type SettingsSection = "accounts" | "automation" | "general" | "portal" | "services";
export type BoardId = "feature" | "bug" | "changelog" | "feedback";
export type WorkspaceId = string;
export type RoadmapViewId = string;

export type PortalSettings = {
  accentColor?: string;
  changelogVisibility: "private" | "public";
  feedbackMode: "authenticated" | "closed" | "open";
  headline?: string;
  intro?: string;
  roadmapVisibility: "private" | "public";
};

export type Workspace = {
  description?: string;
  id: WorkspaceId;
  initials: string;
  name: string;
  plan: string;
  portalSettings?: PortalSettings;
  repo: string;
  portal: string;
  visibility?: "private" | "public";
};

export type ProjectMenuItem = {
  description?: string;
  id: string;
  initials: string;
  logoUrl?: string;
  name: string;
  plan: string;
  portal: string;
  repo: string;
  sourceReady: boolean;
  websiteUrl?: string;
};

export type Board = {
  id: BoardId;
  name: string;
  description: string;
  icon: ReactElement;
};
