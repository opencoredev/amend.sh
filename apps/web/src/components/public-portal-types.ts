export type FeedbackMode = "authenticated" | "closed" | "open";

export type PortalData = {
  changelog: PortalChangelog[];
  feedback: PortalFeedback[];
  roadmap: PortalRoadmap[];
  workspace: {
    description?: string;
    name: string;
    portalSettings?: {
      accentColor?: string;
      changelogVisibility: "private" | "public";
      feedbackMode: FeedbackMode;
      headline?: string;
      intro?: string;
      roadmapVisibility: "private" | "public";
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
  votes: number;
};
