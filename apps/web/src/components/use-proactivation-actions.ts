import { useAction, useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useState } from "react";

import type {
  DashboardAutomationDecision,
  DashboardChannel,
  DashboardReview,
  Workspace,
} from "@/components/amend-dashboard-types";
import { fallbackWorkspace, formatState } from "@/components/amend-dashboard-utils";
import { errorMessage, toast } from "@/lib/toast";

const runProactiveAgentAction = makeFunctionReference<"action">(
  "amend:runProactiveAgentForWorkspace",
);
const upsertIntegrationConnectionMutation = makeFunctionReference<"mutation">(
  "amend:upsertIntegrationConnection",
);
const updateReviewStatusMutation = makeFunctionReference<"mutation">("amend:updateReviewStatus");
const revertAutomationDecisionMutation = makeFunctionReference<"mutation">(
  "amend:revertAutomationDecision",
);
const updateAutomationRulesMutation = makeFunctionReference<"mutation">(
  "amend:updateAutomationRules",
);

export type AutomationMode = "manual" | "mostly_auto" | "review_first";
export type ChannelState = "attention" | "connected" | "disabled";
export type ReviewStatus = "approved" | "changes_requested" | "published";

export function useProactivationActions({
  latestDecision,
  latestReview,
  workspace,
}: {
  latestDecision: DashboardAutomationDecision | undefined;
  latestReview: DashboardReview | undefined;
  workspace: Workspace;
}) {
  const runAgent = useAction(runProactiveAgentAction);
  const upsertIntegration = useMutation(upsertIntegrationConnectionMutation);
  const updateReview = useMutation(updateReviewStatusMutation);
  const revertDecision = useMutation(revertAutomationDecisionMutation);
  const updateRules = useMutation(updateAutomationRulesMutation);
  const [running, setRunning] = useState(false);
  const [savingChannel, setSavingChannel] = useState("");
  const [savingReview, setSavingReview] = useState<ReviewStatus | "">("");
  const [savingMode, setSavingMode] = useState<AutomationMode | null>(null);
  const [revertingDecision, setRevertingDecision] = useState(false);
  const canRun = workspace.id !== fallbackWorkspace.id;
  const agentScope = workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id };

  function saveAutomationMode(mode: AutomationMode) {
    if (!canRun) return;
    setSavingMode(mode);
    void updateRules({
      mode,
      workspaceSlug: workspace.id,
    })
      .then(() => toast.success(`Automation mode set to ${formatState(mode)}`))
      .catch((error: unknown) =>
        toast.error({
          title: "Automation settings were not saved",
          description: errorMessage(
            error,
            "The automation mode could not be updated. Refresh the workspace and try again.",
          ),
        }),
      )
      .finally(() => setSavingMode(null));
  }

  function runAgentNow() {
    setRunning(true);
    void runAgent(agentScope)
      .then((result) => {
        const count =
          typeof result === "object" && result && "count" in result
            ? Number((result as { count?: number }).count ?? 0)
            : 0;
        const run = result as {
          error?: string;
          provider?: string;
          providerConfigured?: boolean;
        };
        const provider = run.providerConfigured
          ? (run.provider ?? "configured provider")
          : "local fallback";
        const fallbackNote = run.error ? `, fallback used: ${run.error}` : "";
        toast.success(
          `Agent run saved ${count} decision${count === 1 ? "" : "s"} via ${provider}${fallbackNote}`,
        );
      })
      .catch((error: unknown) => {
        toast.error({
          title: "Agent run failed",
          description: errorMessage(
            error,
            "The proactive agent could not read this workspace or save its decisions. Check the connected source and try again.",
          ),
        });
      })
      .finally(() => setRunning(false));
  }

  function updateChannelState(channel: DashboardChannel, state: ChannelState) {
    if (!canRun) return;
    setSavingChannel(channel.id);
    void upsertIntegration({
      direction: channel.kind === "context" ? "inbound" : "bidirectional",
      displayName: channel.label,
      provider: channel.provider,
      state,
      workspaceSlug: workspace.id,
    })
      .then(() =>
        toast.success(
          state === "disabled" ? `${channel.label} disabled` : `${channel.label} marked ${state}`,
        ),
      )
      .catch((error: unknown) =>
        toast.error({
          title: "Channel update failed",
          description: errorMessage(
            error,
            state === "disabled"
              ? `${channel.label} could not be disabled. Refresh the workspace and try again.`
              : `${channel.label} could not be marked ${state}. Refresh the workspace and try again.`,
          ),
        }),
      )
      .finally(() => setSavingChannel(""));
  }

  function updateLatestReviewStatus(status: ReviewStatus) {
    if (!latestReview?.recordId) return;
    setSavingReview(status);
    void updateReview({
      note:
        status === "changes_requested"
          ? "Needs another pass before the agent can apply this."
          : "Approved from the agent command center.",
      reviewItemId: latestReview.recordId,
      reviewerName: "Dashboard reviewer",
      status,
      workspaceSlug: workspace.id,
    })
      .then(() => toast.success(`Review marked ${formatState(status)}`))
      .catch((error: unknown) =>
        toast.error({
          title: "Review update failed",
          description: errorMessage(
            error,
            "The review status could not be saved. Open the review again and retry.",
          ),
        }),
      )
      .finally(() => setSavingReview(""));
  }

  function revertLatestDecision() {
    if (!latestDecision?.recordId) return;
    setRevertingDecision(true);
    void revertDecision({
      decisionId: latestDecision.recordId,
      workspaceSlug: workspace.id,
    })
      .then(() => toast.success("Decision reverted to review state"))
      .catch((error: unknown) =>
        toast.error({
          title: "Decision revert failed",
          description: errorMessage(
            error,
            "The automation decision could not be reverted. It may have already changed or been removed.",
          ),
        }),
      )
      .finally(() => setRevertingDecision(false));
  }

  return {
    revertLatestDecision,
    revertingDecision,
    runAgentNow,
    running,
    saveAutomationMode,
    savingChannel,
    savingMode,
    savingReview,
    updateChannelState,
    updateLatestReviewStatus,
  };
}
