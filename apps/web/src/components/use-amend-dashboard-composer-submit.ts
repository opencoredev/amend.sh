import { useMutation } from "convex/react";

import { fallbackWorkspace } from "@/components/amend-dashboard-constants";
import {
  createFeedbackMutation,
  upsertChangelogEntryMutation,
  upsertRoadmapItemMutation,
} from "@/components/amend-dashboard-data";
import {
  composerStatusToChangelogStatus,
  composerStatusToRoadmapStatus,
  roadmapStatusToPortalStatus,
} from "@/components/amend-dashboard-status-utils";
import type {
  DashboardMutationScope,
  DashboardView,
  RoadmapStatus,
  Workspace,
} from "@/components/amend-dashboard-types";
import type { ComposerSubmitPayload } from "@/components/post-composer-model";
import { toast } from "@/lib/toast";

export function useAmendDashboardComposerSubmit({
  activeView,
  mutationScope,
  roadmapCreateStatus,
  setRoadmapCreateStatus,
  workspace,
}: {
  activeView: DashboardView;
  mutationScope: DashboardMutationScope;
  roadmapCreateStatus: RoadmapStatus | null;
  setRoadmapCreateStatus: (status: RoadmapStatus | null) => void;
  workspace: Workspace;
}) {
  const createFeedback = useMutation(createFeedbackMutation);
  const upsertChangelog = useMutation(upsertChangelogEntryMutation);
  const upsertRoadmap = useMutation(upsertRoadmapItemMutation);

  return async function handleComposerSubmit(payload: ComposerSubmitPayload) {
    if (workspace.id === fallbackWorkspace.id) {
      throw new Error("Create a project before adding dashboard items.");
    }

    const text = payload.description || payload.title;
    const labels = [payload.board, payload.status, payload.tag].filter(Boolean) as string[];

    if (payload.board === "Changelog" || activeView === "changelog") {
      await upsertChangelog({
        body: text,
        category: payload.tag === "High Priority" ? "added" : "changed",
        status: composerStatusToChangelogStatus(payload.status),
        summary: text,
        tags: labels,
        title: payload.title,
        ...mutationScope,
        ...(payload.status === "Completed" ? { publishedAt: Date.now() } : {}),
      });
      toast.success("Changelog draft saved");
      return;
    }

    if (payload.board === "Feature Request" || activeView === "roadmap") {
      await upsertRoadmap({
        description: text,
        impact: text,
        priority: payload.tag === "High Priority" ? "P1" : "P2",
        status: roadmapCreateStatus
          ? roadmapStatusToPortalStatus(roadmapCreateStatus)
          : composerStatusToRoadmapStatus(payload.status),
        title: payload.title,
        ...mutationScope,
        ...(payload.dueDate ? { target: payload.dueDate } : {}),
      });
      toast.success("Roadmap item saved");
      setRoadmapCreateStatus(null);
      return;
    }

    await createFeedback({
      authorName: "Dashboard",
      body: text,
      labels,
      title: payload.title,
      ...mutationScope,
    });
    toast.success("Feedback item saved");
  };
}
