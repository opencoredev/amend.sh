import { demoWorkspace } from "../demo/amendDemoWorkspaceData";
import { demoSourceEvents } from "../demo/amendDemoSourceEvents";
import { demoConnection } from "../demo/amendDemoWorkspaceData";
import { demoPlan } from "../demo/amendDemoData";
import {DEMO_NOW} from "../demo/amendDemoCore";
import {
  demoBuildBriefs,
  demoChangelog,
  demoFeedback,
  demoNotifications,
  demoReviews,
  demoRoadmap,
} from "../demo/amendDemoContent";
import { isDraftChangelogStatus, isOpenFeedbackStatus } from "../lib/amendBackendUtils";

export function demoDashboard() {
  const openFeedback = demoFeedback.filter((item) => isOpenFeedbackStatus(item.status)).length;
  return {
    workspace: { ...demoWorkspace, recordId: null, createdAt: DEMO_NOW, updatedAt: DEMO_NOW },
    github: { ...demoConnection, recordId: null },
    plan: { ...demoPlan, recordId: null },
    metrics: {
      openFeedback,
      roadmapInProgress: demoRoadmap.filter((item) => item.status === "in_progress").length,
      changelogDrafts: demoChangelog.filter((item) => isDraftChangelogStatus(item.status)).length,
      reviewNeedsReview: demoReviews.filter((item) => item.status === "needs_review").length,
      queuedNotifications: demoNotifications.filter((item) => item.status === "queued").length,
      sourceLinkedRecords:
        demoChangelog.length +
        demoRoadmap.length +
        demoFeedback.length +
        demoNotifications.length +
        demoBuildBriefs.length,
    },
    recentChangelog: demoChangelog.map((item) => ({
      ...item,
      recordId: null,
      updatedAt: DEMO_NOW,
    })),
    roadmap: demoRoadmap.map((item) => ({
      ...item,
      recordId: null,
      feedbackCount: demoFeedback.length,
      changelogCount: demoChangelog.length,
      updatedAt: DEMO_NOW,
      ...(item.status === "shipped" ? { shippedAt: DEMO_NOW - 21_600_000 } : {}),
    })),
    feedback: demoFeedback.map((item) => ({
      ...item,
      recordId: null,
      linkedRoadmapCount: demoRoadmap.length,
      linkedChangelogCount: demoChangelog.length,
      updatedAt: DEMO_NOW,
    })),
    notifications: demoNotifications.map((item) => ({
      ...item,
      recordId: null,
      createdAt: DEMO_NOW,
      ...(item.status === "sent" ? { sentAt: DEMO_NOW - 1_800_000 } : {}),
    })),
    reviewQueue: demoReviews.map((item) => ({ ...item, recordId: null, updatedAt: DEMO_NOW })),
    buildBriefs: demoBuildBriefs.map((item) => ({
      ...item,
      recordId: null,
      feedbackItemIds: [],
      roadmapItemIds: [],
      changelogEntryIds: [],
      sourceEventIds: [],
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    })),
    automationDecisions: [],
    sourceEvents: demoSourceEvents.map((item) => ({ ...item, recordId: null })),
    agentActivity: [],
    channels: [
      {
        id: "github",
        kind: "input",
        provider: "github",
        label: "GitHub",
        state: "connected",
        health: "healthy",
        detail: `${demoConnection.owner}/${demoConnection.repo}`,
        lastEventAt: DEMO_NOW,
        signalCount: demoSourceEvents.length,
      },
      {
        id: "feedback",
        kind: "input",
        provider: "feedback",
        label: "Feedback board",
        state: "connected",
        health: "healthy",
        detail: "Portal, votes, comments, reactions, and request forms.",
        lastEventAt: DEMO_NOW,
        signalCount: demoFeedback.length,
      },
    ],
  };
}

export function emptyDashboard() {
  return {
    workspace: undefined,
    github: undefined,
    plan: undefined,
    metrics: {
      openFeedback: 0,
      roadmapInProgress: 0,
      changelogDrafts: 0,
      reviewNeedsReview: 0,
      queuedNotifications: 0,
      sourceLinkedRecords: 0,
    },
    recentChangelog: [],
    roadmap: [],
    feedback: [],
    notifications: [],
    reviewQueue: [],
    buildBriefs: [],
    agentRuns: [],
    automationDecisions: [],
    sourceEvents: [],
    agentActivity: [],
    channels: [],
  };
}
