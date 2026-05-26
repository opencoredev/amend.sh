import type { ReactNode } from "react";

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
  selectedRoadmap,
  onAddFeedbackNote,
  onBackFromChangelog,
  onBackFromFeedback,
  onBackFromRoadmap,
  onChangelogSave,
  onOpenFeedbackKey,
  onVoteSelectedRoadmap,
}: DashboardContentProps): ReactNode {
  if (selectedRoadmap && (activeView === "posts" || activeView === "roadmap")) {
    return (
      <RoadmapDetailWorkspace
        item={selectedRoadmap}
        onBack={onBackFromRoadmap}
        onOpenFeedback={onOpenFeedbackKey}
        onVote={onVoteSelectedRoadmap}
      />
    );
  }

  if (selectedFeedback && (activeView === "posts" || activeView === "roadmap")) {
    return (
      <FeedbackDetailWorkspace
        post={selectedFeedback}
        onBack={onBackFromFeedback}
        onAddNote={onAddFeedbackNote}
      />
    );
  }

  if (selectedChangelog && activeView === "changelog") {
    return (
      <ChangelogEditorWorkspace
        entry={selectedChangelog}
        onClose={onBackFromChangelog}
        onSave={onChangelogSave}
      />
    );
  }

  return null;
}
