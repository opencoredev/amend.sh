export type SourceProvider =
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
export type SourceKind =
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
export type SourceState = "open" | "closed" | "merged" | "published" | "draft";

const sourceProviders = new Set<SourceProvider>([
  "api",
  "cli",
  "discord",
  "email",
  "embed",
  "github",
  "import",
  "linear",
  "manual",
  "portal",
  "sdk",
  "slack",
  "support",
  "x",
]);
const sourceKinds = new Set<SourceKind>([
  "pull_request",
  "issue",
  "release",
  "label",
  "milestone",
  "discussion",
  "customer_signal",
  "import_record",
  "portal_feedback",
  "support_ticket",
  "usage_event",
]);
const sourceStates = new Set<SourceState>(["open", "closed", "merged", "published", "draft"]);

export function sourceProvider(value: unknown): SourceProvider {
  if (typeof value === "string" && sourceProviders.has(value as SourceProvider)) {
    return value as SourceProvider;
  }
  return "api";
}

export function sourceKind(value: unknown): SourceKind {
  if (typeof value === "string" && sourceKinds.has(value as SourceKind)) {
    return value as SourceKind;
  }
  throw new Error("kind must be a supported source event kind");
}

export function sourceState(value: unknown): SourceState | undefined {
  if (typeof value === "string" && sourceStates.has(value as SourceState)) {
    return value as SourceState;
  }
  return undefined;
}

export function optionalSourceProvider(value: unknown): SourceProvider | undefined {
  if (typeof value === "string" && sourceProviders.has(value as SourceProvider)) {
    return value as SourceProvider;
  }
  return undefined;
}

export function optionalSourceKind(value: unknown): SourceKind | undefined {
  if (typeof value === "string" && sourceKinds.has(value as SourceKind)) {
    return value as SourceKind;
  }
  return undefined;
}
