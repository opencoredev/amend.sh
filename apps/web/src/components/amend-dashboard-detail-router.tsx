import type { ReactNode } from "react";

import { fallbackWorkspace } from "@/components/amend-dashboard-constants";
import {
  ChangelogEditorWorkspace,
  FeedbackDetailWorkspace,
  RoadmapDetailWorkspace,
} from "@/components/amend-dashboard-workspaces";
import type { DashboardContentProps } from "@/components/amend-dashboard-content-types";

export function getDashboardDetailView({
  activeView,
  selectedChangelog,
  selectedFeedback,
  selectedChangelogKey,
  selectedRoadmap,
  onAddFeedbackNote,
  onBackFromChangelog,
  onChangelogAutoSave,
  onChangelogPublish,
  onOpenFeedbackKey,
  onVoteFeedbackPost,
  onVoteSelectedRoadmap,
  workspace,
}: DashboardContentProps): ReactNode {
  if (selectedRoadmap && (activeView === "posts" || activeView === "roadmap")) {
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
