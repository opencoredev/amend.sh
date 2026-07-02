import type {
  DashboardMutationScope,
  DashboardRoadmap,
  DashboardView,
  Post,
  RoadmapStatus,
  Workspace,
} from "@/components/amend-dashboard-types";
import { sourceFeedbackKey } from "@/components/amend-dashboard-data-mappers";
import { useAmendDashboardSaveActions } from "@/components/use-amend-dashboard-save-actions";

export function useAmendDashboardActions({
  activeView,
  mutationScope,
  roadmapCreateStatus,
  selectedFeedback,
  setRoadmapCreateStatus,
  setSelectedChangelogKey,
  setSelectedFeedbackKey,
  setSelectedRoadmapKey,
  workspace,
}: {
  activeView: DashboardView;
  mutationScope: DashboardMutationScope;
  roadmapCreateStatus: RoadmapStatus | null;
  selectedFeedback: Post | null;
  setRoadmapCreateStatus: (status: RoadmapStatus | null) => void;
  setSelectedChangelogKey: (key: string | null) => void;
  setSelectedFeedbackKey: (key: string | null) => void;
  setSelectedRoadmapKey: (key: string | null) => void;
  workspace: Workspace;
}) {
  const saveActions = useAmendDashboardSaveActions({
    activeView,
    mutationScope,
    roadmapCreateStatus,
    selectedFeedback,
    setRoadmapCreateStatus,
    setSelectedChangelogKey,
    workspace,
  });

  function openFeedbackPost(post: Post) {
    if (post.sourceRoadmapKey) {
      setSelectedRoadmapKey(post.sourceRoadmapKey);
      return;
    }
    setSelectedFeedbackKey(post.stableKey);
  }

  function openFeedbackFromRoadmap(stableKey: string) {
    // The feedback setter already clears any open roadmap item, so this is one nav.
    setSelectedFeedbackKey(stableKey);
  }

  function openRoadmapItem(item: DashboardRoadmap) {
    const feedbackKey = sourceFeedbackKey(item);
    if (feedbackKey) {
      setSelectedFeedbackKey(feedbackKey);
      return;
    }
    setSelectedRoadmapKey(item.stableKey);
  }

  return {
    addFeedbackNote: saveActions.addFeedbackNote,
    addRoadmapNote: saveActions.addRoadmapNote,
    autoSaveChangelogEntry: saveActions.autoSaveChangelogEntry,
    handleComposerSubmit: saveActions.handleComposerSubmit,
    moveRoadmapItem: saveActions.moveRoadmapItem,
    openFeedbackFromRoadmap,
    openFeedbackPost,
    openRoadmapItem,
    publishChangelogEntry: saveActions.publishChangelogEntry,
    saveChangelogEntry: saveActions.saveChangelogEntry,
    voteFeedbackPost: saveActions.voteFeedbackPost,
    voteRoadmapListItem: saveActions.voteRoadmapListItem,
    voteSelectedRoadmapItem: saveActions.voteSelectedRoadmapItem,
  };
}
