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

  // Switching top-level views resets the status filter. The posts and roadmap views
  // share a single `status` URL param, so without this a filter set on one (e.g.
  // "In Progress" on the roadmap) silently carries into the other and makes the
  // destination list look wrongly filtered — or empty — on arrival.
  const changeView = (view: DashboardView) =>
    setRoute({ feedback: null, item: null, status: "all", view });
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
      view: "inbox",
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
