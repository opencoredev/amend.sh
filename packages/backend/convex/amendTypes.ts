export type SourceLink = {
  provider:
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
  owner?: string;
  repo?: string;
  kind:
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
  externalId: string;
  number?: number;
  title: string;
  url: string;
  state?: "open" | "closed" | "merged" | "published" | "draft";
  observedAt: number;
};

export type SourceEventSeed = SourceLink & {
  labels: string[];
  milestone?: string;
  author?: string;
  sourceCreatedAt: number;
  sourceUpdatedAt: number;
};

export type PortalSettings = {
  accentColor?: string;
  changelogVisibility: "private" | "public";
  feedbackMode: "authenticated" | "closed" | "open";
  headline?: string;
  intro?: string;
  roadmapVisibility: "private" | "public";
};
