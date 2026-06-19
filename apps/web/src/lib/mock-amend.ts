/**
 * AMEND — PROACTIVE AGENT · MOCK DATA LAYER
 *
 * The single swap seam between the UI and the backend (FRONTEND_PLAN Phase 0).
 * Every screen renders against the per-screen hooks exported here. Today they
 * read from an in-memory reactive store seeded with fixtures that match the
 * CONTRACT shapes exactly. At integration (Phase 7) each hook body flips to
 * `useQuery(api.x.y, args)` / `useMutation(...)` — one function body per screen,
 * the component never changes because the shape is identical.
 *
 * The store is intentionally simple (module-level immutable state + listeners)
 * so optimistic mutations re-render every screen. It is demo/mock scaffolding —
 * it is removed when the live API lands, so cross-request server state is a
 * non-issue here (mutations only run client-side).
 */
import { useSyncExternalStore } from "react";

import type {
  ChangelogEntry,
  DraftProposal,
  Ghost,
  MemoryRule,
  Need,
  SourcesStatus,
  DigestPreview,
} from "@/lib/amend-contract";
import { AMEND_NOW } from "@/lib/amend-agent-format";

const WS = "ws_amend";
const min = 60_000;
const hour = 60 * min;
const day = 24 * hour;
const week = 7 * day;
const ago = (ms: number) => AMEND_NOW - ms;

// ---------------------------------------------------------------------------
// Fixtures — a coherent week in the life of the agent.
// Everything is modeled as a Need (Ghost + evidence + optional ship); the board
// derives ghosts (status "ghost") and accepted needs (status "accepted").
// ---------------------------------------------------------------------------

