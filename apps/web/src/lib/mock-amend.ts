/**
 * AMEND — PROACTIVE AGENT · DATA LAYER (live Convex)
 *
 * The single seam between the Inbox / Memory / Need-detail screens and the
 * backend. Each screen renders against the per-screen hooks exported here; the
 * bodies now call the real Convex functions (via the handles in
 * `amend-dashboard-data.tsx`) instead of an in-memory fixture store. The shapes
 * are identical to the CONTRACT (`amend-contract.ts`) — the backend validators
 * mirror it field-for-field — so the components are unchanged apart from how
 * they acquire the mutation callbacks (now `use*` hooks, since Convex mutations
 * are obtained from `useMutation` at component top-level).
 *
 * Queries resolve the active workspace from auth when `workspaceSlug` is
 * omitted, so the hooks call with `{}` and stay arg-free at the call site. The
 * `QueryResult<T>` envelope (loading / data / error) is preserved verbatim:
 * Convex `useQuery` returns `undefined` while loading (→ isLoading) and surfaces
 * errors through an error boundary, so `isError` stays `false` here.
 */
import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";

import type {
  DraftProposal,
  Ghost,
  MemoryRule,
  Need,
  DigestPreview,
} from "@/lib/amend-contract";
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

/**
 * Review affordance retired with the mock store. Kept as a no-op so existing
 * imports don't break.
 */
export type MockOverride = null | "loading" | "empty" | "error";
export function setMockOverride(_override: MockOverride) {
  void _override;
}

// ---------------------------------------------------------------------------
// Per-screen query hooks — live Convex.
// ---------------------------------------------------------------------------

/** SWAP: useQuery(api.needs.listGhosts, {}) */
export function useGhosts(): QueryResult<Ghost[]> {
  const data = useQuery(listGhostsQuery, {}) as Ghost[] | undefined;
  return envelope(data);
}

/** SWAP: useQuery(api.needs.listAccepted, {}) */
export function useAcceptedNeeds(): QueryResult<Need[]> {
  const data = useQuery(listAcceptedNeedsQuery, {}) as Need[] | undefined;
  return envelope(data);
}

/** SWAP: useQuery(api.needs.get, { needId }) */
export function useNeed(needId: string): QueryResult<Need | null> {
  const data = useQuery(getNeedQuery, { needId }) as Need | null | undefined;
  return envelope(data);
}

/** SWAP: useQuery(api.drafts.listPending, {}) */
export function usePendingDrafts(): QueryResult<DraftProposal[]> {
  const data = useQuery(listPendingDraftsQuery, {}) as DraftProposal[] | undefined;
  return envelope(data);
}

/** Inbox badge — drafts held for approval + needs strong enough to schedule. */
export function useInboxReviewCount(): number {
  const drafts = usePendingDrafts();
  const ghosts = useGhosts();
  const ready = (ghosts.data ?? []).filter((g) => g.proof.strength === "strong").length;
  return (drafts.data?.length ?? 0) + ready;
}

/** SWAP: useQuery(api.memory.listRules, {}) */
export function useMemoryRules(): QueryResult<MemoryRule[]> {
  const data = useQuery(listMemoryRulesQuery, {}) as MemoryRule[] | undefined;
  return envelope(data);
}

/** SWAP: useQuery(api.digest.preview, {}) */
export function useDigestPreview(): QueryResult<DigestPreview> {
  const data = useQuery(digestPreviewQuery, {}) as DigestPreview | undefined;
  return envelope(data);
}

// ---------------------------------------------------------------------------
// Mutations — exposed as `use*` hooks so the screen calls `useMutation(handle)`
// at top-level and gets back a stable callback with the same signature the mock
// plain-functions had. Call sites are unchanged: `const accept = useAcceptGhost()`
// then `accept(id)`.
// ---------------------------------------------------------------------------

/** SWAP: useMutation(api.needs.acceptGhost) */
export function useAcceptGhost() {
  const acceptGhost = useMutation(acceptGhostMutation);
  return useMemo(() => (ghostId: string) => acceptGhost({ ghostId }), [acceptGhost]);
}

/** SWAP: useMutation(api.needs.keepGathering) */
export function useKeepGathering() {
  const keepGathering = useMutation(keepGatheringMutation);
  return useMemo(() => (ghostId: string) => keepGathering({ ghostId }), [keepGathering]);
}

/** SWAP: useMutation(api.needs.killGhost) */
export function useKillGhost() {
  const killGhost = useMutation(killGhostMutation);
  return useMemo(
    () => (ghostId: string, reason?: string) =>
      killGhost({ ghostId, ...(reason?.trim() ? { reason } : {}) }),
    [killGhost],
  );
}

/** SWAP: useMutation(api.needs.restoreGhost) */
export function useRestoreGhost() {
  const restoreGhost = useMutation(restoreGhostMutation);
  return useMemo(() => (ghostId: string) => restoreGhost({ ghostId }), [restoreGhost]);
}

/** SWAP: useMutation(api.drafts.approve) */
export function useApproveDraft() {
  const approveDraft = useMutation(approveDraftMutation);
  return useMemo(() => (draftId: string) => approveDraft({ draftId }), [approveDraft]);
}

/** SWAP: useMutation(api.drafts.reject) */
export function useRejectDraft() {
  const rejectDraft = useMutation(rejectDraftMutation);
  return useMemo(
    () => (draftId: string, edits?: string) =>
      rejectDraft({ draftId, ...(edits?.trim() ? { edits } : {}) }),
    [rejectDraft],
  );
}

/** SWAP: useMutation(api.drafts.updateDraftText) */
export function useUpdateDraftText() {
  const updateDraftText = useMutation(updateDraftTextMutation);
  return useMemo(
    () => (draftId: string, draftText: string) => updateDraftText({ draftId, draftText }),
    [updateDraftText],
  );
}

/** SWAP: useMutation(api.memory.toggleRule) */
export function useToggleRule() {
  const toggleRule = useMutation(toggleMemoryRuleMutation);
  return useMemo(
    () => (ruleId: string, enabled: boolean) => toggleRule({ ruleId, enabled }),
    [toggleRule],
  );
}

/** SWAP: useMutation(api.memory.undoRule) */
export function useUndoRule() {
  const undoRule = useMutation(undoMemoryRuleMutation);
  return useMemo(() => (ruleId: string) => undoRule({ ruleId }), [undoRule]);
}
