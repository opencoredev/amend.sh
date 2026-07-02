import { makeFunctionReference } from "convex/server";

import type { ActionCtx } from "../_generated/server";
import { callCrofAgent } from "./amendAgent";
import type { AgentContext, ProactiveAgentRunResult } from "./amendAgent";
import {
  getAgentRunContextHandler,
  persistProactiveAgentRunHandler,
} from "./amendAgentRunHandlers";
import { getDashboardOverviewHandler } from "../dashboard/amendDashboardOverview";
import {
  getAgentRunContextArgs,
  getDashboardOverviewArgs,
  persistProactiveAgentRunArgs,
  runProactiveAgentForWorkspaceArgs,
} from "../lib/amendFunctionArgs";

const getAgentRunContextReference = makeFunctionReference<"query">("amend:getAgentRunContext");
const persistProactiveAgentRunReference = makeFunctionReference<"mutation">(
  "amend:persistProactiveAgentRun",
);

type ProjectScopeArgs = {
  projectSlug?: string;
  workspaceSlug?: string;
};

export const getDashboardOverviewDefinition = {
  args: getDashboardOverviewArgs,
  handler: getDashboardOverviewHandler,
};

export const getAgentRunContextDefinition = {
  args: getAgentRunContextArgs,
  handler: getAgentRunContextHandler,
};

export const persistProactiveAgentRunDefinition = {
  args: persistProactiveAgentRunArgs,
  handler: persistProactiveAgentRunHandler,
};

export const runProactiveAgentForWorkspaceDefinition = {
  args: runProactiveAgentForWorkspaceArgs,
  handler: async (ctx: ActionCtx, args: ProjectScopeArgs): Promise<ProactiveAgentRunResult> => {
    const context = (await ctx.runQuery(getAgentRunContextReference, args)) as AgentContext;
    const result = await callCrofAgent(context);
    const persisted = (await ctx.runMutation(persistProactiveAgentRunReference, {
      decisions: result.decisions,
      error: result.error,
      provider: result.provider,
      providerConfigured: result.providerConfigured,
      projectSlug: args.projectSlug,
      workspaceSlug: args.workspaceSlug,
    })) as Omit<ProactiveAgentRunResult, "decisions">;
    return {
      ...persisted,
      decisions: result.decisions,
    };
  },
};
