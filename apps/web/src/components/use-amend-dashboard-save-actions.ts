import { useMutation } from "convex/react";

import type { ChangelogSavePayload } from "@/components/amend-dashboard-content-types";
import {
  recordFeedbackInteractionMutation,
  upsertChangelogEntryMutation,
  upsertRoadmapItemMutation,
  voteRoadmapItemMutation,
} from "@/components/amend-dashboard-data";
import type { DashboardMutationScope } from "@/components/amend-dashboard-mutation-types";
import { statusMeta } from "@/components/amend-dashboard-status";
import type {
  DashboardRoadmap,
  DashboardView,
  Post,
  RoadmapStatus,
  Workspace,
} from "@/components/amend-dashboard-types";
import {
  fallbackWorkspace,
  normalizedPriority,
  persistedRoadmapKey,
  roadmapStatusToPortalStatus,
  sourceFeedbackKey,
} from "@/components/amend-dashboard-utils";
import { useAmendDashboardComposerSubmit } from "@/components/use-amend-dashboard-composer-submit";
import { errorMessage, toast } from "@/lib/toast";

export function useAmendDashboardSaveActions({
  activeView,
  mutationScope,
  roadmapCreateStatus,
  selectedFeedback,
  setRoadmapCreateStatus,
  setSelectedChangelogKey,
  workspace,
}: {
  activeView: DashboardView;
  mutationScope: DashboardMutationScope;
  roadmapCreateStatus: RoadmapStatus | null;
  selectedFeedback: Post | null;
  setRoadmapCreateStatus: (status: RoadmapStatus | null) => void;
  setSelectedChangelogKey: (key: string | null) => void;
  workspace: Workspace;
}) {
  const recordFeedbackInteraction = useMutation(recordFeedbackInteractionMutation);
  const upsertChangelog = useMutation(upsertChangelogEntryMutation);
  const upsertRoadmap = useMutation(upsertRoadmapItemMutation);
  const voteRoadmap = useMutation(voteRoadmapItemMutation);
  const handleComposerSubmit = useAmendDashboardComposerSubmit({
    activeView,
    mutationScope,
    roadmapCreateStatus,
    setRoadmapCreateStatus,
    workspace,
  });

  function moveRoadmapItem(item: DashboardRoadmap, status: RoadmapStatus) {
    if (workspace.id === fallbackWorkspace.id) {
      toast.error({
        title: "Choose a project first",
        description:
          "Roadmap changes need a real project so the item can be saved to the right data set.",
      });
      return;
    }
    const nextStatus = roadmapStatusToPortalStatus(status);
    void upsertRoadmap({
      description: item.description || item.impact || item.title,
      impact: item.impact || item.description || item.title,
      priority: normalizedPriority(item.priority),
      stableKey: persistedRoadmapKey(item),
      status: nextStatus,
      title: item.title,
      ...mutationScope,
      ...(item.target ? { target: item.target } : {}),
    }).catch((error: unknown) =>
      toast.error({
        title: "Could not move roadmap item",
        description: errorMessage(
          error,
          `The item "${item.title}" could not be moved to ${statusMeta[status].label}. Refresh the project and try again.`,
        ),
      }),
    );
  }

  function voteRoadmapListItem(item: DashboardRoadmap) {
    const feedbackKey = sourceFeedbackKey(item);
    if (feedbackKey) {
      return recordFeedbackInteraction({
        feedbackKey,
        kind: "vote",
        source: "rest",
        ...mutationScope,
      });
    }
    return voteRoadmap({
      roadmapKey: item.stableKey,
      ...mutationScope,
    });
  }

  async function voteSelectedRoadmapItem(item: DashboardRoadmap) {
    if (workspace.id === fallbackWorkspace.id) {
      throw new Error("Create a project before voting on roadmap items.");
    }
    await voteRoadmap({
      roadmapKey: item.stableKey,
      ...mutationScope,
    });
  }

  async function addFeedbackNote(note: string) {
    if (workspace.id === fallbackWorkspace.id) {
      throw new Error("Create a project before adding notes.");
    }
    if (!selectedFeedback) return;
    await recordFeedbackInteraction({
      body: note,
      feedbackKey: selectedFeedback.stableKey,
      kind: "comment",
      source: "rest",
      ...mutationScope,
    });
    toast.success("Feedback note added");
  }

  async function saveChangelogEntry(payload: ChangelogSavePayload) {
    if (workspace.id === fallbackWorkspace.id) {
      throw new Error("Create a project before editing changelogs.");
    }
    await upsertChangelog({
      ...payload,
      ...mutationScope,
    });
    toast.success("Changelog updated");
    setSelectedChangelogKey(null);
  }

  return {
    addFeedbackNote,
    handleComposerSubmit,
    moveRoadmapItem,
    saveChangelogEntry,
    voteRoadmapListItem,
    voteSelectedRoadmapItem,
  };
}
