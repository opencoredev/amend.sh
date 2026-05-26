import type { QueryCtx } from "./_generated/server";
import { workspaceSlug } from "./amendBackendUtils";
import {
  type BuildBriefsArgs,
  type ProjectScopeArgs,
  type SourceEventsArgs,
  type WorkspaceArgs,
  getAgentRunsForWorkspace,
  getAutomationDecisionsForWorkspace,
  getBuildBriefsForWorkspace,
  getDeliveryOutboxForWorkspace,
  getSourceEventsForWorkspace,
} from "./amendOperationalReadQueries";
import { getDashboardWorkspace, getWorkspaceRecord, requireDashboardUser } from "./amendWorkspace";

export async function getDeliveryOutboxHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
  return workspace ? await getDeliveryOutboxForWorkspace(ctx, workspace) : [];
}

export async function getDeliveryOutboxForApiHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
  return workspace ? await getDeliveryOutboxForWorkspace(ctx, workspace) : [];
}

export async function getAutomationDecisionsHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
  return workspace ? await getAutomationDecisionsForWorkspace(ctx, workspace) : [];
}

export async function getAutomationDecisionsForApiHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
  return workspace ? await getAutomationDecisionsForWorkspace(ctx, workspace) : [];
}

export async function getAgentRunsHandler(ctx: QueryCtx, args: ProjectScopeArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
  return workspace ? await getAgentRunsForWorkspace(ctx, workspace, args) : [];
}

export async function getAgentRunsForApiHandler(ctx: QueryCtx, args: ProjectScopeArgs) {
  const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
  return workspace ? await getAgentRunsForWorkspace(ctx, workspace, args) : [];
}

export async function getSourceEventsHandler(ctx: QueryCtx, args: SourceEventsArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
  return workspace ? await getSourceEventsForWorkspace(ctx, { ...args, workspace }) : [];
}

export async function getSourceEventsForApiHandler(ctx: QueryCtx, args: SourceEventsArgs) {
  const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
  return workspace ? await getSourceEventsForWorkspace(ctx, { ...args, workspace }) : [];
}

export async function getBuildBriefsHandler(ctx: QueryCtx, args: BuildBriefsArgs) {
  const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
  return workspace ? await getBuildBriefsForWorkspace(ctx, workspace, args) : [];
}

export async function getBuildBriefsForApiHandler(ctx: QueryCtx, args: BuildBriefsArgs) {
  const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
  return workspace ? await getBuildBriefsForWorkspace(ctx, workspace, args) : [];
}
