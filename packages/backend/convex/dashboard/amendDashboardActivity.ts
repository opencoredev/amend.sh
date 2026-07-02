import type { Doc } from "../_generated/dataModel";
import { normalizeSourceEvent } from "../lib/amendRecordNormalizers";
import { providerLabel } from "../lib/amendProviderLabels";
import { sourceLinkForEvent } from "../ingest/amendSourceLinks";

type ChannelSummary = {
  detail: string;
  health: string;
  id: string;
  kind: "context" | "input";
  label: string;
  lastEventAt?: number;
  provider: string;
  signalCount: number;
  state: string;
};

export function buildChannelSummaries(args: {
  connection: Doc<"githubConnections"> | null;
  feedback: Doc<"feedbackItems">[];
  integrations: Doc<"integrationConnections">[];
  sourceEvents: Doc<"sourceEvents">[];
}): ChannelSummary[] {
  const githubEvents = args.sourceEvents.filter((event) => event.provider === "github");
  const summaries: ChannelSummary[] = [
    {
      id: "github",
      kind: "input" as const,
      provider: "github",
      label: "GitHub",
      state: args.connection?.installationState === "connected" ? "connected" : "planned",
      health: args.connection?.syncStatus ?? "attention",
      detail: args.connection
        ? `${args.connection.owner}/${args.connection.repo}`
        : "Connect pull requests, issues, releases, labels, and milestones.",
      lastEventAt: githubEvents[0]?.observedAt,
      signalCount: githubEvents.length,
    },
    {
      id: "feedback",
      kind: "input" as const,
      provider: "feedback",
      label: "Feedback board",
      state: "connected",
      health: "healthy",
      detail: "Portal, votes, comments, reactions, and request forms.",
      lastEventAt: args.feedback[0]?.updatedAt,
      signalCount: args.feedback.length,
    },
    {
      id: "sdk",
      kind: "input" as const,
      provider: "sdk",
      label: "SDK / API",
      state: "connected",
      health: "healthy",
      detail: "App identity, events, shipped usage, and embedded surfaces.",
      signalCount: 0,
    },
  ];

  for (const integration of args.integrations) {
    if (summaries.some((summary) => summary.provider === integration.provider)) {
      continue;
    }
    summaries.push({
      id: integration.provider,
      kind: channelKindForProvider(integration.provider),
      provider: integration.provider,
      label: providerLabel(integration.provider),
      state: integration.state,
      health: integration.state === "attention" ? "attention" : "healthy",
      detail: integration.displayName,
      lastEventAt: integration.lastSyncedAt,
      signalCount: 0,
    });
  }

  return summaries;
}

export function buildAgentActivity(args: {
  agentRuns: Doc<"agentRuns">[];
  automationDecisions: Doc<"automationDecisions">[];
  notifications: Doc<"notifications">[];
  reviews: Doc<"reviewItems">[];
  sourceEvents: Doc<"sourceEvents">[];
}) {
  const runActivities = args.agentRuns.map((run) => ({
    id: run._id,
    kind: "run" as const,
    title: `Agent run: ${run.providerConfigured ? run.provider : "local fallback"}`,
    summary: `${run.decisionCount} decision${run.decisionCount === 1 ? "" : "s"}, ${run.reviewCount} review${run.reviewCount === 1 ? "" : "s"} from ${run.sourceEventCount} source signal${run.sourceEventCount === 1 ? "" : "s"}.`,
    state: run.status,
    timestamp: run.completedAt,
    sourceLinks: run.sourceLinks,
  }));
  const sourceActivities = args.sourceEvents.map((event) => ({
    id: event._id,
    kind: "source_event" as const,
    title: event.title,
    summary: `${providerLabel(event.provider)} ${event.kind.replaceAll("_", " ")}`,
    state: event.state ?? "observed",
    timestamp: event.observedAt,
    sourceLinks: [sourceLinkForEvent(normalizeSourceEvent(event))],
  }));
  const decisionActivities = args.automationDecisions.map((decision) => ({
    id: decision._id,
    kind: "decision" as const,
    title: providerLabel(decision.action),
    summary: decision.summary,
    state: decision.outcome,
    timestamp: decision.updatedAt,
    confidence: decision.confidence,
    needsReview: decision.needsReview,
    sourceLinks: decision.sourceLinks,
  }));
  const reviewActivities = args.reviews.map((review) => ({
    id: review._id,
    kind: "review" as const,
    title: review.title,
    summary: review.summary,
    state: review.status,
    timestamp: review.updatedAt,
    sourceLinks: review.sourceLinks,
  }));
  const notificationActivities = args.notifications.map((notification) => ({
    id: notification._id,
    kind: "notification" as const,
    title: notification.title,
    summary: notification.body,
    state: notification.status,
    timestamp: notification.updatedAt,
    sourceLinks: notification.sourceLinks,
  }));

  return [
    ...runActivities,
    ...sourceActivities,
    ...decisionActivities,
    ...reviewActivities,
    ...notificationActivities,
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 24);
}

function channelKindForProvider(
  provider: Doc<"integrationConnections">["provider"] | "feedback" | "sdk",
) {
  if (provider === "github" || provider === "feedback" || provider === "sdk") {
    return "input" as const;
  }
  if (provider === "posthog" || provider === "databuddy") {
    return "context" as const;
  }
  return "input" as const;
}
