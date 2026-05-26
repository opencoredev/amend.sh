import { slugPart } from "./amendBackendUtils";
import type { AgentContext, AgentDecisionCandidate } from "./amendAgentTypes";

export function fallbackAgentDecisions(context: AgentContext): AgentDecisionCandidate[] {
  const latestShipped = context.sourceEvents.find(
    (event) =>
      event.kind === "release" || (event.kind === "pull_request" && event.state === "merged"),
  );
  const latestFeedback = context.feedback.find((item) => item.status !== "shipped");

  if (latestShipped && latestFeedback) {
    return [
      {
        action: "link_signal_to_source",
        confidence: 0.72,
        needsReview: true,
        outcome: "queued_for_review",
        sourceEventExternalIds: [latestShipped.externalId],
        summary: `Potentially links "${latestFeedback.title}" to shipped source work "${latestShipped.title}". Review before applying because the fallback matcher only uses existing source evidence.`,
        targetKey: latestFeedback.stableKey,
        targetKind: "feedback",
      },
      {
        action: "draft_changelog",
        confidence: 0.82,
        needsReview: true,
        outcome: "queued_for_review",
        sourceEventExternalIds: [latestShipped.externalId],
        summary: `Draft a source-linked changelog from "${latestShipped.title}" and keep public copy in review.`,
        targetKey: `source-${slugPart(latestShipped.externalId)}`,
        targetKind: "changelog",
      },
    ];
  }

  if (latestFeedback) {
    return [
      {
        action: "link_signal_to_source",
        confidence: 0.64,
        needsReview: true,
        outcome: "queued_for_review",
        sourceEventExternalIds: [],
        summary: `Cluster new customer signal "${latestFeedback.title}" and wait for source evidence before changing roadmap or notifications.`,
        targetKey: latestFeedback.stableKey,
        targetKind: "feedback",
      },
    ];
  }

  return [
    {
      action: "link_signal_to_source",
      confidence: 0.5,
      needsReview: true,
      outcome: "skipped",
      sourceEventExternalIds: [],
      summary:
        "No fresh source or customer signals were available. Connect a channel or submit feedback before the proactive agent can act.",
      targetKey: "agent-noop",
      targetKind: "source",
    },
  ];
}
