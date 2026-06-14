import { MessageSquareText } from "@/lib/icons";
import { makeFunctionReference } from "convex/server";

import type { Board } from "@/components/amend-dashboard-types";

export const dashboardOverviewQuery = makeFunctionReference<"query">("amend:getDashboardOverview");
export const projectsQuery = makeFunctionReference<"query">("amend:getProjects");
export const createFeedbackMutation = makeFunctionReference<"mutation">("amend:createFeedback");
export const recordFeedbackInteractionMutation = makeFunctionReference<"mutation">(
  "amend:recordFeedbackInteraction",
);
export const upsertChangelogEntryMutation = makeFunctionReference<"mutation">(
  "amend:upsertChangelogEntry",
);
export const upsertRoadmapItemMutation =
  makeFunctionReference<"mutation">("amend:upsertRoadmapItem");
export const voteRoadmapItemMutation = makeFunctionReference<"mutation">("amend:voteRoadmapItem");

export const feedbackBoard: Board = {
  id: "feedback",
  name: "Feedback",
  description:
    "Feedback, roadmap evidence, and shipped updates from the connected Amend workspace.",
  icon: <MessageSquareText />,
};