const NEEDS: Need[] = [
  {
    id: "need_slack_notifs",
    workspaceId: WS,
    title: "Slack notifications when new feedback lands",
    status: "ghost",
    proof: {
      people: 23,
      payingPeople: 8,
      sources: [
        { channel: "discord", count: 11 },
        { channel: "support", count: 7 },
        { channel: "github", count: 3 },
        { channel: "embed", count: 2 },
      ],
      strength: "strong",
      growthPerWeek: 9,
    },
    firstSeen: ago(5 * week),
    lastSeen: ago(20 * hour),
    sampleQuotes: [
      {
        text: "We'd route this to our team channel instantly if you posted to Slack. Email digests get buried.",
        author: "Priya · Northwind",
        channel: "support",
        url: "https://support.amend.sh/t/4821",
      },
      {
        text: "+1 for Slack. Checking the portal daily is the one bit of friction left for us.",
        author: "@marco_kp",
        channel: "discord",
        url: "https://discord.com/channels/amend/991",
      },
      {
        text: "A simple incoming-webhook to Slack would close this loop for our PM.",
        author: "kev-oss",
        channel: "github",
        url: "https://github.com/amend-sh/amend/issues/612",
      },
    ],
    evidence: [
      {
        id: "ev_sn_1",
        sourceChannel: "support",
        author: "Priya · Northwind",
        text: "We'd route this to our team channel instantly if you posted to Slack. Email digests get buried.",
        url: "https://support.amend.sh/t/4821",
        confidenceBucket: "clear",
        promotedBy: "agent",
      },
      {
        id: "ev_sn_2",
        sourceChannel: "support",
        author: "Dana · Loopwork",
        text: "Slack is where our team lives. Right now someone has to remember to check Amend.",
        url: "https://support.amend.sh/t/4790",
        confidenceBucket: "clear",
        promotedBy: "agent",
      },
      {
        id: "ev_sn_3",
        sourceChannel: "discord",
        author: "@marco_kp",
        text: "+1 for Slack. Checking the portal daily is the one bit of friction left for us.",
        url: "https://discord.com/channels/amend/991",
        confidenceBucket: "clear",
        promotedBy: "agent",
      },
      {
        id: "ev_sn_4",
        sourceChannel: "discord",
        author: "@lena.builds",
        text: "Would love a Slack ping per new request — even just the title and a link.",
        url: "https://discord.com/channels/amend/994",
        confidenceBucket: "worth-a-look",
        promotedBy: "agent",
      },
      {
        id: "ev_sn_5",
        sourceChannel: "github",
        author: "kev-oss",
        text: "A simple incoming-webhook to Slack would close this loop for our PM.",
        url: "https://github.com/amend-sh/amend/issues/612",
        confidenceBucket: "clear",
        promotedBy: "human",
      },
      {
        id: "ev_sn_6",
        sourceChannel: "embed",
        author: "anon · acme.com",
        text: "Can this notify Slack? We won't adopt a second inbox.",
        url: "https://app.amend.sh/portal/acme/p/1182",
        confidenceBucket: "unsure",
        promotedBy: "agent",
      },
    ],
  },
  {
    id: "need_sso_saml",
    workspaceId: WS,
    title: "SSO / SAML for team plans",
    status: "ghost",
    proof: {
      people: 9,
      payingPeople: 3,
      sources: [
        { channel: "support", count: 5 },
        { channel: "github", count: 4 },
      ],
      strength: "building",
      growthPerWeek: 4,
    },
    firstSeen: ago(3 * week),
    lastSeen: ago(2 * day),
    sampleQuotes: [
      {
        text: "Our security review blocks rollout without SAML SSO. Happy to pilot Okta with you.",
        author: "Sam · Vantage (Enterprise)",
        channel: "support",
        url: "https://support.amend.sh/t/5012",
      },
      {
        text: "SCIM would be a bonus but SAML is the hard requirement for us.",
        author: "ops-grendel",
        channel: "github",
        url: "https://github.com/amend-sh/amend/issues/640",
      },
    ],
    evidence: [
      {
        id: "ev_sso_1",
        sourceChannel: "support",
        author: "Sam · Vantage",
        text: "Our security review blocks rollout without SAML SSO. Happy to pilot Okta with you.",
        url: "https://support.amend.sh/t/5012",
        confidenceBucket: "clear",
        promotedBy: "agent",
      },
      {
        id: "ev_sso_2",
        sourceChannel: "support",
        author: "Rae · Foundry",
        text: "We can't expand seats past 10 until there's SSO — IT won't sign off.",
        url: "https://support.amend.sh/t/4998",
        confidenceBucket: "clear",
        promotedBy: "agent",
      },
      {
        id: "ev_sso_3",
        sourceChannel: "github",
        author: "ops-grendel",
        text: "SCIM would be a bonus but SAML is the hard requirement for us.",
        url: "https://github.com/amend-sh/amend/issues/640",
        confidenceBucket: "worth-a-look",
        promotedBy: "human",
      },
      {
        id: "ev_sso_4",
        sourceChannel: "github",
        author: "dleitner",
        text: "Is SAML on the roadmap? Asking before we commit the team.",
        url: "https://github.com/amend-sh/amend/issues/651",
        confidenceBucket: "unsure",
        promotedBy: "agent",
      },
    ],
  },
  {
    id: "need_csv_export",
    workspaceId: WS,
    title: "Bulk CSV export of saved views",
    status: "ghost",
    proof: {
      people: 4,
      payingPeople: 0,
      sources: [
        { channel: "embed", count: 3 },
        { channel: "discord", count: 1 },
      ],
      strength: "thin",
      growthPerWeek: 2,
    },
    firstSeen: ago(4 * day),
    lastSeen: ago(6 * hour),
    sampleQuotes: [
      {
        text: "I just want to pull a saved view into a spreadsheet for our weekly review.",
        author: "anon · portal",
        channel: "embed",
        url: "https://app.amend.sh/portal/acme/p/1205",
      },
    ],
    evidence: [
      {
        id: "ev_csv_1",
        sourceChannel: "embed",
        author: "anon · portal",
        text: "I just want to pull a saved view into a spreadsheet for our weekly review.",
        url: "https://app.amend.sh/portal/acme/p/1205",
        confidenceBucket: "worth-a-look",
        promotedBy: "agent",
      },
      {
        id: "ev_csv_2",
        sourceChannel: "embed",
        author: "anon · portal",
        text: "Export to CSV?",
        url: "https://app.amend.sh/portal/acme/p/1209",
        confidenceBucket: "unsure",
        promotedBy: "agent",
      },
      {
        id: "ev_csv_3",
        sourceChannel: "discord",
        author: "@tomas",
        text: "Would be handy to export the roadmap as a csv for stakeholders.",
        url: "https://discord.com/channels/amend/1020",
        confidenceBucket: "unsure",
        promotedBy: "agent",
      },
    ],
  },
  {
    id: "need_webhook_retries",
    workspaceId: WS,
    title: "Webhook retries with backoff",
    status: "accepted",
    proof: {
      people: 14,
      payingPeople: 6,
      sources: [
        { channel: "github", count: 8 },
        { channel: "support", count: 4 },
        { channel: "discord", count: 2 },
      ],
      strength: "strong",
      growthPerWeek: 3,
    },
    firstSeen: ago(6 * week),
    lastSeen: ago(4 * day),
    linkedShip: {
      prNumber: 1184,
      sha: "9f3c1ae",
      releaseTag: "v2.4.0",
      mergedAt: ago(2 * day),
      url: "https://github.com/amend-sh/amend/pull/1184",
    },
    sampleQuotes: [
      {
        text: "When our endpoint blips we silently lose events. Retries with backoff would save us.",
        author: "infra-noor",
        channel: "github",
        url: "https://github.com/amend-sh/amend/issues/588",
      },
    ],
    evidence: [
      {
        id: "ev_wh_1",
        sourceChannel: "github",
        author: "infra-noor",
        text: "When our endpoint blips we silently lose events. Retries with backoff would save us.",
        url: "https://github.com/amend-sh/amend/issues/588",
        confidenceBucket: "clear",
        promotedBy: "human",
      },
      {
        id: "ev_wh_2",
        sourceChannel: "github",
        author: "@dwsmith",
        text: "A dead-letter + exponential backoff is table stakes for production webhooks.",
        url: "https://github.com/amend-sh/amend/issues/590",
        confidenceBucket: "clear",
        promotedBy: "human",
      },
      {
        id: "ev_wh_3",
        sourceChannel: "support",
        author: "Priya · Northwind",
        text: "We had a 3-minute outage and lost ~40 events with no way to replay them.",
        url: "https://support.amend.sh/t/4655",
        confidenceBucket: "clear",
        promotedBy: "agent",
      },
      {
        id: "ev_wh_4",
        sourceChannel: "discord",
        author: "@marco_kp",
        text: "Please add retries — we built our own queue to work around this.",
        url: "https://discord.com/channels/amend/870",
        confidenceBucket: "worth-a-look",
        promotedBy: "agent",
      },
    ],
  },
  {
    id: "need_portal_dark_mode",
    workspaceId: WS,
    title: "Dark mode for the public portal",
    status: "accepted",
    proof: {
      people: 18,
      payingPeople: 5,
      sources: [
        { channel: "discord", count: 9 },
        { channel: "embed", count: 6 },
        { channel: "support", count: 3 },
      ],
      strength: "building",
      growthPerWeek: 5,
    },
    firstSeen: ago(4 * week),
    lastSeen: ago(1 * day),
    sampleQuotes: [
      {
        text: "Our docs and app are dark — the bright Amend portal is a jarring jump for users.",
        author: "@lena.builds",
        channel: "discord",
        url: "https://discord.com/channels/amend/940",
      },
    ],
    evidence: [
      {
        id: "ev_dm_1",
        sourceChannel: "discord",
        author: "@lena.builds",
        text: "Our docs and app are dark — the bright Amend portal is a jarring jump for users.",
        url: "https://discord.com/channels/amend/940",
        confidenceBucket: "clear",
        promotedBy: "agent",
      },
      {
        id: "ev_dm_2",
        sourceChannel: "embed",
        author: "anon · portal",
        text: "Is there a dark theme? Staring at white at night is rough.",
        url: "https://app.amend.sh/portal/acme/p/1140",
        confidenceBucket: "worth-a-look",
        promotedBy: "agent",
      },
      {
        id: "ev_dm_3",
        sourceChannel: "support",
        author: "Dana · Loopwork",
        text: "Brand-matched dark mode for the portal would help it feel native in our product.",
        url: "https://support.amend.sh/t/4881",
        confidenceBucket: "worth-a-look",
        promotedBy: "agent",
      },
    ],
  },
];

