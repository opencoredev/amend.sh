/**
 * AMEND — PROACTIVE AGENT · UI CONTRACT
 *
 * UI-level shapes the console screens render against. Server shapes flow from
 * the generated Convex types (`@amend/backend/convex/_generated/api`) via the
 * typed references in `amend-dashboard-data.tsx`; the data layer
 * (`lib/amend-data.ts`) assigns those returns into these types, so any drift
 * between the backend validators and this file is a compile error at that
 * seam rather than a silent runtime mismatch.
 *
 * Timestamps are epoch milliseconds (number). Ids are opaque strings.
 */

/** Mirrors the backend's `PROACTIVE_SOURCE_CHANNELS`; the amend-data seam breaks the build if they diverge. */
export type SourceChannel =
  | "discord"
  | "support"
  | "github"
  | "embed"
  | "slack"
  | "email"
  | "x"
  | "telegram";

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
  /** Stable identity handle (e.g. Discord username) — used to dedupe one person across mentions. */
  authorHandle?: string;
  /** Real profile picture for the author, when the source provides one. */
  authorAvatarUrl?: string;
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
  /**
   * Free-form on the wire — the backend validates recipients with a plain
   * string, not the channel union. Narrow with `isSourceChannel` before
   * keying channel-specific UI.
   */
  channel: string;
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

/** One weekly bucket of the Insights timeline — demand captured vs work shipped. */
export interface InsightsPoint {
  /** Epoch ms at the start of the week bucket. */
  ts: number;
  /** Short axis label, e.g. "May 12". */
  label: string;
  signal: number;
  shipped: number;
}

export interface InsightsChannelSlice {
  channel: SourceChannel;
  count: number;
}

export interface InsightsDemandItem {
  id: string;
  title: string;
  people: number;
  strength: ProofStrength;
  status: GhostStatus;
}

/**
 * Aggregate signal for the Insights view. Every field is derived from the same
 * needs/changelog/memory the rest of the console renders, so the numbers tie out
 * across screens. When the analytics view goes live, `api.insights.summary`
 * should return this exact shape.
 */
export interface InsightsSummary {
  /** Total inbound mentions: surfaced evidence + noise the agent handled silently. */
  signalCaptured: number;
  /** Releases tied back to demand. */
  shipped: number;
  /** People notified when the thing they asked for shipped. */
  peopleReached: number;
  /** Items hidden per month by enabled noise/dedupe/addressed memory rules. */
  noiseFiltered: number;
  /** % change in captured signal, recent half vs prior half of the timeline. */
  signalTrendPct: number;
  timeline: InsightsPoint[];
  channels: InsightsChannelSlice[];
  topDemand: InsightsDemandItem[];
  /** 12-point trend glyphs per KPI, for the dithered sparklines. */
  sparks: {
    signal: number[];
    shipped: number[];
    reached: number[];
    noise: number[];
  };
}
