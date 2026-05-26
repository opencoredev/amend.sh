export type { DashboardAuthUser } from "./amendWorkspaceAccess";
export {
  dashboardAuthIdentity,
  filterProjectDocs,
  getDashboardProject,
  getDashboardWorkspace,
  getDashboardWorkspaceSlugForUser,
  getWorkspaceRecord,
  getWritableDashboardProject,
  latestDocs,
  requireDashboardUser,
  requireDashboardWorkspace,
} from "./amendWorkspaceAccess";
export {
  createDashboardWorkspaceForProject,
  ensureChannelPlaceholders,
  ensureDashboardBaseRecords,
  ensureDemoWorkspace,
  ensureWorkspacePlanAndRules,
  requireExistingWorkspace,
} from "./amendWorkspaceProvisioning";
