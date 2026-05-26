import type { Doc } from "./_generated/dataModel";

export function normalizeAgentRun(run: Doc<"agentRuns">) {
  return {
    recordId: run._id,
    stableKey: run.stableKey,
    status: run.status,
    provider: run.provider,
    providerConfigured: run.providerConfigured,
    decisionCount: run.decisionCount,
    reviewCount: run.reviewCount,
    sourceEventCount: run.sourceEventCount,
    error: run.error,
    decisionIds: run.decisionIds,
    reviewItemIds: run.reviewItemIds,
    sourceLinks: run.sourceLinks,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  };
}

export function normalizeAutomationDecision(decision: Doc<"automationDecisions">) {
  return {
    recordId: decision._id,
    stableKey: decision.stableKey,
    action: decision.action,
    targetKind: decision.targetKind,
    targetKey: decision.targetKey,
    confidence: decision.confidence,
    needsReview: decision.needsReview,
    outcome: decision.outcome,
    summary: decision.summary,
    sourceLinks: decision.sourceLinks,
    createdAt: decision.createdAt,
    updatedAt: decision.updatedAt,
  };
}

export function normalizeAutomationRules(rules: Doc<"automationRules">) {
  return {
    recordId: rules._id,
    mode: rules.mode,
    autoUpdateFeedbackStatus: rules.autoUpdateFeedbackStatus,
    autoUpdateRoadmapStatus: rules.autoUpdateRoadmapStatus,
    autoDraftChangelog: rules.autoDraftChangelog,
    autoPublishChangelog: rules.autoPublishChangelog,
    autoNotifyUsers: rules.autoNotifyUsers,
    requireReviewBelowConfidence: rules.requireReviewBelowConfidence,
    requireReviewForPublicCopy: rules.requireReviewForPublicCopy,
    requireReviewForHighImpact: rules.requireReviewForHighImpact,
    byokProvider: rules.byokProvider,
    byokConfigured: rules.byokConfigured,
    updatedAt: rules.updatedAt,
  };
}
