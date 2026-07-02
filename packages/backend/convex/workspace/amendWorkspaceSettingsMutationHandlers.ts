import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { demoWorkspace } from "../demo/amendDemoWorkspaceData";

import { normalizeWorkspace } from "../lib/amendNormalizers";
import { ensureDashboardBaseRecords, requireDashboardUser } from "./amendWorkspace";

// Cap persisted custom portal CSS so a workspace owner can't store unbounded
// (multi-megabyte) documents. Generous headroom over a real tweakcn-style export.
const MAX_CUSTOM_THEME_CSS_LENGTH = 50_000;

type PortalSettingsDoc = NonNullable<Doc<"workspaces">["portalSettings"]>;

type UpdatePortalSettingsArgs = {
  workspaceSlug?: string;
  accentColor?: string;
  changelogVisibility?: PortalSettingsDoc["changelogVisibility"];
  customThemeCss?: string;
  feedbackMode?: PortalSettingsDoc["feedbackMode"];
  headline?: string;
  intro?: string;
  roadmapVisibility?: PortalSettingsDoc["roadmapVisibility"];
  themeAppearance?: PortalSettingsDoc["themeAppearance"];
  themePreset?: string;
};

type UpdateWorkspaceArgs = {
  workspaceSlug: string;
  description?: string;
  name?: string;
  visibility?: Doc<"workspaces">["visibility"];
};

export async function updatePortalSettingsHandler(
  ctx: MutationCtx,
  args: UpdatePortalSettingsArgs,
) {
  const user = await requireDashboardUser(ctx);
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const current = workspace.portalSettings ?? demoWorkspace.portalSettings;
  if (
    args.customThemeCss !== undefined &&
    args.customThemeCss.length > MAX_CUSTOM_THEME_CSS_LENGTH
  ) {
    throw new Error(`Custom theme CSS exceeds the ${MAX_CUSTOM_THEME_CSS_LENGTH}-character limit`);
  }
  const next = {
    accentColor: args.accentColor ?? current.accentColor,
    changelogVisibility: args.changelogVisibility ?? current.changelogVisibility,
    customThemeCss: args.customThemeCss ?? current.customThemeCss,
    feedbackMode: args.feedbackMode ?? current.feedbackMode,
    headline: args.headline ?? current.headline,
    intro: args.intro ?? current.intro,
    roadmapVisibility: args.roadmapVisibility ?? current.roadmapVisibility,
    themeAppearance: args.themeAppearance ?? current.themeAppearance,
    themePreset: args.themePreset ?? current.themePreset,
  };

  await ctx.db.patch(workspace._id, {
    portalSettings: next,
    updatedAt: Date.now(),
  });

  const updated = await ctx.db.get(workspace._id);
  if (!updated) {
    throw new Error("Failed to update portal settings");
  }

  return normalizeWorkspace(updated);
}

export async function updateWorkspaceHandler(ctx: MutationCtx, args: UpdateWorkspaceArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);

  await ctx.db.patch(workspace._id, {
    ...(args.description === undefined ? {} : { description: args.description }),
    ...(args.name === undefined ? {} : { name: args.name }),
    ...(args.visibility === undefined ? {} : { visibility: args.visibility }),
    updatedAt: Date.now(),
  });

  const updated = await ctx.db.get(workspace._id);
  if (!updated) {
    throw new Error("Failed to update workspace");
  }
  return normalizeWorkspace(updated);
}
