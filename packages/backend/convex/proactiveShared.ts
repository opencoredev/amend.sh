import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { DEMO_NOW } from "./amendDemoData";
import { requireDashboardUser, requireDashboardWorkspace } from "./amendWorkspace";

export type ProactiveCtx = QueryCtx | MutationCtx;

export type WorkspaceArgs = {
  workspaceSlug?: string;
};

export type ProactiveGhost = {
  id: string;
  workspaceId: string;
  title: string;
  status: "ghost" | "accepted" | "killed";
  proof: {
    people: number;
    payingPeople: number;
    sources: { channel: "discord" | "support" | "github" | "embed"; count: number }[];
    strength: "thin" | "building" | "strong";
    growthPerWeek: number;
  };
  sampleQuotes: { text: string; author: string; channel: "discord" | "support" | "github" | "embed"; url: string }[];
  firstSeen: number;
  lastSeen: number;
};

export type ProactiveEvidence = {
  id: string;
  sourceChannel: "discord" | "support" | "github" | "embed";
  author: string;
  text: string;
  url: string;
  confidenceBucket: "clear" | "worth-a-look" | "unsure";
  promotedBy: "agent" | "human";
};

export type ProactiveNeed = ProactiveGhost & {
  evidence: ProactiveEvidence[];
  linkedShip?: {
    prNumber: number;
    sha: string;
    releaseTag?: string;
    mergedAt: number;
    url: string;
  };
};

export async function requireProactiveWorkspace(ctx: ProactiveCtx, args: WorkspaceArgs = {}) {
  const user = await requireDashboardUser(ctx);
  return await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
}

export function needToGhost(need: Doc<"needs">): ProactiveGhost {
  return {
    id: need._id,
    workspaceId: need.workspaceId,
    title: need.title,
    status: need.status,
    proof: {
      people: need.proofPeople,
      payingPeople: need.proofPayingPeople,
      sources: need.proofSources,
      strength: need.proofStrength,
      growthPerWeek: need.proofGrowthPerWeek,
    },
    sampleQuotes: need.sampleQuotes.slice(0, 3),
    firstSeen: need.firstSeen,
    lastSeen: need.lastSeen,
  };
}

export async function needToAcceptedNeed(
  ctx: ProactiveCtx,
  need: Doc<"needs">,
): Promise<ProactiveNeed> {
  const evidenceDocs = await ctx.db
    .query("evidence")
    .withIndex("by_need", (q) => q.eq("needId", need._id))
    .collect();

  return {
    ...needToGhost(need),
    evidence: evidenceDocs
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((evidence) => ({
        id: evidence._id,
        sourceChannel: evidence.sourceChannel,
        author: evidence.author,
        text: evidence.text,
        url: evidence.url,
        confidenceBucket: evidence.confidenceBucket,
        promotedBy: evidence.promotedBy,
      })),
    ...(need.linkedShip ? { linkedShip: need.linkedShip } : {}),
  };
}

export function ghostSortValue(ghost: ProactiveGhost) {
  const strength = ghost.proof.strength === "strong" ? 3 : ghost.proof.strength === "building" ? 2 : 1;
  return strength * 1_000_000 + ghost.proof.people * 1_000 + ghost.proof.growthPerWeek;
}

export async function ensureFixtureNeeds(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  const existing = await ctx.db
    .query("needs")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();
  if (existing) return;

  const now = DEMO_NOW;
  const exportNeedId = await ctx.db.insert("needs", {
    workspaceId,
    title: "Customers keep asking for CSV export workflows",
    status: "ghost",
    proofPeople: 7,
    proofPayingPeople: 3,
    proofSources: [
      { channel: "support", count: 3 },
      { channel: "github", count: 2 },
      { channel: "discord", count: 2 },
    ],
    proofStrength: "strong",
    proofGrowthPerWeek: 2,
    sampleQuotes: [
      {
        text: "We need a clean CSV export before we can roll Amend out to the support team.",
        author: "Maya",
        channel: "support",
        url: "https://example.com/support/182",
      },
      {
        text: "Exporting tagged feedback would unblock our weekly planning ritual.",
        author: "@sam",
        channel: "discord",
        url: "https://discord.com/channels/amend/feedback/42",
      },
    ],
    firstSeen: now - 1000 * 60 * 60 * 24 * 24,
    lastSeen: now - 1000 * 60 * 60 * 7,
    conditionFlags: { readyForReview: true, hasLinkedShip: false, digestEligible: true },
    clusterKey: "csv-export-workflows",
    createdAt: now - 1000 * 60 * 60 * 24 * 24,
    updatedAt: now - 1000 * 60 * 60 * 7,
  });

  const acceptedNeedId = await ctx.db.insert("needs", {
    workspaceId,
    title: "Notify requesters when their issue ships",
    status: "accepted",
    proofPeople: 4,
    proofPayingPeople: 2,
    proofSources: [
      { channel: "github", count: 2 },
      { channel: "embed", count: 2 },
    ],
    proofStrength: "building",
    proofGrowthPerWeek: 1,
    sampleQuotes: [
      {
        text: "If someone asked for the feature, they should hear when it lands.",
        author: "@lee",
        channel: "github",
        url: "https://github.com/acme/app/issues/77",
      },
    ],
    firstSeen: now - 1000 * 60 * 60 * 24 * 18,
    lastSeen: now - 1000 * 60 * 60 * 48,
    linkedShip: {
      prNumber: 124,
      sha: "8c4f2d9",
      mergedAt: now - 1000 * 60 * 60 * 12,
      url: "https://github.com/acme/app/pull/124",
    },
    conditionFlags: { readyForReview: false, hasLinkedShip: true, digestEligible: true },
    clusterKey: "ship-notifications",
    createdAt: now - 1000 * 60 * 60 * 24 * 18,
    updatedAt: now - 1000 * 60 * 60 * 12,
  });

  await ctx.db.insert("evidence", {
    workspaceId,
    needId: acceptedNeedId,
    sourceChannel: "github",
    author: "@lee",
    text: "If someone asked for the feature, they should hear when it lands.",
    url: "https://github.com/acme/app/issues/77",
    confidenceBucket: "clear",
    promotedBy: "agent",
    createdAt: now - 1000 * 60 * 60 * 48,
  });

  await ctx.db.insert("draftProposals", {
    workspaceId,
    kind: "notify",
    needId: acceptedNeedId,
    needTitle: "Notify requesters when their issue ships",
    draftText: "Good news — the requester notification workflow shipped in PR #124. Want us to notify the people who asked for it?",
    recipients: [{ handle: "@lee", channel: "github" }],
    status: "pending",
    createdAt: now - 1000 * 60 * 60 * 11,
    updatedAt: now - 1000 * 60 * 60 * 11,
  });

  await ctx.db.insert("memoryRules", {
    workspaceId,
    kind: "noise",
    text: "Ignore one-off generic pricing complaints unless tied to a specific workflow.",
    taughtBy: "demo-admin",
    taughtAt: now - 1000 * 60 * 60 * 24 * 6,
    blastRadius: 3,
    enabled: true,
    createdAt: now - 1000 * 60 * 60 * 24 * 6,
    updatedAt: now - 1000 * 60 * 60 * 24 * 6,
  });

  await ctx.db.insert("evidence", {
    workspaceId,
    needId: exportNeedId,
    sourceChannel: "support",
    author: "Maya",
    text: "We need a clean CSV export before we can roll Amend out to the support team.",
    url: "https://example.com/support/182",
    confidenceBucket: "clear",
    promotedBy: "human",
    createdAt: now - 1000 * 60 * 60 * 24 * 14,
  });
}
