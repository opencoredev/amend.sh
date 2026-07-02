import {
  getAgentRunsArgs,
  getAgentRunsForApiArgs,
  getBuildBriefsArgs,
  getPublicPortalArgs,
  getReviewQueueArgs,
  getSourceEventsArgs,
  getUserUpdatesArgs,
  resolveCustomDomainArgs,
  workspaceOnlyArgs,
} from "../lib/amendFunctionArgs";
import {
  getAgentRunsForApiHandler,
  getAgentRunsHandler,
  getAutomationDecisionsForApiHandler,
  getAutomationDecisionsHandler,
  getBuildBriefsForApiHandler,
  getBuildBriefsHandler,
  getDeliveryOutboxForApiHandler,
  getDeliveryOutboxHandler,
  getNotificationCenterHandler,
  getPlanCatalogHandler,
  getProjectsForApiHandler,
  getProjectsHandler,
  getPublicPortalHandler,
  getReviewQueueHandler,
  getSourceEventsForApiHandler,
  getSourceEventsHandler,
  getUserUpdatesHandler,
  getWorkspaceSettingsForApiHandler,
  getWorkspaceSettingsHandler,
  resolveCustomDomainHandler,
} from "./amendReadHandlers";

export const getPublicPortalDefinition = {
  args: getPublicPortalArgs,
  handler: getPublicPortalHandler,
};

export const getReviewQueueDefinition = {
  args: getReviewQueueArgs,
  handler: getReviewQueueHandler,
};

export const getNotificationCenterDefinition = {
  args: workspaceOnlyArgs,
  handler: getNotificationCenterHandler,
};

export const getUserUpdatesDefinition = {
  args: getUserUpdatesArgs,
  handler: getUserUpdatesHandler,
};

export const getDeliveryOutboxDefinition = {
  args: workspaceOnlyArgs,
  handler: getDeliveryOutboxHandler,
};

export const getDeliveryOutboxForApiDefinition = {
  args: workspaceOnlyArgs,
  handler: getDeliveryOutboxForApiHandler,
};

export const getAutomationDecisionsDefinition = {
  args: workspaceOnlyArgs,
  handler: getAutomationDecisionsHandler,
};

export const getAutomationDecisionsForApiDefinition = {
  args: workspaceOnlyArgs,
  handler: getAutomationDecisionsForApiHandler,
};

export const getAgentRunsDefinition = {
  args: getAgentRunsArgs,
  handler: getAgentRunsHandler,
};

export const getAgentRunsForApiDefinition = {
  args: getAgentRunsForApiArgs,
  handler: getAgentRunsForApiHandler,
};

export const getSourceEventsDefinition = {
  args: getSourceEventsArgs,
  handler: getSourceEventsHandler,
};

export const getSourceEventsForApiDefinition = {
  args: getSourceEventsArgs,
  handler: getSourceEventsForApiHandler,
};

export const getBuildBriefsDefinition = {
  args: getBuildBriefsArgs,
  handler: getBuildBriefsHandler,
};

export const getBuildBriefsForApiDefinition = {
  args: getBuildBriefsArgs,
  handler: getBuildBriefsForApiHandler,
};

export const getWorkspaceSettingsDefinition = {
  args: workspaceOnlyArgs,
  handler: getWorkspaceSettingsHandler,
};

export const getWorkspaceSettingsForApiDefinition = {
  args: workspaceOnlyArgs,
  handler: getWorkspaceSettingsForApiHandler,
};

export const resolveCustomDomainDefinition = {
  args: resolveCustomDomainArgs,
  handler: resolveCustomDomainHandler,
};

export const getProjectsDefinition = {
  args: workspaceOnlyArgs,
  handler: getProjectsHandler,
};

export const getProjectsForApiDefinition = {
  args: workspaceOnlyArgs,
  handler: getProjectsForApiHandler,
};

export const getPlanCatalogDefinition = {
  args: workspaceOnlyArgs,
  handler: getPlanCatalogHandler,
};
