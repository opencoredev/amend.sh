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

/**
 * Views hidden during the 3-view beta (Inbox · Connections · Memory + Settings/Account).
 * Their screens/code stay intact — these are only gated out of the nav and routing.
 */
export const BETA_DISABLED_VIEWS = new Set<DashboardView>(["posts", "roadmap", "changelog"]);
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
