import type { SourceLink } from "./amendTypes";

export const DEMO_NOW = Date.UTC(2026, 4, 6, 16, 0, 0);
export const DEMO_SLUG = "amend-labs";

export const demoLinks = {
  pr42: {
    provider: "github",
    owner: "amend-sh",
    repo: "amend",
    kind: "pull_request",
    externalId: "github:amend-sh/amend:pull_request:42",
    number: 42,
    title: "Link shipped work to customer feedback",
    url: "https://github.com/amend-sh/amend/pull/42",
    state: "merged",
    observedAt: DEMO_NOW - 86_400_000 * 2,
  },
  issue118: {
    provider: "github",
    owner: "amend-sh",
    repo: "amend",
    kind: "issue",
    externalId: "github:amend-sh/amend:issue:118",
    number: 118,
    title: "Need clearer notification controls",
    url: "https://github.com/amend-sh/amend/issues/118",
    state: "open",
    observedAt: DEMO_NOW - 86_400_000 * 4,
  },
  release070: {
    provider: "github",
    owner: "amend-sh",
    repo: "amend",
    kind: "release",
    externalId: "github:amend-sh/amend:release:v0.7.0",
    title: "v0.7.0 reviewable publishing beta",
    url: "https://github.com/amend-sh/amend/releases/tag/v0.7.0",
    state: "published",
    observedAt: DEMO_NOW - 86_400_000,
  },
  milestoneM1: {
    provider: "github",
    owner: "amend-sh",
    repo: "amend",
    kind: "milestone",
    externalId: "github:amend-sh/amend:milestone:m1-product-slice",
    title: "M1 product slice",
    url: "https://github.com/amend-sh/amend/milestone/1",
    state: "open",
    observedAt: DEMO_NOW - 86_400_000 * 6,
  },
} satisfies Record<string, SourceLink>;
