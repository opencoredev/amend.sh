import { formatDate, formatState } from "@/components/amend-dashboard-format";
import {
  feedbackStatusToRoadmapStatus,
  priorityLabel,
  roadmapStatusToPortalStatus,
  roadmapStatusToRoadmapStatus,
  statusTitle,
} from "@/components/amend-dashboard-status-utils";
import type {
  DashboardFeedback,
  DashboardRoadmap,
  Post,
  RoadmapView,
} from "@/components/amend-dashboard-types";

export function buildSyncedPosts(feedback: DashboardFeedback[], roadmap: DashboardRoadmap[]) {
  const feedbackPosts = feedback.map(feedbackToPost);
  const existingTitles = new Set(feedbackPosts.map((post) => post.title.trim().toLowerCase()));
  const roadmapPosts = roadmap
    .filter((item) => !existingTitles.has(item.title.trim().toLowerCase()))
    .map(roadmapItemToPost);

  return [...feedbackPosts, ...roadmapPosts].sort(
    (left, right) => right.updatedAt - left.updatedAt,
  );
}

export function roadmapItemToPost(item: DashboardRoadmap): Post {
  const status = roadmapStatusToRoadmapStatus(item.status);
  return {
    authorName: "Roadmap",
    body: item.description || item.impact,
    boardId: "feedback",
    date: formatDate(item.updatedAt),
    id: item.recordId ?? item.stableKey,
    labels: [priorityLabel(item.priority), statusTitle(status)],
    linkedChangelogCount: item.changelogCount,
    linkedRoadmapCount: 1,
    source: "Roadmap",
    sourceLinks: item.sourceLinks,
    sourceRoadmapKey: item.stableKey,
    stableKey: `post-roadmap-${item.stableKey}`,
    status,
    title: item.title,
    updatedAt: item.updatedAt,
    voters: item.feedbackCount,
  };
}

export function buildSyncedRoadmapEntries(roadmap: DashboardRoadmap[], feedback: Post[]) {
  const existingTitles = new Set(roadmap.map((item) => item.title.trim().toLowerCase()));
  const feedbackRoadmap = feedback
    .filter(
      (post) => !post.sourceRoadmapKey && !existingTitles.has(post.title.trim().toLowerCase()),
    )
    .map(feedbackPostToRoadmapItem);

  return [...feedbackRoadmap, ...roadmap].sort((left, right) => right.updatedAt - left.updatedAt);
}

export function feedbackPostToRoadmapItem(post: Post): DashboardRoadmap {
  return {
    changelogCount: post.linkedChangelogCount,
    description: post.body,
    feedbackCount: Math.max(post.voters, 1),
    impact: post.body,
    priority: post.labels.includes("High Priority") ? "P1" : "P2",
    recordId: null,
    sourceLinks: [
      {
        externalId: `feedback:${post.stableKey}`,
        kind: "feedback",
        provider: "feedback",
        title: post.title,
        url: `/dashboard/posts?status=${post.status}`,
      },
      ...post.sourceLinks,
    ],
    stableKey: `roadmap-feedback-${post.stableKey}`,
    status: roadmapStatusToPortalStatus(post.status),
    title: post.title,
    updatedAt: post.updatedAt,
  };
}

export function buildRoadmapViews(entries: DashboardRoadmap[]): RoadmapView[] {
  return [
    {
      id: "main",
      name: "Main roadmap",
      description:
        "Every roadmap item Amend knows about, tied back to feedback, GitHub source, and changelog evidence.",
      entries,
    },
  ];
}

export function sourceFeedbackKey(item: DashboardRoadmap) {
  const source = item.sourceLinks.find((link) => link.externalId?.startsWith("feedback:"));
  return source?.externalId?.replace(/^feedback:/, "") ?? "";
}

export function feedbackToPost(item: DashboardFeedback): Post {
  return {
    authorName: item.authorName,
    body: item.body,
    boardId: "feedback",
    date: formatDate(item.updatedAt),
    id: item.recordId ?? item.stableKey,
    labels: item.labels,
    linkedChangelogCount: item.linkedChangelogCount,
    linkedRoadmapCount: item.linkedRoadmapCount,
    source: item.sourceLinks[0]?.title ?? formatState(item.source),
    sourceLinks: item.sourceLinks,
    stableKey: item.stableKey,
    status: feedbackStatusToRoadmapStatus(item.status),
    title: item.title,
    updatedAt: item.updatedAt,
    voters: item.votes,
  };
}
