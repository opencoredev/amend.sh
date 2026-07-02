import { workspaceAutomationTables } from "./schemaWorkspaceAutomationTables";
import { workspaceCoreTables } from "./schemaWorkspaceCoreTables";
import { workspaceIntegrationTables } from "./schemaWorkspaceIntegrationTables";
import { proactiveTables } from "./schemaProactiveTables";
import { workspaceSourceTables } from "./schemaWorkspaceSourceTables";

export const workspaceSchemaTables = {
  ...workspaceCoreTables,
  ...workspaceSourceTables,
  ...workspaceAutomationTables,
  ...workspaceIntegrationTables,
  ...proactiveTables,
};
