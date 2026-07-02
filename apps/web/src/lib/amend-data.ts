/**
 * AMEND — PROACTIVE AGENT · DATA LAYER (live Convex)
 *
 * The dashboard's data-access layer: the single seam between the Inbox /
 * Memory / Need-detail screens and the backend. Each screen renders against
 * the per-screen hooks exported here; the bodies call the real Convex
 * functions through the typed references in `amend-dashboard-data.tsx`.
 *
 * Queries resolve the active workspace from auth when `workspaceSlug` is
 * omitted, so the hooks call with `{}` and stay arg-free at the call site. The
 * `QueryResult<T>` envelope (loading / data / error) is preserved verbatim:
 * Convex `useQuery` returns `undefined` while loading (→ isLoading) and surfaces
 * errors through an error boundary, so `isError` stays `false` here.
 */
import { useMemo } from "react";
import { useMutation } from "convex/react";

import type {
  DraftProposal,
  Ghost,
  InsightsSummary,
  MemoryRule,
  Need,
  DigestPreview,
} from "@/lib/amend-contract";
import { useAuthedQuery } from "@/lib/convex-utils";
import {
  acceptGhostMutation,
  approveDraftMutation,
  digestPreviewQuery,
  getNeedQuery,
  keepGatheringMutation,
  killGhostMutation,
  listAcceptedNeedsQuery,
  listGhostsQuery,
  listMemoryRulesQuery,
  listPendingDraftsQuery,
  rejectDraftMutation,
  restoreGhostMutation,
  toggleMemoryRuleMutation,
  undoMemoryRuleMutation,
  updateDraftTextMutation,
} from "@/components/amend-dashboard-data";

// ---------------------------------------------------------------------------
// Query result envelope — Convex `useQuery` returns `undefined` while loading.
// Errors are thrown to the nearest error boundary rather than returned, so
// `isError` is always false here; screens still branch on it defensively.
// ---------------------------------------------------------------------------

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
}

function envelope<T>(data: T | undefined): QueryResult<T> {
  return { data, isLoading: data === undefined, isError: false };
}

// ---------------------------------------------------------------------------
// Per-screen query hooks — live Convex.
// ---------------------------------------------------------------------------

export function useGhosts(): QueryResult<Ghost[]> {
  return envelope(useAuthedQuery(listGhostsQuery, {}));
}

export function useAcceptedNeeds(): QueryResult<Need[]> {
  return envelope(useAuthedQuery(listAcceptedNeedsQuery, {}));
}

export function useNeed(needId: string): QueryResult<Need | null> {
  return envelope(useAuthedQuery(getNeedQuery, { needId }));
}

export function usePendingDrafts(): QueryResult<DraftProposal[]> {
  return envelope(useAuthedQuery(listPendingDraftsQuery, {}));
}

/** Inbox badge — drafts held for approval + every captured ghost awaiting review. */
export function useInboxReviewCount(): number {
  const drafts = usePendingDrafts();
  const ghosts = useGhosts();
  return (drafts.data?.length ?? 0) + (ghosts.data?.length ?? 0);
}

export function useMemoryRules(): QueryResult<MemoryRule[]> {
  return envelope(useAuthedQuery(listMemoryRulesQuery, {}));
}

export function useDigestPreview(): QueryResult<DigestPreview> {
  return envelope(useAuthedQuery(digestPreviewQuery, {}));
}

// ---------------------------------------------------------------------------
// Insights — static placeholder until the analytics view is live-wired (the
// same way Inbox/Memory were). Preserves the Insights screen + chart components.
// ---------------------------------------------------------------------------

const EMPTY_INSIGHTS: InsightsSummary = {
  signalCaptured: 0,
  shipped: 0,
  peopleReached: 0,
  noiseFiltered: 0,
  signalTrendPct: 0,
  timeline: [],
  channels: [],
  topDemand: [],
  sparks: { signal: [], shipped: [], reached: [], noise: [] },
};

/** Static placeholder until `api.insights.summary` exists. */
export function useInsights(): QueryResult<InsightsSummary> {
  return envelope(EMPTY_INSIGHTS);
}

// ---------------------------------------------------------------------------
// Mutations — exposed as `use*` hooks so the screen calls `useMutation(handle)`
// at top-level and gets back a stable callback with the same signature the mock
// plain-functions had. Call sites are unchanged: `const accept = useAcceptGhost()`
// then `accept(id)`.
// ---------------------------------------------------------------------------

export function useAcceptGhost() {
  const acceptGhost = useMutation(acceptGhostMutation);
  return useMemo(() => (ghostId: string) => acceptGhost({ ghostId }), [acceptGhost]);
}

export function useKeepGathering() {
  const keepGathering = useMutation(keepGatheringMutation);
  return useMemo(() => (ghostId: string) => keepGathering({ ghostId }), [keepGathering]);
}

export function useKillGhost() {
  const killGhost = useMutation(killGhostMutation);
  return useMemo(
    () => (ghostId: string, reason?: string) =>
      killGhost({ ghostId, ...(reason?.trim() ? { reason } : {}) }),
    [killGhost],
  );
}

export function useRestoreGhost() {
  const restoreGhost = useMutation(restoreGhostMutation);
  return useMemo(() => (ghostId: string) => restoreGhost({ ghostId }), [restoreGhost]);
}

export function useApproveDraft() {
  const approveDraft = useMutation(approveDraftMutation);
  return useMemo(() => (draftId: string) => approveDraft({ draftId }), [approveDraft]);
}

export function useRejectDraft() {
  const rejectDraft = useMutation(rejectDraftMutation);
  return useMemo(
    () => (draftId: string, edits?: string) =>
      rejectDraft({ draftId, ...(edits?.trim() ? { edits } : {}) }),
    [rejectDraft],
  );
}

export function useUpdateDraftText() {
  const updateDraftText = useMutation(updateDraftTextMutation);
  return useMemo(
    () => (draftId: string, draftText: string) => updateDraftText({ draftId, draftText }),
    [updateDraftText],
  );
}

export function useToggleRule() {
  const toggleRule = useMutation(toggleMemoryRuleMutation);
  return useMemo(
    () => (ruleId: string, enabled: boolean) => toggleRule({ ruleId, enabled }),
    [toggleRule],
  );
}

export function useUndoRule() {
  const undoRule = useMutation(undoMemoryRuleMutation);
  return useMemo(() => (ruleId: string) => undoRule({ ruleId }), [undoRule]);
}
