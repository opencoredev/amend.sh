import type { ComposerSubmitPayload, StatusItem } from "@/components/post-composer-model";
import {
  boardValues,
  fallbackWorkspace,
  statusValues,
  viewValues,
} from "@/components/amend-dashboard-constants";
import type {
  BoardId,
  DashboardRoadmap,
  DashboardView,
  RoadmapStatus,
  RoadmapViewId,
  WorkspaceId,
} from "@/components/amend-dashboard-types";
import { slugPart } from "@/components/amend-dashboard-format";

export function feedbackStatusToRoadmapStatus(status: string): RoadmapStatus {
  if (status === "planned") return "next";
  if (status === "linked" || status === "triaged") return "progress";
  if (status === "shipped" || status === "closed") return "done";
  return "backlog";
}

export function roadmapStatusToRoadmapStatus(status: string): RoadmapStatus {
  if (status === "planned") return "next";
  if (status === "in_progress") return "progress";
  if (status === "shipped" || status === "closed") return "done";
  return "backlog";
}

export function roadmapStatusToPortalStatus(status: RoadmapStatus) {
  if (status === "next") return "planned";
  if (status === "progress") return "in_progress";
  if (status === "done") return "shipped";
  return "under_review";
}

export function roadmapStatusToComposerStatus(status: RoadmapStatus | null): StatusItem {
  if (status === "next") return "Planned";
  if (status === "progress") return "In Progress";
  if (status === "done") return "Completed";
  return "In Review";
}

export function normalizedPriority(value: string): "P0" | "P1" | "P2" | "P3" {
  return value === "P0" || value === "P1" || value === "P2" || value === "P3" ? value : "P2";
}

export function priorityLabel(value: string) {
  const labels: Record<string, string> = {
    P0: "Critical",
    P1: "High priority",
    P2: "Normal priority",
    P3: "Low priority",
  };
  return labels[normalizedPriority(value)] ?? "Normal priority";
}

export function persistedRoadmapKey(item: DashboardRoadmap) {
  return item.stableKey.startsWith("roadmap-feedback-")
    ? item.stableKey
    : `roadmap-${slugPart(item.title, "item")}`;
}

export function composerStatusToChangelogStatus(status: ComposerSubmitPayload["status"]) {
  if (status === "Completed") return "published" as const;
  if (status === "In Review") return "in_review" as const;
  if (status === "In Progress" || status === "Planned") return "scheduled" as const;
  return "draft" as const;
}

export function composerStatusToRoadmapStatus(status: ComposerSubmitPayload["status"]) {
  if (status === "Planned") return "planned" as const;
  if (status === "In Progress") return "in_progress" as const;
  if (status === "Completed") return "shipped" as const;
  if (status === "Rejected") return "closed" as const;
  return "under_review" as const;
}

export function normalizeView(value?: string): DashboardView {
  if (value === "members") return "settings";
  if (value === "share") return "posts";
  // The agent's Board + Drafts folded into the Inbox — keep old deep links alive.
  if (value === "board" || value === "drafts") return "inbox";
  return viewValues.includes(value as DashboardView) ? (value as DashboardView) : "posts";
}

export function normalizeBoard(value?: string): BoardId {
  return boardValues.includes(value as BoardId) ? (value as BoardId) : "feedback";
}

export function normalizeStatus(value?: string): RoadmapStatus | "all" {
  return statusValues.includes(value as RoadmapStatus | "all")
    ? (value as RoadmapStatus | "all")
    : "all";
}

export function normalizeRoadmapView(value?: string): RoadmapViewId {
  return value?.trim() || "main";
}

export function normalizeWorkspace(value?: string): WorkspaceId {
  return value || fallbackWorkspace.id;
}

export function statusTitle(status: RoadmapStatus | "all") {
  const titles: Record<RoadmapStatus | "all", string> = {
    all: "Posts",
    backlog: "Under Review",
    next: "Planned",
    progress: "In Progress",
    done: "Done",
  };
  return titles[status];
}

export function viewTitle(view: DashboardView) {
  const titles: Record<DashboardView, string> = {
    inbox: "Inbox",
    posts: "Feedback",
    roadmap: "Roadmap",
    changelog: "Changelog",
    memory: "Memory",
    connections: "Connections",
    settings: "Settings",
    setup: "Create project",
  };
  return titles[view];
}
