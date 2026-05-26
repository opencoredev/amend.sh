import type { AmendOpenApiSchemas } from "./openapi";

export type AmendBuildBriefStatus = "approved" | "archived" | "draft" | "exported" | "in_review";

export type AmendBuildBrief = AmendOpenApiSchemas["BuildBrief"];
export type AmendAgentRun = AmendOpenApiSchemas["AgentRun"];
export type AmendSourceEvent = AmendOpenApiSchemas["SourceEvent"];
export type AmendSourceEventImportResult = AmendOpenApiSchemas["SourceEventImportResult"];

export type AmendSourceProvider =
  | "api"
  | "cli"
  | "discord"
  | "email"
  | "embed"
  | "github"
  | "import"
  | "linear"
  | "manual"
  | "portal"
  | "sdk"
  | "slack"
  | "support"
  | "x";

export type AmendSourceKind =
  | "pull_request"
  | "issue"
  | "release"
  | "label"
  | "milestone"
  | "discussion"
  | "customer_signal"
  | "import_record"
  | "portal_feedback"
  | "support_ticket"
  | "usage_event";

export type AmendSourceState = "closed" | "draft" | "merged" | "open" | "published";

export type AmendSourceEventInput = {
  author?: string;
  externalId: string;
  kind: AmendSourceKind;
  labels?: string[];
  milestone?: string;
  number?: number;
  observedAt?: number | string;
  owner?: string;
  projectSlug?: string;
  provider?: AmendSourceProvider;
  repo?: string;
  sourceCreatedAt?: number | string;
  sourceUpdatedAt?: number | string;
  state?: AmendSourceState;
  title: string;
  url?: string;
};
