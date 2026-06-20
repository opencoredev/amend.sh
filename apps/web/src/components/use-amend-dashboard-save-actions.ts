import { useMutation } from "convex/react";

import type {
  ChangelogPublishPayload,
  ChangelogSavePayload,
} from "@/components/amend-dashboard-content-types";
import {
  publishChangelogEntryMutation,
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
  const publishChangelog = useMutation(publishChangelogEntryMutation);
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

  function voteFeedbackPost(post: Post) {
    // Roadmap-derived posts (source: "Roadmap") carry a synthetic `post-roadmap-*`
    // stableKey with no backing feedbackItems row, so the feedback mutation would
    // throw "Feedback item not found". Route them to the roadmap vote instead —
    // the inverse of voteRoadmapListItem's feedback-key routing.
    if (post.sourceRoadmapKey) {
      return voteRoadmap({
        roadmapKey: post.sourceRoadmapKey,
        ...mutationScope,
      });
    }
    return recordFeedbackInteraction({
      feedbackKey: post.stableKey,
      kind: "vote",
      source: "rest",
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

  /**
   * Background persistence for the changelog editor. Unlike {@link saveChangelogEntry}
   * it stays silent (no toast) and keeps the editor open, returning the persisted
   * stableKey so the editor can keep writing into the same record — the backend
   * derives the key from the title on first insert, so reusing it is what prevents
   * a later title edit from forking a duplicate entry.
   */
  async function autoSaveChangelogEntry(payload: ChangelogSavePayload): Promise<string | null> {
    if (workspace.id === fallbackWorkspace.id) {
      throw new Error("Create a project before editing changelogs.");
    }
    const saved = (await upsertChangelog({
      ...payload,
      ...mutationScope,
    })) as { stableKey?: string } | null | undefined;
    return saved?.stableKey ?? null;
  }

  /**
   * Commit from the publish review surface: persist the review edits (cover,
   * excerpt, meta) via upsert, then flip status atomically via the dedicated
   * publish mutation (which stamps publishedAt / schedules / notifies). Kept
   * apart from autosave so publishing is explicit and never races a keystroke.
   */
  async function publishChangelogEntry(payload: ChangelogPublishPayload) {
    if (workspace.id === fallbackWorkspace.id) {
      throw new Error("Create a project before publishing changelogs.");
    }
    const { mode, scheduledFor, notifySubscribers, ...content } = payload;
    if (!content.stableKey) {
      throw new Error("Save the changelog before publishing.");
    }
    await upsertChangelog({ ...content, ...mutationScope });
    await publishChangelog({
      stableKey: content.stableKey,
      mode,
      ...(scheduledFor ? { scheduledFor } : {}),
      ...(notifySubscribers ? { notifySubscribers } : {}),
      ...mutationScope,
    });
    toast.success(mode === "schedule" ? "Changelog scheduled" : "Changelog published");
    setSelectedChangelogKey(null);
  }

  return {
    addFeedbackNote,
    autoSaveChangelogEntry,
    handleComposerSubmit,
    publishChangelogEntry,
    moveRoadmapItem,
    saveChangelogEntry,
    voteFeedbackPost,
    voteRoadmapListItem,
    voteSelectedRoadmapItem,
  };
}
