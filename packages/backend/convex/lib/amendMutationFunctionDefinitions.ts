import { revertAutomationDecisionArgs, updateAutomationRulesArgs, updateReviewStatusArgs } from "../agent/amendAutomationFunctionArgs";
import { generateChangelogCoverUploadUrlArgs, publishChangelogEntryArgs, upsertChangelogEntryArgs, upsertRoadmapItemArgs, voteRoadmapItemArgs } from "../content/amendContentFunctionArgs";
import { generateChangelogCoverUploadUrlHandler, publishChangelogEntryHandler, trustedPublishChangelogEntryHandler, trustedUpsertChangelogEntryHandler, trustedUpsertRoadmapItemHandler, upsertChangelogEntryHandler, upsertRoadmapItemHandler, voteRoadmapItemHandler } from "../content/amendContentMutationHandlers";
import { createFeedbackHandler } from "../content/amendFeedbackCreateMutationHandler";
import { recordFeedbackInteractionHandler } from "../content/amendFeedbackInteractionMutationHandlers";
import { identifyExternalUserHandler, trackEventHandler } from "../content/amendFeedbackMutationHandlers";
import { planNotificationDeliveriesHandler } from "../delivery/amendDeliveryMutationHandlers";
import { planNotificationDeliveriesArgs, updateDeliveryStatusArgs, upsertNotificationPreferenceArgs } from "../delivery/amendNotificationFunctionArgs";
import { createFeedbackArgs, identifyExternalUserArgs, ingestSourceEventArgs, recordFeedbackInteractionArgs, trackEventArgs } from "../ingest/amendSignalFunctionArgs";
import { joinWaitlistArgs } from "../workspace/amendAccessFunctionArgs";
import { joinWaitlistHandler } from "../workspace/amendAccessMutationHandlers";
import { connectProjectRepositoryArgs, createProjectArgs, projectKeyArgs, registerCustomDomainArgs, updateCustomDomainStatusArgs, updatePlanArgs, updatePortalSettingsArgs, updateProjectArgs, updateWorkspaceArgs, upsertIntegrationConnectionArgs, upsertWorkspaceMemberArgs } from "../workspace/amendWorkspaceFunctionArgs";
import {
  registerCustomDomainHandler,
  trustedRegisterCustomDomainHandler,
  trustedUpdateCustomDomainStatusHandler,
  updateCustomDomainStatusHandler,
} from "../workspace/amendCustomDomainMutationHandlers";
import {
  trustedPlanNotificationDeliveriesHandler,
  trustedUpdateDeliveryStatusHandler,
  updateDeliveryStatusHandler,
} from "../delivery/amendDeliveryMutationHandlers";
import { upsertNotificationPreferenceHandler } from "../delivery/amendNotificationPreferenceMutationHandlers";
import { revertAutomationDecisionHandler, updateReviewStatusHandler } from "../content/amendReviewHandlers";
import { trustedIngestSourceEventHandler } from "../ingest/amendSourceIngest";
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
} from "../workspace/amendWorkspaceMutationHandlers";

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

export const trustedPlanNotificationDeliveriesDefinition = {
  args: planNotificationDeliveriesArgs,
  handler: trustedPlanNotificationDeliveriesHandler,
};

export const updateDeliveryStatusDefinition = {
  args: updateDeliveryStatusArgs,
  handler: updateDeliveryStatusHandler,
};

export const trustedUpdateDeliveryStatusDefinition = {
  args: updateDeliveryStatusArgs,
  handler: trustedUpdateDeliveryStatusHandler,
};

export const registerCustomDomainDefinition = {
  args: registerCustomDomainArgs,
  handler: registerCustomDomainHandler,
};

export const trustedRegisterCustomDomainDefinition = {
  args: registerCustomDomainArgs,
  handler: trustedRegisterCustomDomainHandler,
};

export const updateCustomDomainStatusDefinition = {
  args: updateCustomDomainStatusArgs,
  handler: updateCustomDomainStatusHandler,
};

export const trustedUpdateCustomDomainStatusDefinition = {
  args: updateCustomDomainStatusArgs,
  handler: trustedUpdateCustomDomainStatusHandler,
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

export const trustedIngestSourceEventDefinition = {
  args: ingestSourceEventArgs,
  handler: trustedIngestSourceEventHandler,
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

export const trustedUpsertChangelogEntryDefinition = {
  args: upsertChangelogEntryArgs,
  handler: trustedUpsertChangelogEntryHandler,
};

export const generateChangelogCoverUploadUrlDefinition = {
  args: generateChangelogCoverUploadUrlArgs,
  handler: generateChangelogCoverUploadUrlHandler,
};

export const publishChangelogEntryDefinition = {
  args: publishChangelogEntryArgs,
  handler: publishChangelogEntryHandler,
};

export const trustedPublishChangelogEntryDefinition = {
  args: publishChangelogEntryArgs,
  handler: trustedPublishChangelogEntryHandler,
};

export const upsertRoadmapItemDefinition = {
  args: upsertRoadmapItemArgs,
  handler: upsertRoadmapItemHandler,
};

export const trustedUpsertRoadmapItemDefinition = {
  args: upsertRoadmapItemArgs,
  handler: trustedUpsertRoadmapItemHandler,
};

export const voteRoadmapItemDefinition = {
  args: voteRoadmapItemArgs,
  handler: voteRoadmapItemHandler,
};

export const joinWaitlistDefinition = {
  args: joinWaitlistArgs,
  handler: joinWaitlistHandler,
};
