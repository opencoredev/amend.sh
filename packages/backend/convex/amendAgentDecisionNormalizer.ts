import { fallbackAgentDecisions } from "./amendAgentFallback";
import type { AgentContext, AgentDecisionCandidate } from "./amendAgentTypes";

const validActions = new Set<AgentDecisionCandidate["action"]>([
  "draft_changelog",
  "link_signal_to_source",
  "notify_users",
  "update_feedback_status",
  "update_roadmap_status",
]);

const validTargetKinds = new Set<AgentDecisionCandidate["targetKind"]>([
  "changelog",
  "feedback",
  "notification",
  "roadmap",
  "source",
]);

export function normalizeAgentDecisions(
  input: unknown,
  context: AgentContext,
): AgentDecisionCandidate[] {
  if (!input || typeof input !== "object") {
    return fallbackAgentDecisions(context);
  }
  const maybeDecisions = (input as { decisions?: unknown }).decisions;
  if (!Array.isArray(maybeDecisions)) {
    return fallbackAgentDecisions(context);
  }
  const decisions = maybeDecisions
    .map((item): AgentDecisionCandidate | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Partial<AgentDecisionCandidate>;
      if (!record.action || !validActions.has(record.action)) return null;
      if (!record.targetKind || !validTargetKinds.has(record.targetKind)) return null;
      return {
        action: record.action,
        confidence:
          typeof record.confidence === "number"
            ? Math.min(1, Math.max(0, record.confidence))
            : 0.68,
        needsReview: record.needsReview !== false,
        outcome:
          record.outcome === "applied" || record.outcome === "skipped"
            ? record.outcome
            : "queued_for_review",
        sourceEventExternalIds: Array.isArray(record.sourceEventExternalIds)
          ? record.sourceEventExternalIds.filter(
              (value): value is string => typeof value === "string",
            )
          : [],
        summary:
          typeof record.summary === "string" && record.summary.trim()
            ? record.summary.trim().slice(0, 600)
            : "Proactive agent prepared a source-linked decision.",
        targetKey:
          typeof record.targetKey === "string" && record.targetKey.trim()
            ? record.targetKey.trim().slice(0, 160)
            : "agent-target",
        targetKind: record.targetKind,
      };
    })
    .filter((item): item is AgentDecisionCandidate => item !== null)
    .slice(0, 6);

  return decisions.length > 0 ? decisions : fallbackAgentDecisions(context);
}
