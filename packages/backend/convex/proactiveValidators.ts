import { v } from "convex/values";

export const proactiveStatusValue = v.union(
  v.literal("ghost"),
  v.literal("accepted"),
  v.literal("killed"),
);

export const proactiveSourceChannelValue = v.union(
  v.literal("discord"),
  v.literal("support"),
  v.literal("github"),
  v.literal("embed"),
);

export const proactiveStrengthValue = v.union(
  v.literal("thin"),
  v.literal("building"),
  v.literal("strong"),
);

export const proactiveConfidenceBucketValue = v.union(
  v.literal("clear"),
  v.literal("worth-a-look"),
  v.literal("unsure"),
);

export const proactivePromotedByValue = v.union(v.literal("agent"), v.literal("human"));

export const proactiveDraftKindValue = v.union(v.literal("changelog"), v.literal("notify"));

export const proactiveDraftStatusValue = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export const proactiveMemoryKindValue = v.union(
  v.literal("noise"),
  v.literal("dedupe"),
  v.literal("addressed"),
  v.literal("allowlist"),
  v.literal("pattern"),
);

export const proactiveShipLink = v.object({
  prNumber: v.number(),
  sha: v.string(),
  releaseTag: v.optional(v.string()),
  mergedAt: v.number(),
  url: v.string(),
});

export const proactiveProof = v.object({
  people: v.number(),
  payingPeople: v.number(),
  sources: v.array(
    v.object({
      channel: proactiveSourceChannelValue,
      count: v.number(),
    }),
  ),
  strength: proactiveStrengthValue,
  growthPerWeek: v.number(),
});

export const proactiveQuote = v.object({
  text: v.string(),
  author: v.string(),
  channel: proactiveSourceChannelValue,
  url: v.string(),
});

export const proactiveGhost = v.object({
  id: v.string(),
  workspaceId: v.string(),
  title: v.string(),
  status: proactiveStatusValue,
  proof: proactiveProof,
  sampleQuotes: v.array(proactiveQuote),
  firstSeen: v.number(),
  lastSeen: v.number(),
});

export const proactiveEvidence = v.object({
  id: v.string(),
  sourceChannel: proactiveSourceChannelValue,
  author: v.string(),
  text: v.string(),
  url: v.string(),
  confidenceBucket: proactiveConfidenceBucketValue,
  promotedBy: proactivePromotedByValue,
});

export const proactiveNeed = v.object({
  id: v.string(),
  workspaceId: v.string(),
  title: v.string(),
  status: v.literal("accepted"),
  proof: proactiveProof,
  sampleQuotes: v.array(proactiveQuote),
  firstSeen: v.number(),
  lastSeen: v.number(),
  evidence: v.array(proactiveEvidence),
  linkedShip: v.optional(proactiveShipLink),
});

export const proactiveDraftProposal = v.object({
  id: v.string(),
  kind: proactiveDraftKindValue,
  needId: v.string(),
  needTitle: v.string(),
  draftText: v.string(),
  recipients: v.optional(
    v.array(
      v.object({
        handle: v.string(),
        channel: v.string(),
      }),
    ),
  ),
  status: proactiveDraftStatusValue,
});

export const proactiveChangelogEntry = v.object({
  id: v.string(),
  title: v.string(),
  body: v.string(),
  shippedAt: v.number(),
  ship: proactiveShipLink,
  published: v.boolean(),
});

export const proactiveMemoryRule = v.object({
  id: v.string(),
  kind: proactiveMemoryKindValue,
  text: v.string(),
  taughtBy: v.string(),
  taughtAt: v.number(),
  blastRadius: v.number(),
  enabled: v.boolean(),
});

export const proactiveDigestPreview = v.object({
  period: v.object({ from: v.number(), to: v.number() }),
  resolved: v.array(
    v.object({
      needTitle: v.string(),
      ship: proactiveShipLink,
      peopleNotified: v.number(),
    }),
  ),
  readyGhosts: v.array(proactiveGhost),
  handledSilently: v.number(),
});

export const okResult = v.object({ ok: v.literal(true) });
