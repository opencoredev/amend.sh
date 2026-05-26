export const demoPlan = {
  tier: "open_source" as const,
  billingState: "open_source" as const,
  isOpenSource: true,
  seats: 5,
  priceMonthly: 0,
  limits: {
    trackedRepos: 3,
    reviewers: 5,
    monthlyNotifications: 500,
  },
  posture: {
    publicRoadmap: true,
    communityFeedback: true,
    sourceLinkedPublishing: true,
    selfHostFriendly: true,
  },
  notes:
    "Open-source posture: public portal enabled, source links visible, no GitHub credentials required for demo reads.",
};

export const planCatalog = [
  {
    tier: "open_source" as const,
    name: "Open Source",
    priceMonthly: 0,
    limits: { trackedRepos: 3, reviewers: 5, monthlyNotifications: 500 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: true,
    },
    notes: "Free self-hosted core with source-linked records, portal, SDK, and BYO AI.",
  },
  {
    tier: "free" as const,
    name: "Free Cloud",
    priceMonthly: 0,
    limits: { trackedRepos: 1, reviewers: 2, monthlyNotifications: 100 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "Hosted basics for small public projects with fair-use automation.",
  },
  {
    tier: "starter" as const,
    name: "Starter",
    priceMonthly: 19,
    limits: { trackedRepos: 3, reviewers: 3, monthlyNotifications: 1_000 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "Indie projects with widgets, automatic drafts, and unmetered source activity.",
  },
  {
    tier: "pro" as const,
    name: "Pro",
    priceMonthly: 49,
    limits: { trackedRepos: 10, reviewers: 8, monthlyNotifications: 10_000 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "Main paid plan with custom domain, notifications, and stronger automation.",
  },
  {
    tier: "team" as const,
    name: "Team",
    priceMonthly: 99,
    limits: { trackedRepos: 25, reviewers: 25, monthlyNotifications: 50_000 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "Members, permissions, private boards, custom branding, and team integrations.",
  },
  {
    tier: "scale" as const,
    name: "Scale",
    priceMonthly: 249,
    limits: { trackedRepos: 100, reviewers: 100, monthlyNotifications: 250_000 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "White-label embeds, longer history, priority support, and larger fair-use limits.",
  },
];
