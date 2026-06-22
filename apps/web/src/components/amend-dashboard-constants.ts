import type {
  BoardId,
  DashboardView,
  RoadmapStatus,
  RoadmapView,
  Workspace,
} from "@/components/amend-dashboard-types";

export const viewValues: DashboardView[] = [
  "inbox",
  "posts",
  "roadmap",
  "changelog",
  "memory",
  "connections",
  "settings",
  "account",
  "setup",
];
export const boardValues: BoardId[] = ["feature", "bug", "changelog", "feedback"];
export const statusValues: Array<RoadmapStatus | "all"> = [
  "all",
  "backlog",
  "next",
  "progress",
  "done",
];

export const fallbackWorkspace: Workspace = {
  id: "workspace",
  initials: "AM",
  name: "Amend",
  plan: "Workspace",
  repo: "Connect GitHub",
  portal: "Portal not configured",
};

export const fallbackRoadmapView: RoadmapView = {
  id: "main",
  name: "Main roadmap",
  description:
    "Every roadmap item Amend knows about, tied back to feedback, GitHub source, and changelog evidence.",
  entries: [],
};
