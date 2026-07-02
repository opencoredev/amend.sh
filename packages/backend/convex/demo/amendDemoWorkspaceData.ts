import { DEMO_NOW, DEMO_SLUG } from "./amendDemoCore";
import type { PortalSettings } from "../lib/amendTypes";

export const demoWorkspace = {
  slug: DEMO_SLUG,
  name: "Amend Labs",
  description: "Demo workspace for source-linked changelog, roadmap, and feedback flows.",
  visibility: "public" as const,
  portalSettings: {
    accentColor: "#2563ff",
    changelogVisibility: "public" as const,
    feedbackMode: "open" as const,
    headline: "What shipped, what is next, and why it matters.",
    intro: "A source-linked public portal for changelog, roadmap, and customer signals.",
    roadmapVisibility: "public" as const,
  } as PortalSettings,
};

export const demoProject = {
  stableKey: "project-amend-web",
  name: "Amend Web",
  slug: "amend-web",
  description: "Public product update loop for Amend's web, SDK, and portal surfaces.",
  visibility: "public" as const,
};

export const demoConnection = {
  provider: "github" as const,
  owner: "amend-sh",
  repo: "amend",
  repositoryUrl: "https://github.com/amend-sh/amend",
  defaultBranch: "main",
  installationState: "demo" as const,
  watches: {
    pullRequests: true,
    issues: true,
    releases: true,
    labels: true,
    milestones: true,
  },
  syncStatus: "healthy" as const,
  lastSyncedAt: DEMO_NOW,
  lastWebhookDeliveryAt: DEMO_NOW,
};
