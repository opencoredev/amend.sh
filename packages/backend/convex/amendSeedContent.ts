import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { demoSourceEvents } from "./amendDemoData";
import {
  ensureDemoChangelogEntries,
  ensureDemoFeedback,
  ensureDemoRoadmap,
  ensureSourceEvent,
  linkDemoFeedbackToRoadmap,
} from "./amendSeedPrimaryRecords";
import {
  ensureDemoBuildBriefs,
  ensureDemoNotifications,
  ensureDemoReviewItems,
} from "./amendSeedWorkflowRecords";

type DemoProductRecordsArgs = {
  connectionId?: Id<"githubConnections">;
  projectId?: Id<"projects">;
  workspaceId: Id<"workspaces">;
};

export async function ensureDemoProductRecords(ctx: MutationCtx, args: DemoProductRecordsArgs) {
  const sourceIds = await Promise.all(
    demoSourceEvents.map((source) =>
      ensureSourceEvent(ctx, args.workspaceId, args.connectionId, source, args.projectId),
    ),
  );
  const changelogIds = await ensureDemoChangelogEntries(ctx, args.workspaceId, sourceIds);
  const feedbackIds = await ensureDemoFeedback(ctx, args.workspaceId, sourceIds, changelogIds);
  const roadmapIds = await ensureDemoRoadmap(ctx, args.workspaceId, {
    changelogIds,
    feedbackIds,
    sourceIds,
  });

  await linkDemoFeedbackToRoadmap(ctx, feedbackIds, roadmapIds, changelogIds);
  await ensureDemoNotifications(ctx, args.workspaceId);
  await ensureDemoReviewItems(ctx, args.workspaceId);
  await ensureDemoBuildBriefs(ctx, args.workspaceId, {
    changelogIds,
    feedbackIds,
    roadmapIds,
    sourceIds,
  });
}
