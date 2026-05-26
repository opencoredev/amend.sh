import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { workspaceSlug } from "./amendBackendUtils";
import type { RecordFeedbackInteractionArgs } from "./amendFeedbackTypes";
import { ensureBaseRecords } from "./amendSeed";
import type { DashboardAuthUser } from "./amendWorkspace";
import { getWritableDashboardProject } from "./amendWorkspace";
import { authComponent } from "./auth";

export async function recordFeedbackInteractionHandler(
  ctx: MutationCtx,
  args: RecordFeedbackInteractionArgs,
) {
  const now = Date.now();
  const authUser = (await authComponent.safeGetAuthUser(ctx)) as DashboardAuthUser | null;
  const authUserId = authUser?.userId ?? authUser?.user?.id ?? authUser?._id;
  const actorId = args.externalUserId ?? authUserId;
  const actorEmail = args.email ?? authUser?.user?.email;
  const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
  const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
  const feedback = await ctx.db
    .query("feedbackItems")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspace._id).eq("stableKey", args.feedbackKey),
    )
    .unique();

  if (!feedback) {
    throw new Error("Feedback item not found");
  }

  if (args.kind === "vote" && (actorId || actorEmail)) {
    const existingVote = await findExistingVote(ctx, {
      actorEmail,
      actorId,
      feedbackKey: feedback.stableKey,
      workspaceId: workspace._id,
    });
    if (existingVote) {
      return await removeExistingVote(ctx, {
        args,
        existingVoteId: existingVote._id,
        feedbackId: feedback._id,
        feedbackKey: feedback.stableKey,
        now,
        votes: Math.max(feedback.votes - 1, 0),
        workspaceId: workspace._id,
        actorId,
      });
    }
  }

  const interactionId = await ctx.db.insert("feedbackInteractions", {
    workspaceId: workspace._id,
    ...((feedback.projectId ?? project?._id)
      ? { projectId: feedback.projectId ?? project?._id }
      : {}),
    feedbackItemId: feedback._id,
    feedbackKey: feedback.stableKey,
    kind: args.kind,
    source: args.source ?? "rest",
    createdAt: now,
    ...(actorId ? { externalUserId: actorId } : {}),
    ...(actorEmail ? { email: actorEmail } : {}),
    ...(args.body ? { body: args.body } : {}),
    ...(args.reaction ? { reaction: args.reaction } : {}),
  });

  const votes = args.kind === "vote" ? feedback.votes + 1 : feedback.votes;
  await ctx.db.patch(feedback._id, {
    ...(args.kind === "vote" ? { votes } : {}),
    updatedAt: now,
  });

  await ctx.db.insert("eventRecords", {
    workspaceId: workspace._id,
    event: eventForInteractionKind(args.kind),
    ...(actorId ? { externalUserId: actorId } : {}),
    metadata: {
      feedbackKey: feedback.stableKey,
      interactionId,
      ...(args.body ? { body: args.body } : {}),
      ...(args.reaction ? { reaction: args.reaction } : {}),
    },
    source: args.source ?? "rest",
    createdAt: now,
  });

  return {
    feedbackKey: feedback.stableKey,
    interactionId,
    kind: args.kind,
    votes,
  };
}

async function findExistingVote(
  ctx: MutationCtx,
  input: {
    actorEmail?: string;
    actorId?: string;
    feedbackKey: string;
    workspaceId: Id<"workspaces">;
  },
) {
  return (
    await ctx.db
      .query("feedbackInteractions")
      .withIndex("by_workspace_and_feedbackKey", (q) =>
        q.eq("workspaceId", input.workspaceId).eq("feedbackKey", input.feedbackKey),
      )
      .collect()
  ).find(
    (interaction) =>
      interaction.kind === "vote" &&
      ((input.actorId && interaction.externalUserId === input.actorId) ||
        (!input.actorId && input.actorEmail && interaction.email === input.actorEmail)),
  );
}

async function removeExistingVote(
  ctx: MutationCtx,
  input: {
    actorId?: string;
    args: RecordFeedbackInteractionArgs;
    existingVoteId: Id<"feedbackInteractions">;
    feedbackId: Id<"feedbackItems">;
    feedbackKey: string;
    now: number;
    votes: number;
    workspaceId: Id<"workspaces">;
  },
) {
  await ctx.db.delete(input.existingVoteId);
  await ctx.db.patch(input.feedbackId, {
    votes: input.votes,
    updatedAt: input.now,
  });
  await ctx.db.insert("eventRecords", {
    workspaceId: input.workspaceId,
    event: "vote_removed",
    ...(input.actorId ? { externalUserId: input.actorId } : {}),
    metadata: {
      feedbackKey: input.feedbackKey,
      interactionId: input.existingVoteId,
    },
    source: input.args.source ?? "rest",
    createdAt: input.now,
  });

  return {
    feedbackKey: input.feedbackKey,
    interactionId: input.existingVoteId,
    kind: input.args.kind,
    votes: input.votes,
  };
}

function eventForInteractionKind(kind: RecordFeedbackInteractionArgs["kind"]) {
  return kind === "vote" ? "vote_added" : kind === "comment" ? "comment_added" : "reaction_added";
}
