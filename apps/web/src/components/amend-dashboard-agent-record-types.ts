import type { SourceLink } from "@/components/amend-dashboard-record-shared-types";

export type DashboardBuildBrief = {
  acceptanceCriteria: string[];
  createdAt: number;
  createdBy?: string;
  evidenceSummary: string;
  priority: string;
  recommendedScope: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  suggestedFiles: string[];
  title: string;
  updatedAt: number;
};

export type DashboardAgentRun = {
  completedAt: number;
  decisionCount: number;
  provider: string;
  providerConfigured: boolean;
  recordId: string | null;
  reviewCount: number;
  stableKey: string;
  status: string;
};

export type DashboardAutomationDecision = {
  action: string;
  confidence: number;
  needsReview: boolean;
  outcome: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  summary: string;
  targetKey: string;
  targetKind: string;
  updatedAt: number;
};

export type DashboardSourceEvent = {
  author?: string;
  externalId: string;
  kind: string;
  labels: string[];
  number?: number;
  observedAt: number;
  owner?: string;
  provider: string;
  recordId: string | null;
  repo?: string;
  state?: string;
  title: string;
  url: string;
};

export type DashboardChannel = {
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

export type DashboardAgentActivity = {
  confidence?: number;
  id: string;
  kind: "decision" | "notification" | "review" | "run" | "source_event";
  needsReview?: boolean;
  sourceLinks: SourceLink[];
  state: string;
  summary: string;
  timestamp: number;
  title: string;
};

export type DashboardNotification = {
  body: string;
  channel: string;
  priority: string;
  recordId: string | null;
  relatedKey: string;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  title: string;
};
