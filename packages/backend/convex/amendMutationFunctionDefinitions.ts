import { joinWaitlistArgs } from "./amendAccessFunctionArgs";
import { joinWaitlistHandler } from "./amendAccessMutationHandlers";
import {
  upsertChangelogEntryHandler,
  upsertRoadmapItemHandler,
  voteRoadmapItemHandler,
} from "./amendContentMutationHandlers";
import {
  connectProjectRepositoryArgs,
  createFeedbackArgs,
  createProjectArgs,
  identifyExternalUserArgs,
  ingestSourceEventArgs,
  planNotificationDeliveriesArgs,
  projectKeyArgs,
  recordFeedbackInteractionArgs,
  registerCustomDomainArgs,
  revertAutomationDecisionArgs,
  trackEventArgs,
  updateAutomationRulesArgs,
  updateCustomDomainStatusArgs,
  updateDeliveryStatusArgs,
  updatePlanArgs,
  updatePortalSettingsArgs,
  updateProjectArgs,
  updateReviewStatusArgs,
  updateWorkspaceArgs,
  upsertChangelogEntryArgs,
  upsertIntegrationConnectionArgs,
  upsertNotificationPreferenceArgs,
  upsertRoadmapItemArgs,
  upsertWorkspaceMemberArgs,
  voteRoadmapItemArgs,
} from "./amendFunctionArgs";
import {
  createFeedbackHandler,
  identifyExternalUserHandler,
  recordFeedbackInteractionHandler,
  trackEventHandler,
} from "./amendFeedbackMutationHandlers";
import {
  planNotificationDeliveriesHandler,
  registerCustomDomainHandler,
  updateCustomDomainStatusHandler,
  updateDeliveryStatusHandler,
  upsertNotificationPreferenceHandler,
} from "./amendNotificationMutationHandlers";
import { revertAutomationDecisionHandler, updateReviewStatusHandler } from "./amendReviewHandlers";
import { ingestSourceEventHandler } from "./amendSourceIngest";
import {
  connectProjectRepositoryHandler,
  createProjectHandler,
  generateProjectLogoUploadUrlHandler,
  markProjectFeedbackSourceHandler,
  updateAutomationRulesHandler,
  updatePlanHandler,
  updatePortalSettingsHandler,
  updateProjectHandler,
  updateWorkspaceHandler,
  upsertIntegrationConnectionHandler,
  upsertWorkspaceMemberHandler,
} from "./amendWorkspaceMutationHandlers";

export const updateAutomationRulesDefinition = {
  args: updateAutomationRulesArgs,
  handler: updateAutomationRulesHandler,
};

export const upsertWorkspaceMemberDefinition = {
  args: upsertWorkspaceMemberArgs,
  handler: upsertWorkspaceMemberHandler,
};

export const upsertIntegrationConnectionDefinition = {
  args: upsertIntegrationConnectionArgs,
  handler: upsertIntegrationConnectionHandler,
};

export const updatePortalSettingsDefinition = {
  args: updatePortalSettingsArgs,
  handler: updatePortalSettingsHandler,
};

export const updateWorkspaceDefinition = {
  args: updateWorkspaceArgs,
  handler: updateWorkspaceHandler,
};

export const updatePlanDefinition = {
  args: updatePlanArgs,
  handler: updatePlanHandler,
};

export const createProjectDefinition = {
  args: createProjectArgs,
  handler: createProjectHandler,
};

export const connectProjectRepositoryDefinition = {
  args: connectProjectRepositoryArgs,
  handler: connectProjectRepositoryHandler,
};

export const markProjectFeedbackSourceDefinition = {
  args: projectKeyArgs,
  handler: markProjectFeedbackSourceHandler,
};

export const updateProjectDefinition = {
  args: updateProjectArgs,
  handler: updateProjectHandler,
};

export const generateProjectLogoUploadUrlDefinition = {
  args: projectKeyArgs,
  handler: generateProjectLogoUploadUrlHandler,
};

export const upsertNotificationPreferenceDefinition = {
  args: upsertNotificationPreferenceArgs,
  handler: upsertNotificationPreferenceHandler,
};

export const planNotificationDeliveriesDefinition = {
  args: planNotificationDeliveriesArgs,
  handler: planNotificationDeliveriesHandler,
};

export const updateDeliveryStatusDefinition = {
  args: updateDeliveryStatusArgs,
  handler: updateDeliveryStatusHandler,
};

export const registerCustomDomainDefinition = {
  args: registerCustomDomainArgs,
  handler: registerCustomDomainHandler,
};

export const updateCustomDomainStatusDefinition = {
  args: updateCustomDomainStatusArgs,
  handler: updateCustomDomainStatusHandler,
};

export const identifyExternalUserDefinition = {
  args: identifyExternalUserArgs,
  handler: identifyExternalUserHandler,
};

export const trackEventDefinition = {
  args: trackEventArgs,
  handler: trackEventHandler,
};

export const recordFeedbackInteractionDefinition = {
  args: recordFeedbackInteractionArgs,
  handler: recordFeedbackInteractionHandler,
};

export const ingestSourceEventDefinition = {
  args: ingestSourceEventArgs,
  handler: ingestSourceEventHandler,
};

export const createFeedbackDefinition = {
  args: createFeedbackArgs,
  handler: createFeedbackHandler,
};

export const updateReviewStatusDefinition = {
  args: updateReviewStatusArgs,
  handler: updateReviewStatusHandler,
};

export const revertAutomationDecisionDefinition = {
  args: revertAutomationDecisionArgs,
  handler: revertAutomationDecisionHandler,
};

export const upsertChangelogEntryDefinition = {
  args: upsertChangelogEntryArgs,
  handler: upsertChangelogEntryHandler,
};

export const upsertRoadmapItemDefinition = {
  args: upsertRoadmapItemArgs,
  handler: upsertRoadmapItemHandler,
};

export const voteRoadmapItemDefinition = {
  args: voteRoadmapItemArgs,
  handler: voteRoadmapItemHandler,
};

export const joinWaitlistDefinition = {
  args: joinWaitlistArgs,
  handler: joinWaitlistHandler,
};
