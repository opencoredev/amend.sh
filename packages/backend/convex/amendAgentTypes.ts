import type {
  normalizeAutomationRules,
  normalizeBuildBrief,
  normalizeChangelog,
  normalizeFeedback,
  normalizeRoadmap,
  normalizeSourceEvent,
  normalizeWorkspace,
} from "./amendNormalizers";

export type AgentDecisionCandidate = {
  action:
    | "draft_changelog"
    | "link_signal_to_source"
    | "notify_users"
    | "update_feedback_status"
    | "update_roadmap_status";
  confidence: number;
  needsReview: boolean;
  outcome: "applied" | "queued_for_review" | "skipped";
  sourceEventExternalIds: string[];
  summary: string;
  targetKey: string;
  targetKind: "changelog" | "feedback" | "notification" | "roadmap" | "source";
};

export type AgentContext = {
  automationRules?: ReturnType<typeof normalizeAutomationRules>;
  buildBriefs?: ReturnType<typeof normalizeBuildBrief>[];
  feedback: ReturnType<typeof normalizeFeedback>[];
  recentChangelog: ReturnType<typeof normalizeChangelog>[];
  roadmap: ReturnType<typeof normalizeRoadmap>[];
  sourceEvents: ReturnType<typeof normalizeSourceEvent>[];
  workspace?: ReturnType<typeof normalizeWorkspace>;
};

export type ProactiveAgentRunResult = {
  count: number;
  decisions: AgentDecisionCandidate[];
  error?: string;
  provider: string;
  providerConfigured: boolean;
  runId?: string;
};
