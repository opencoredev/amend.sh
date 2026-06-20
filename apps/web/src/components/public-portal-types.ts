export type FeedbackMode = "authenticated" | "closed" | "open";

/** The three public portal surfaces. `feedback` is the default (clean URL). */
export type PortalView = "changelog" | "feedback" | "roadmap";

export type PortalSearch = {
  /** Open a changelog entry by its stableKey. */
  entry?: string;
  /** Open a feedback post by its stableKey. */
  post?: string;
  view?: PortalView;
};

export function normalizePortalView(value: unknown): PortalView {
  return value === "roadmap" || value === "changelog" ? value : "feedback";
}

/** Turn a display portal URL like `acme.amend.sh` into the routable workspace slug. */
export function portalSlugFromUrl(portalUrl: string): string {
  return portalUrl
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\.amend\.sh.*$/i, "")
    .replace(/\/.*$/, "");
}

export type PortalData = {
  changelog: PortalChangelog[];
  feedback: PortalFeedback[];
  roadmap: PortalRoadmap[];
  workspace: {
    description?: string;
    logoUrl?: string | null;
    name: string;
    portalSettings?: {
      accentColor?: string;
      changelogVisibility: "private" | "public";
      customThemeCss?: string;
      feedbackMode: FeedbackMode;
      headline?: string;
      intro?: string;
      roadmapVisibility: "private" | "public";
      themeAppearance?: "dark" | "light";
      themePreset?: string;
    };
    slug: string;
  };
};

export type SourceLink = {
  externalId: string;
  kind: string;
  number?: number;
  provider: string;
  title: string;
  url: string;
};

export type PortalChangelog = {
  body: string;
  category: string;
  coverImageUrl?: string | null;
  metaDescription?: string | null;
  publishedAt?: number;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  summary: string;
  title: string;
  updatedAt: number;
  version?: string;
};

export type PortalRoadmap = {
  feedbackCount: number;
  impact: string;
  priority: string;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  target?: string;
  title: string;
  updatedAt: number;
};

export type PortalFeedback = {
  authorName: string;
  body: string;
  labels: string[];
  linkedChangelogCount: number;
  linkedRoadmapCount: number;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  title: string;
  updatedAt: number;
  votes: number;
};