const DRAFTS: DraftProposal[] = [
  {
    id: "draft_wh_changelog",
    kind: "changelog",
    needId: "need_webhook_retries",
    needTitle: "Webhook retries with backoff",
    status: "pending",
    draftText:
      "Webhooks now retry automatically with exponential backoff. If your endpoint is briefly unavailable, we'll re-attempt delivery (up to 6 times over ~1 hour) and surface failures in a new dead-letter view — so a blip no longer means lost events.",
  },
  {
    id: "draft_wh_notify",
    kind: "notify",
    needId: "need_webhook_retries",
    needTitle: "Webhook retries with backoff",
    status: "pending",
    draftText:
      "Hey — you asked about this a few weeks back. Webhook retries with backoff just shipped in v2.4.0, including a dead-letter view to replay failed deliveries. Nothing for you to do; it's on for your workspace now. Thanks for the nudge.",
    recipients: [
      { handle: "infra-noor", channel: "github" },
      { handle: "@dwsmith", channel: "github" },
      { handle: "Priya · Northwind", channel: "support" },
      { handle: "@marco_kp", channel: "discord" },
    ],
  },
];

const CHANGELOG: ChangelogEntry[] = [
  {
    id: "cl_webhook_retries",
    title: "Webhook retries with backoff",
    body: "Webhooks now retry automatically with exponential backoff, plus a dead-letter view to replay failed deliveries. A brief outage no longer means lost events.",
    shippedAt: ago(2 * day),
    published: false,
    ship: {
      prNumber: 1184,
      sha: "9f3c1ae",
      releaseTag: "v2.4.0",
      mergedAt: ago(2 * day),
      url: "https://github.com/amend-sh/amend/pull/1184",
    },
  },
  {
    id: "cl_notif_prefs",
    title: "Granular notification preferences",
    body: "Choose exactly which events email you and which stay in-app, per project. Mute the noise without going dark on the things you care about.",
    shippedAt: ago(9 * day),
    published: true,
    ship: {
      prNumber: 1162,
      sha: "4ad77b2",
      releaseTag: "v2.3.0",
      mergedAt: ago(9 * day),
      url: "https://github.com/amend-sh/amend/pull/1162",
    },
  },
  {
    id: "cl_portal_search",
    title: "Faster portal search",
    body: "Search across feedback, roadmap and changelog is now ~4× faster and ranks exact-title matches first.",
    shippedAt: ago(18 * day),
    published: true,
    ship: {
      prNumber: 1140,
      sha: "b81e09c",
      mergedAt: ago(18 * day),
      url: "https://github.com/amend-sh/amend/pull/1140",
    },
  },
];

