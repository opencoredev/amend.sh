import type {
  DashboardView,
  RoadmapStatus,
  RoadmapViewId,
  SettingsSection,
  WorkspaceId,
} from "@/components/amend-dashboard-types";
import type { DashboardRoutePatch } from "@/components/use-amend-dashboard-route";

export function useAmendDashboardNavigation({
  activeView,
  resetWorkspaceMenu,
  setActiveProject,
  setActiveSettingsSection,
  setRoute,
  workspaceId,
}: {
  activeView: DashboardView;
  resetWorkspaceMenu: () => void;
  setActiveProject: (id: string) => void;
  setActiveSettingsSection: (section: SettingsSection) => void;
  setRoute: (next: DashboardRoutePatch) => void;
  workspaceId: WorkspaceId;
}) {
  const addProject = () => {
    setRoute({ view: "setup" });
    resetWorkspaceMenu();
  };

  const changeProject = (id: string) => {
    if (id === "new-project") {
      setActiveProject("");
      setRoute({ view: "setup" });
    } else {
      setActiveProject(id);
    }
    resetWorkspaceMenu();
  };

  const changeView = (view: DashboardView) => setRoute({ feedback: null, item: null, view });
  const changeSearch = (q: string) => setRoute({ q });
  // Touching a filter/sub-nav while a detail is open returns to the (filtered) list.
  const changeStatus = (status: RoadmapStatus | "all") =>
    setRoute({ feedback: null, item: null, status, view: activeView });
  const changeRoadmap = (roadmap: RoadmapViewId) =>
    setRoute({ feedback: null, item: null, roadmap, status: "all", view: "roadmap" });
  const openSetup = () => setRoute({ view: "setup" });

  const openSettingsSection = (section: SettingsSection) => {
    setActiveSettingsSection(section);
    setRoute({ view: "settings" });
  };

  const projectCreated = (projectSlug: string, workspaceSlug?: string) => {
    setActiveProject(projectSlug);
    setRoute({
      view: "posts",
      workspace: workspaceSlug ?? workspaceId,
    });
  };

  return {
    addProject,
    changeProject,
    changeRoadmap,
    changeSearch,
    changeStatus,
    changeView,
    openSettingsSection,
    openSetup,
    projectCreated,
  };
}
