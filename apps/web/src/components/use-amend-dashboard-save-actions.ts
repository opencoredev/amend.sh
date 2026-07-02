import { useMutation } from "convex/react";
import type { FunctionArgs } from "convex/server";

import { fallbackWorkspace } from "@/components/amend-dashboard-constants";
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
import {
  roadmapSourceFeedbackKey,
  sourceFeedbackKey,
} from "@/components/amend-dashboard-data-mappers";
import { statusMeta } from "@/components/amend-dashboard-status";
import {
  normalizedPriority,
  persistedRoadmapKey,
  roadmapStatusToPortalStatus,
} from "@/components/amend-dashboard-status-utils";
import type {
  DashboardMutationScope,
  DashboardRoadmap,
  DashboardView,
  Post,
  RoadmapStatus,
  Workspace,
} from "@/components/amend-dashboard-types";
import { useAmendDashboardComposerSubmit } from "@/components/use-amend-dashboard-composer-submit";
import { errorMessage, toast } from "@/lib/toast";

// The changelog editor keeps `status` as a plain string; validate + narrow it
// to the backend's status union at the mutation boundary so garbage never
// leaves the client. The list is typed against the generated args, so a
// backend rename breaks this file at compile time.
type ChangelogEntryStatus = NonNullable<
  FunctionArgs<typeof upsertChangelogEntryMutation>["status"]
>;
// Keyed record so BOTH removals and additions on the backend union break
// this file at compile time (a bare array only catches removals).
const changelogEntryStatusMap = {
  archived: true,
  draft: true,
  in_review: true,
  published: true,
  scheduled: true,
} satisfies Record<ChangelogEntryStatus, true>;
const changelogEntryStatuses = Object.keys(changelogEntryStatusMap) as ChangelogEntryStatus[];

function toChangelogStatus(status: string): ChangelogEntryStatus {
  const known = changelogEntryStatuses.find((value) => value === status);
  if (!known) throw new Error(`Unknown changelog status: ${status}`);
  return known;
}

// Same boundary narrowing for the editor's category select.
type ChangelogEntryCategory = NonNullable<
  FunctionArgs<typeof upsertChangelogEntryMutation>["category"]
>;
const changelogEntryCategoryMap = {
  added: true,
  changed: true,
  fixed: true,
  removed: true,
  security: true,
} satisfies Record<ChangelogEntryCategory, true>;
const changelogEntryCategories = Object.keys(changelogEntryCategoryMap) as ChangelogEntryCategory[];

function toChangelogCategory(category: string): ChangelogEntryCategory {
  const known = changelogEntryCategories.find((value) => value === category);
  if (!known) throw new Error(`Unknown changelog category: ${category}`);
  return known;
}

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

  // A roadmap item synced from feedback shares the feedback record, so its notes
  // attach to that same feedback key — keeping /roadmap?item=… and /posts?feedback=…
  // in lockstep. Mirrors voteRoadmapListItem's feedback-key routing.
  async function addRoadmapNote(item: DashboardRoadmap, note: string) {
    if (workspace.id === fallbackWorkspace.id) {
      throw new Error("Create a project before adding notes.");
    }
    const feedbackKey = roadmapSourceFeedbackKey(item);
    if (!feedbackKey) return;
    await recordFeedbackInteraction({
      body: note,
      feedbackKey,
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
      category: toChangelogCategory(payload.category),
      status: toChangelogStatus(payload.status),
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
    const saved = await upsertChangelog({
      ...payload,
      category: toChangelogCategory(payload.category),
      status: toChangelogStatus(payload.status),
      ...mutationScope,
    });
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
    await upsertChangelog({
      ...content,
      category: toChangelogCategory(content.category),
      status: toChangelogStatus(content.status),
      ...mutationScope,
    });
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
    addRoadmapNote,
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