const MEMORY_RULES: MemoryRule[] = [
  {
    id: "rule_plus_one_noise",
    kind: "noise",
    text: "Skip bare “+1” and “me too” reactions with no detail of their own.",
    taughtBy: "you",
    taughtAt: ago(16 * day),
    blastRadius: 212,
    enabled: true,
  },
  {
    id: "rule_sentry_noise",
    kind: "noise",
    text: "Ignore automated Sentry crash digests posted into #alerts.",
    taughtBy: "you",
    taughtAt: ago(23 * day),
    blastRadius: 188,
    enabled: true,
  },
  {
    id: "rule_sso_dedupe",
    kind: "dedupe",
    text: "Treat “SSO”, “SAML” and “single sign-on” as one need.",
    taughtBy: "agent",
    taughtAt: ago(11 * day),
    blastRadius: 34,
    enabled: true,
  },
  {
    id: "rule_csv_addressed",
    kind: "addressed",
    text: "“Slow CSV export” was fixed in v2.1 — stop resurfacing the old complaint.",
    taughtBy: "you",
    taughtAt: ago(31 * day),
    blastRadius: 27,
    enabled: false,
  },
  {
    id: "rule_enterprise_allowlist",
    kind: "allowlist",
    text: "Always surface anything from paying customers in #enterprise, even a one-liner.",
    taughtBy: "you",
    taughtAt: ago(8 * day),
    blastRadius: 41,
    enabled: true,
  },
  {
    id: "rule_competitor_pattern",
    kind: "pattern",
    text: "Tag messages that name a competitor as “switching risk” and raise their priority.",
    taughtBy: "agent",
    taughtAt: ago(5 * day),
    blastRadius: 16,
    enabled: true,
  },
];

const SOURCES: SourcesStatus = {
  github: {
    connected: true,
    repo: "amend-sh/amend",
    lastSync: ago(12 * min),
  },
  feedback: {
    connected: true,
    channels: [
      { channel: "discord", connected: true, lastSignal: ago(40 * min) },
      { channel: "support", connected: true, lastSignal: ago(3 * hour) },
      { channel: "embed", connected: true, lastSignal: ago(25 * min) },
      { channel: "github", connected: true, lastSignal: ago(12 * min) },
    ],
  },
};

