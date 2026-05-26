import { DEMO_NOW, demoLinks } from "./amendDemoCore";
import type { SourceEventSeed } from "./amendTypes";

export const demoSourceEvents: SourceEventSeed[] = [
  {
    ...demoLinks.pr42,
    labels: ["customer-request", "changelog"],
    milestone: "M1 product slice",
    author: "mona",
    sourceCreatedAt: DEMO_NOW - 86_400_000 * 3,
    sourceUpdatedAt: DEMO_NOW - 86_400_000 * 2,
  },
  {
    ...demoLinks.issue118,
    labels: ["feedback", "notifications"],
    milestone: "M1 product slice",
    author: "octo-user",
    sourceCreatedAt: DEMO_NOW - 86_400_000 * 5,
    sourceUpdatedAt: DEMO_NOW - 86_400_000 * 4,
  },
  {
    ...demoLinks.release070,
    labels: ["release"],
    author: "amend-bot",
    sourceCreatedAt: DEMO_NOW - 86_400_000,
    sourceUpdatedAt: DEMO_NOW - 86_400_000,
  },
  {
    ...demoLinks.milestoneM1,
    labels: ["roadmap"],
    author: "maintainer",
    sourceCreatedAt: DEMO_NOW - 86_400_000 * 8,
    sourceUpdatedAt: DEMO_NOW - 86_400_000 * 6,
  },
];
