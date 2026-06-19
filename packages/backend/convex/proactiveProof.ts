import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { strengthForProof } from "./proactiveClassifier";

export async function resolvePersonForEvidence(
  ctx: MutationCtx,
  args: {
    accountId?: string;
    channel: Doc<"evidence">["sourceChannel"];
    email?: string;
    handle?: string;
    name?: string;
    workspaceId: Id<"workspaces">;
  },
) {
  const email = args.email?.trim().toLowerCase();
  const handle = args.handle?.trim().toLowerCase();
  const accountId = args.accountId?.trim();
  const now = Date.now();

  if (email) {
    const existing = await ctx.db
      .query("persons")
      .withIndex("by_workspace_and_email", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("verifiedEmail", email),
      )
      .unique();
    if (existing) return existing._id;
  }

  if (accountId) {
    const existing = await ctx.db
      .query("persons")
      .withIndex("by_workspace_and_accountId", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("accountId", accountId),
      )
      .unique();
    if (existing) return existing._id;
  }

  if (handle) {
    const identity = await ctx.db
      .query("identityHandles")
      .withIndex("by_workspace_and_provider_and_handle", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("provider", args.channel).eq("handle", handle),
      )
      .unique();
    if (identity?.verified) return identity.personId;
  }

  const personId = await ctx.db.insert("persons", {
    workspaceId: args.workspaceId,
    displayName: args.name?.trim() || handle || email || "Unknown requester",
    ...(email ? { verifiedEmail: email } : {}),
    ...(accountId ? { accountId } : {}),
    paying: Boolean(accountId),
    createdAt: now,
    updatedAt: now,
  });

  if (handle) {
    await ctx.db.insert("identityHandles", {
      workspaceId: args.workspaceId,
      personId,
      provider: args.channel,
      handle,
      verified: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  return personId;
}

export async function recomputeNeedProof(ctx: MutationCtx, needId: Id<"needs">) {
  const need = await ctx.db.get(needId);
  if (!need) return;
  const evidence = await ctx.db
    .query("evidence")
    .withIndex("by_need", (q) => q.eq("needId", needId))
    .collect();
  const personIds = new Set<string>();
  const anonymousKeys = new Set<string>();
  const sources = new Map<Doc<"evidence">["sourceChannel"], number>();
  let payingPeople = 0;
  const payingPersonIds = new Set<string>();

  for (const item of evidence) {
    sources.set(item.sourceChannel, (sources.get(item.sourceChannel) ?? 0) + 1);
    if (item.personId) {
      personIds.add(item.personId);
      const person = await ctx.db.get(item.personId);
      if (person?.paying) payingPersonIds.add(item.personId);
    } else {
      anonymousKeys.add(`${item.sourceChannel}:${item.author}:${item.url}`);
    }
  }
  payingPeople = payingPersonIds.size;
  const people = personIds.size + anonymousKeys.size;
  const firstSeen = evidence.reduce((min, item) => Math.min(min, item.createdAt), need.firstSeen);
  const lastSeen = evidence.reduce((max, item) => Math.max(max, item.createdAt), need.lastSeen);
  const weekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const growthPerWeek = evidence.filter((item) => item.createdAt >= weekAgo).length;

  await ctx.db.patch(needId, {
    proofPeople: people,
    proofPayingPeople: payingPeople,
    proofSources: [...sources.entries()].map(([channel, count]) => ({ channel, count })),
    proofStrength: strengthForProof(people, payingPeople),
    proofGrowthPerWeek: growthPerWeek,
    firstSeen,
    lastSeen,
    sampleQuotes: evidence
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3)
      .map((item) => ({
        text: item.text,
        author: item.author,
        channel: item.sourceChannel,
        url: item.url,
      })),
    conditionFlags: {
      ...need.conditionFlags,
      readyForReview: people >= 3 || payingPeople >= 1,
      digestEligible: need.status !== "killed",
    },
    updatedAt: Date.now(),
  });
}