function buildDigest(needs: Need[]): DigestPreview {
  const find = (id: string) => needs.find((n) => n.id === id);
  const webhook = find("need_webhook_retries");
  const ready = needs.filter((n) => n.status === "ghost" && n.proof.strength === "strong");
  return {
    period: { from: ago(week), to: AMEND_NOW },
    resolved: [
      webhook?.linkedShip
        ? { needTitle: webhook.title, ship: webhook.linkedShip, peopleNotified: 6 }
        : null,
      {
        needTitle: "Granular notification preferences",
        ship: CHANGELOG[1].ship,
        peopleNotified: 12,
      },
    ].filter((x): x is NonNullable<typeof x> => x !== null),
    readyGhosts: ready.map(toGhost),
    handledSilently: 38,
  };
}

function toGhost(need: Need): Ghost {
  // Drop the Need-only fields so listGhosts returns exactly the Ghost shape.
  const { evidence: _evidence, linkedShip: _linkedShip, ...ghost } = need;
  void _evidence;
  void _linkedShip;
  return ghost;
}

// ---------------------------------------------------------------------------
// Reactive store
// ---------------------------------------------------------------------------

export type MockOverride = null | "loading" | "empty" | "error";

interface AmendState {
  needs: Need[];
  drafts: DraftProposal[];
  changelog: ChangelogEntry[];
  rules: MemoryRule[];
  sources: SourcesStatus;
  override: MockOverride;
}

