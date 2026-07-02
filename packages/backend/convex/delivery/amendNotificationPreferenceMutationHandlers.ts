import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { workspaceSlug } from "../lib/amendBackendUtils";
import { normalizeNotificationPreference } from "./amendNotifications";
import { ensureBaseRecords } from "../demo/amendSeed";

type UpsertNotificationPreferenceArgs = {
  workspaceSlug?: string;
  externalUserId?: string;
  email?: string;
  accountId?: string;
  mode: Doc<"notificationPreferences">["mode"];
  unsubscribed?: boolean;
  digestDay?: string;
  digestHour?: number;
};

export async function upsertNotificationPreferenceHandler(
  ctx: MutationCtx,
  args: UpsertNotificationPreferenceArgs,
) {
  const now = Date.now();
  const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
  const existing = args.externalUserId
    ? await ctx.db
        .query("notificationPreferences")
        .withIndex("by_workspace_and_externalUserId", (q) =>
          q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId),
        )
        .unique()
    : args.email
      ? await ctx.db
          .query("notificationPreferences")
          .withIndex("by_workspace_and_email", (q) =>
            q.eq("workspaceId", workspace._id).eq("email", args.email),
          )
          .unique()
      : null;

  const patch = {
    ...(args.accountId ? { accountId: args.accountId } : {}),
    ...(args.digestDay ? { digestDay: args.digestDay } : {}),
    ...(args.digestHour === undefined ? {} : { digestHour: args.digestHour }),
    ...(args.email ? { email: args.email } : {}),
    ...(args.externalUserId ? { externalUserId: args.externalUserId } : {}),
    mode: args.mode,
    unsubscribed: args.unsubscribed ?? args.mode === "muted",
    updatedAt: now,
  };

  const recordId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("notificationPreferences", {
        workspaceId: workspace._id,
        ...patch,
        createdAt: now,
      });
  const preference = await ctx.db.get(recordId);
  if (!preference) {
    throw new Error("Failed to save notification preference");
  }
  return normalizeNotificationPreference(preference);
}
