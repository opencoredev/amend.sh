import type { QueryCtx } from "./_generated/server";
import { workspaceSlug } from "./amendBackendUtils";
import {
  demoChangelog,
  demoConnection,
  demoFeedback,
  demoLinks,
  demoRoadmap,
} from "./amendDemoData";

type GetWorkspaceArgs = {
  workspaceSlug?: string;
};

export async function getWorkspaceHandler(_ctx: QueryCtx, args: GetWorkspaceArgs) {
  const slug = workspaceSlug(args.workspaceSlug);

  return {
    connectionMessage: `Convex demo workspace "${slug}" is using source-linked Amend data.`,
    sync: {
      state: "connected",
      repo: `${demoConnection.owner}/${demoConnection.repo}`,
      branch: demoConnection.defaultBranch,
      lastSync: "4 min ago",
      latestSha: "9f31c8a",
      sources: [
        {
          id: "pulls",
          label: "Pull requests",
          detail: "12 merged, 3 open",
          href: `${demoConnection.repositoryUrl}/pulls`,
          state: "healthy",
        },
        {
          id: "issues",
          label: "Issues",
          detail: "8 linked to feedback",
          href: `${demoConnection.repositoryUrl}/issues`,
          state: "healthy",
        },
        {
          id: "releases",
          label: "Releases",
          detail: "v0.7.0 parsed",
          href: `${demoConnection.repositoryUrl}/releases`,
          state: "syncing",
        },
        {
          id: "webhooks",
          label: "Webhooks",
          detail: "Review queue hydrated",
          href: `${demoConnection.repositoryUrl}/settings/hooks`,
          state: "attention",
        },
      ],
    },
    reviewQueue: [
      {
        id: "draft-reviewable-publishing",
        title: demoChangelog[0]!.title,
        summary: demoChangelog[0]!.summary,
        repo: `${demoConnection.owner}/${demoConnection.repo}`,
        branch: "release/reviewable-publishing",
        source: "PR #42",
        sourceHref: demoLinks.pr42.url,
        status: "review",
        kind: "changelog",
        risk: "medium",
        owner: "Amend",
        updatedAt: "11:42",
        diffStats: "+184 -29",
        reviewers: ["Maintainers", "Docs"],
        notify: ["Reviewers", "Subscribers"],
        linkedFeedback: ["feedback-show-shipping-pr", "feedback-review-before-publish"],
      },
      {
        id: "draft-notification-digests",
        title: demoRoadmap[1]!.title,
        summary: demoRoadmap[1]!.description,
        repo: `${demoConnection.owner}/${demoConnection.repo}`,
        branch: "main",
        source: "Issue #118",
        sourceHref: demoLinks.issue118.url,
        status: "draft",
        kind: "roadmap",
        risk: "low",
        owner: "Product",
        updatedAt: "10:09",
        diffStats: "2 feedback links",
        reviewers: ["Product"],
        notify: ["Beta customers"],
        linkedFeedback: ["feedback-review-before-publish"],
      },
      {
        id: "draft-open-source-posture",
        title: demoRoadmap[2]!.title,
        summary: demoRoadmap[2]!.impact,
        repo: `${demoConnection.owner}/${demoConnection.repo}`,
        branch: "main",
        source: "Milestone M1",
        sourceHref: demoLinks.milestoneM1.url,
        status: "published",
        kind: "changelog",
        risk: "low",
        owner: "Maintainers",
        updatedAt: "Yesterday",
        diffStats: "plan posture",
        reviewers: ["OSS"],
        notify: ["Public subscribers"],
        linkedFeedback: ["feedback-show-shipping-pr"],
      },
    ],
    roadmap: [
      {
        id: "road-source-linked-portal",
        title: demoRoadmap[0]!.title,
        status: "in_progress",
        target: "M1",
        source: "Epic #41",
        confidence: "High",
      },
      {
        id: "road-notification-digests",
        title: demoRoadmap[1]!.title,
        status: "planned",
        target: "M2",
        source: "Issue #118",
        confidence: "Medium",
      },
      {
        id: "road-open-source-posture",
        title: demoRoadmap[2]!.title,
        status: "shipped",
        target: "M1",
        source: "Milestone M1",
        confidence: "Done",
      },
    ],
    feedback: [
      {
        id: "feedback-show-shipping-pr",
        author: demoFeedback[0]!.authorName,
        channel: "Portal",
        href: demoLinks.issue118.url,
        sentiment: demoFeedback[0]!.sentiment,
        linkedDraftId: "draft-reviewable-publishing",
        quote: demoFeedback[0]!.body,
      },
      {
        id: "feedback-review-before-publish",
        author: demoFeedback[1]!.authorName,
        channel: "GitHub",
        href: demoLinks.issue118.url,
        sentiment: demoFeedback[1]!.sentiment,
        linkedDraftId: "draft-notification-digests",
        quote: demoFeedback[1]!.body,
      },
    ],
    notifications: [
      {
        id: "note-review-ready",
        audience: "Reviewers",
        channel: "email",
        status: "queued",
        draftId: "draft-reviewable-publishing",
        detail: "2 GitHub sources attached before approval",
      },
      {
        id: "note-feedback-linked",
        audience: "Subscribers",
        channel: "slack",
        status: "sent",
        draftId: "draft-open-source-posture",
        detail: "Sent after source-linked portal shipped",
      },
    ],
  };
}
