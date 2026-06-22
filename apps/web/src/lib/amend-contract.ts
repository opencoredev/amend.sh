/**
 * AMEND — PROACTIVE AGENT · CONTRACT (the typed seam)
 *
 * These interfaces are copied verbatim from the CONTRACT block that lives in
 * BOTH FRONTEND_PLAN.txt and BACKEND_PLAN.txt. They are the single source the
 * components render against — the only shared shape between the UI and the
 * Convex API. Do NOT add fields the CONTRACT doesn't define without updating
 * BACKEND_PLAN.txt in the same commit (FRONTEND_PLAN rule 4).
 *
 * Timestamps are epoch milliseconds (number). Ids are opaque strings.
 */

export type SourceChannel = "discord" | "support" | "github" | "embed";

export type GhostStatus = "ghost" | "accepted" | "killed";

/** Render as a label + bar — never as a number/percent (FRONTEND_PLAN posture). */
export type ProofStrength = "thin" | "building" | "strong";

export interface ProofSource {
  channel: SourceChannel;
  count: number;
}

export interface Proof {
  people: number;
  payingPeople: number;
  sources: ProofSource[];
  strength: ProofStrength;
  growthPerWeek: number;
}

export interface SampleQuote {
  text: string;
  author: string;
  channel: SourceChannel;
  url: string;
}

export interface Ghost {
  id: string;
  workspaceId: string;
  title: string;
  status: GhostStatus;
  proof: Proof;
  /** Max 3. */
  sampleQuotes: SampleQuote[];
  firstSeen: number;
  lastSeen: number;
}

export type ConfidenceBucket = "clear" | "worth-a-look" | "unsure";

export type PromotedBy = "agent" | "human";

export interface Evidence {
  id: string;
  sourceChannel: SourceChannel;
  author: string;
  text: string;
  url: string;
  confidenceBucket: ConfidenceBucket;
  promotedBy: PromotedBy;
}

export interface ShipLink {
  prNumber: number;
  sha: string;
  releaseTag?: string;
  mergedAt: number;
  url: string;
}

export type Need = Ghost & {
  evidence: Evidence[];
  linkedShip?: ShipLink;
};

export type DraftKind = "changelog" | "notify";

export type DraftStatus = "pending" | "approved" | "rejected";

export interface DraftRecipient {
  handle: string;
  channel: SourceChannel;
}

export interface DraftProposal {
  id: string;
  kind: DraftKind;
  needId: string;
  needTitle: string;
  draftText: string;
  recipients?: DraftRecipient[];
  status: DraftStatus;
}

export interface ChangelogEntry {
  id: string;
  title: string;
  body: string;
  shippedAt: number;
  ship: ShipLink;
  published: boolean;
}

export type MemoryRuleKind = "noise" | "dedupe" | "addressed" | "allowlist" | "pattern";

export interface MemoryRule {
  id: string;
  kind: MemoryRuleKind;
  text: string;
  taughtBy: string;
  taughtAt: number;
  /** How many items this rule affects per month, e.g. "hides ~212/mo". */
  blastRadius: number;
  enabled: boolean;
}

export interface DigestResolved {
  needTitle: string;
  ship: ShipLink;
  peopleNotified: number;
}

export interface DigestPreview {
  period: { from: number; to: number };
  resolved: DigestResolved[];
  readyGhosts: Ghost[];
  handledSilently: number;
}

export interface SourcesStatus {
  github: {
    connected: boolean;
    repo?: string;
    lastSync?: number;
  };
  feedback: {
    connected: boolean;
    channels: { channel: SourceChannel; connected: boolean; lastSignal?: number }[];
  };
}