let state: AmendState = {
  needs: NEEDS,
  drafts: DRAFTS,
  changelog: CHANGELOG,
  rules: MEMORY_RULES,
  sources: SOURCES,
  override: null,
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(next: Partial<AmendState>) {
  state = { ...state, ...next };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function useAmendState(): AmendState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Review affordance: force every list into a loading/empty/error state. */
export function setMockOverride(override: MockOverride) {
  if (state.override !== override) setState({ override });
}

// ---------------------------------------------------------------------------
// Query result envelope (mirrors what the swap to @convex-dev/react-query gives)
// ---------------------------------------------------------------------------

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
}

function resolve<T>(override: MockOverride, getData: () => T, emptyValue: T): QueryResult<T> {
  if (override === "loading") return { data: undefined, isLoading: true, isError: false };
  if (override === "error") return { data: undefined, isLoading: false, isError: true };
  if (override === "empty") return { data: emptyValue, isLoading: false, isError: false };
  return { data: getData(), isLoading: false, isError: false };
}

const strengthRank = { strong: 0, building: 1, thin: 2 } as const;

// ---------------------------------------------------------------------------
// Per-screen query hooks — flip ONE body each to useQuery(api.x.y) at Phase 7.
// ---------------------------------------------------------------------------

/** SWAP: useQuery(api.needs.listGhosts, {}) */
export function useGhosts(): QueryResult<Ghost[]> {
  const s = useAmendState();
  return resolve(
    s.override,
    () =>
      s.needs
        .filter((n) => n.status === "ghost")
        .sort(
          (a, b) =>
            strengthRank[a.proof.strength] - strengthRank[b.proof.strength] ||
            b.proof.people - a.proof.people,
        )
        .map(toGhost),
    [],
  );
}

/** SWAP: useQuery(api.needs.listAccepted, {}) */
export function useAcceptedNeeds(): QueryResult<Need[]> {
  const s = useAmendState();
  return resolve(
    s.override,
    () => s.needs.filter((n) => n.status === "accepted").sort((a, b) => b.lastSeen - a.lastSeen),
    [],
  );
}

/** SWAP: useQuery(api.needs.get, { needId }) */
export function useNeed(needId: string): QueryResult<Need | null> {
  const s = useAmendState();
  return resolve(s.override, () => s.needs.find((n) => n.id === needId) ?? null, null);
}

/** SWAP: useQuery(api.drafts.listPending, {}) */
export function usePendingDrafts(): QueryResult<DraftProposal[]> {
  const s = useAmendState();
  return resolve(s.override, () => s.drafts.filter((d) => d.status === "pending"), []);
}

/** SWAP: useQuery(api.changelog.list, {}) */
export function useChangelog(): QueryResult<ChangelogEntry[]> {
  const s = useAmendState();
  return resolve(s.override, () => [...s.changelog].sort((a, b) => b.shippedAt - a.shippedAt), []);
}

/** SWAP: useQuery(api.memory.listRules, {}) */
export function useMemoryRules(): QueryResult<MemoryRule[]> {
  const s = useAmendState();
  return resolve(s.override, () => s.rules, []);
}

/** SWAP: useQuery(api.digest.preview, {}) */
export function useDigestPreview(): QueryResult<DigestPreview> {
  const s = useAmendState();
  return resolve(s.override, () => buildDigest(s.needs), {
    period: { from: ago(week), to: AMEND_NOW },
    resolved: [],
    readyGhosts: [],
    handledSilently: 0,
  });
}

/** SWAP: useQuery(api.sources.status, {}) */
export function useSourcesStatus(): QueryResult<SourcesStatus> {
  const s = useAmendState();
  return resolve(s.override, () => s.sources, s.sources);
}

// ---------------------------------------------------------------------------
// Mutations — flip each to useMutation(api.x.y) at Phase 7. They mutate the
// store optimistically (and immediately, since there's no network here).
// ---------------------------------------------------------------------------

function patchNeed(id: string, patch: Partial<Need>) {
  setState({ needs: state.needs.map((n) => (n.id === id ? { ...n, ...patch } : n)) });
}

export function acceptGhost(ghostId: string) {
  patchNeed(ghostId, { status: "accepted" });
}

export function keepGathering(_ghostId: string) {
  // Acknowledge-and-watch: no data change, the agent keeps gathering proof.
  void _ghostId;
}

export function killGhost(ghostId: string, reason?: string) {
  const need = state.needs.find((n) => n.id === ghostId);
  patchNeed(ghostId, { status: "killed" });
  // Killing teaches a noise rule — the teaching receipt is visible in Memory,
  // where it can be undone. This wires the kill -> memory loop from the plan.
  if (need) {
    const rule: MemoryRule = {
      id: `rule_taught_${ghostId}`,
      kind: "noise",
      text: reason?.trim()
        ? `Stop surfacing “${need.title}” — ${reason.trim()}.`
        : `Stop surfacing requests like “${need.title}”.`,
      taughtBy: "you",
      taughtAt: AMEND_NOW,
      blastRadius: Math.max(3, need.proof.people),
      enabled: true,
    };
    setState({ rules: [rule, ...state.rules.filter((r) => r.id !== rule.id)] });
  }
}

/** Restore a killed ghost (paired with the kill teaching-receipt undo). */
export function restoreGhost(ghostId: string) {
  patchNeed(ghostId, { status: "ghost" });
  setState({ rules: state.rules.filter((r) => r.id !== `rule_taught_${ghostId}`) });
}

export function approveDraft(draftId: string) {
  setState({
    drafts: state.drafts.map((d) => (d.id === draftId ? { ...d, status: "approved" } : d)),
  });
}

export function rejectDraft(draftId: string, edits?: string) {
  setState({
    drafts: state.drafts.map((d) =>
      d.id === draftId
        ? { ...d, status: "rejected", draftText: edits?.trim() ? edits : d.draftText }
        : d,
    ),
  });
}

/** Edit a pending draft in place (Edit + approve flow). */
export function updateDraftText(draftId: string, draftText: string) {
  setState({
    drafts: state.drafts.map((d) => (d.id === draftId ? { ...d, draftText } : d)),
  });
}

export function toggleRule(ruleId: string, enabled: boolean) {
  setState({ rules: state.rules.map((r) => (r.id === ruleId ? { ...r, enabled } : r)) });
}

export function undoRule(ruleId: string) {
  setState({ rules: state.rules.filter((r) => r.id !== ruleId) });
}

export function publishChangelog(entryId: string) {
  setState({
    changelog: state.changelog.map((e) => (e.id === entryId ? { ...e, published: true } : e)),
  });
}

export function unpublishChangelog(entryId: string) {
  setState({
    changelog: state.changelog.map((e) => (e.id === entryId ? { ...e, published: false } : e)),
  });
}

export function connectGithub(repo: string, _token: string) {
  void _token;
  setState({
    sources: {
      ...state.sources,
      github: { connected: true, repo, lastSync: AMEND_NOW },
    },
  });
}
