import type { ReactNode } from "react";

import { fallbackWorkspace } from "@/components/amend-dashboard-constants";
import {
  ChangelogEditorWorkspace,
  FeedbackDetailWorkspace,
  RoadmapDetailWorkspace,
} from "@/components/amend-dashboard-workspaces";
import type { DashboardContentProps } from "@/components/amend-dashboard-content-types";
import { roadmapSourceFeedbackKey } from "@/components/amend-dashboard-utils";

export function getDashboardDetailView({
  activeView,
  feedbackPosts,
  selectedChangelog,
  selectedFeedback,
  selectedChangelogKey,
  selectedRoadmap,
  onAddFeedbackNote,
  onAddRoadmapNote,
  onBackFromChangelog,
  onChangelogAutoSave,
  onChangelogPublish,
  onOpenFeedbackKey,
  onVoteFeedbackPost,
  onVoteSelectedRoadmap,
  workspace,
}: DashboardContentProps): ReactNode {
  if (selectedRoadmap && (activeView === "posts" || activeView === "roadmap")) {
    // A roadmap item synced from feedback is the same entity as its feedback post,
    // so render the identical feedback detail — /roadmap?item=… then matches
    // /posts?feedback=… exactly (status, tags, comments, source evidence, vote all
    // resolve against the shared feedback record). This closes the direct-link gap
    // that openRoadmapItem already covers for in-app navigation. Genuine roadmap
    // items (no backing feedback) keep the roadmap detail.
    const sourcePost = feedbackPosts.find(
      (post) =>
        !post.sourceRoadmapKey &&
        post.stableKey === roadmapSourceFeedbackKey(selectedRoadmap),
    );
    if (sourcePost) {
      return (
        <FeedbackDetailWorkspace
          post={sourcePost}
          onAddNote={(note) => onAddRoadmapNote(selectedRoadmap, note)}
          onVote={onVoteFeedbackPost}
        />
      );
    }
    return (
      <RoadmapDetailWorkspace
        item={selectedRoadmap}
        onOpenFeedback={onOpenFeedbackKey}
        onVote={onVoteSelectedRoadmap}
      />
    );
  }

  if (selectedFeedback && (activeView === "posts" || activeView === "roadmap")) {
    return (
      <FeedbackDetailWorkspace
        post={selectedFeedback}
        onAddNote={onAddFeedbackNote}
        onVote={onVoteFeedbackPost}
      />
    );
  }

  if (selectedChangelog && activeView === "changelog") {
    return (
      <ChangelogEditorWorkspace
        key={selectedChangelogKey ?? "changelog"}
        entry={selectedChangelog}
        onAutoSave={onChangelogAutoSave}
        onClose={onBackFromChangelog}
        onPublish={onChangelogPublish}
        workspaceSlug={workspace.id === fallbackWorkspace.id ? undefined : workspace.id}
      />
    );
  }

  return null;
}
