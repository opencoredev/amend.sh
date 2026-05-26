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
  setActiveSettingsSection,
  setRoute,
  workspaceId,
}: {
  activeView: DashboardView;
  resetWorkspaceMenu: () => void;
  setActiveSettingsSection: (section: SettingsSection) => void;
  setRoute: (next: DashboardRoutePatch) => void;
  workspaceId: WorkspaceId;
}) {
  const addProject = () => {
    setRoute({ view: "setup" });
    resetWorkspaceMenu();
  };

  const changeProject = (id: string) => {
    setRoute(id === "new-project" ? { project: "", view: "setup" } : { project: id });
    resetWorkspaceMenu();
  };

  const changeView = (view: DashboardView) => setRoute({ view });
  const changeSearch = (q: string) => setRoute({ q });
  const changeStatus = (status: RoadmapStatus | "all") => setRoute({ status, view: activeView });
  const changeRoadmap = (roadmap: RoadmapViewId) =>
    setRoute({ roadmap, status: "all", view: "roadmap" });
  const openSetup = () => setRoute({ view: "setup" });

  const openSettingsSection = (section: SettingsSection) => {
    setActiveSettingsSection(section);
    setRoute({ view: "settings" });
  };

  const projectCreated = (projectSlug: string, workspaceSlug?: string) => {
    setRoute({
      project: projectSlug,
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
