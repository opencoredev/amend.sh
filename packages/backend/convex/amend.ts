import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import * as agent from "./amendAgentFunctionDefinitions";
import * as dev from "./amendDevFunctionDefinitions";
import * as mutations from "./amendMutationFunctionDefinitions";
import * as reads from "./amendReadFunctionDefinitions";

export const getDashboardOverview = query(agent.getDashboardOverviewDefinition);
export const getAgentRunContext = query(agent.getAgentRunContextDefinition);
export const persistProactiveAgentRun = mutation(agent.persistProactiveAgentRunDefinition);
export const runProactiveAgentForWorkspace = action(agent.runProactiveAgentForWorkspaceDefinition);

export const getPublicPortal = query(reads.getPublicPortalDefinition);
export const getReviewQueue = query(reads.getReviewQueueDefinition);
export const getNotificationCenter = query(reads.getNotificationCenterDefinition);
export const getUserUpdates = query(reads.getUserUpdatesDefinition);
export const getDeliveryOutbox = query(reads.getDeliveryOutboxDefinition);
export const getDeliveryOutboxForApi = internalQuery(reads.getDeliveryOutboxForApiDefinition);
export const getAutomationDecisions = query(reads.getAutomationDecisionsDefinition);
export const getAutomationDecisionsForApi = internalQuery(
  reads.getAutomationDecisionsForApiDefinition,
);
export const getAgentRuns = query(reads.getAgentRunsDefinition);
export const getAgentRunsForApi = internalQuery(reads.getAgentRunsForApiDefinition);
export const getSourceEvents = query(reads.getSourceEventsDefinition);
export const getSourceEventsForApi = internalQuery(reads.getSourceEventsForApiDefinition);
export const getBuildBriefs = query(reads.getBuildBriefsDefinition);
export const getBuildBriefsForApi = internalQuery(reads.getBuildBriefsForApiDefinition);
export const getWorkspaceSettings = query(reads.getWorkspaceSettingsDefinition);
export const getWorkspaceSettingsForApi = internalQuery(reads.getWorkspaceSettingsForApiDefinition);
export const resolveCustomDomain = query(reads.resolveCustomDomainDefinition);
export const getProjects = query(reads.getProjectsDefinition);
export const getProjectsForApi = internalQuery(reads.getProjectsForApiDefinition);
export const getPlanCatalog = query(reads.getPlanCatalogDefinition);
export const getWorkspace = query(reads.getWorkspaceDefinition);

export const getGitHubInstallContext = query(dev.getGitHubInstallContextDefinition);
export const listGitHubAppRepositories = action(dev.listGitHubAppRepositoriesDefinition);
export const seedDemoData = mutation(dev.seedDemoDataDefinition);
export const joinSeededDemoWorkspace = mutation(dev.joinSeededDemoWorkspaceDefinition);

export const updateAutomationRules = mutation(mutations.updateAutomationRulesDefinition);
export const upsertWorkspaceMember = mutation(mutations.upsertWorkspaceMemberDefinition);
export const upsertIntegrationConnection = mutation(
  mutations.upsertIntegrationConnectionDefinition,
);
export const updatePortalSettings = mutation(mutations.updatePortalSettingsDefinition);
export const updateWorkspace = mutation(mutations.updateWorkspaceDefinition);
export const updatePlan = mutation(mutations.updatePlanDefinition);
export const createProject = mutation(mutations.createProjectDefinition);
export const connectProjectRepository = mutation(mutations.connectProjectRepositoryDefinition);
export const markProjectFeedbackSource = mutation(mutations.markProjectFeedbackSourceDefinition);
export const updateProject = mutation(mutations.updateProjectDefinition);
export const generateProjectLogoUploadUrl = mutation(
  mutations.generateProjectLogoUploadUrlDefinition,
);
export const upsertNotificationPreference = mutation(
  mutations.upsertNotificationPreferenceDefinition,
);
export const planNotificationDeliveries = mutation(mutations.planNotificationDeliveriesDefinition);
export const trustedPlanNotificationDeliveries = internalMutation(
  mutations.trustedPlanNotificationDeliveriesDefinition,
);
export const updateDeliveryStatus = mutation(mutations.updateDeliveryStatusDefinition);
export const trustedUpdateDeliveryStatus = internalMutation(
  mutations.trustedUpdateDeliveryStatusDefinition,
);
export const registerCustomDomain = mutation(mutations.registerCustomDomainDefinition);
export const trustedRegisterCustomDomain = internalMutation(
  mutations.trustedRegisterCustomDomainDefinition,
);
export const updateCustomDomainStatus = mutation(mutations.updateCustomDomainStatusDefinition);
export const trustedUpdateCustomDomainStatus = internalMutation(
  mutations.trustedUpdateCustomDomainStatusDefinition,
);
export const identifyExternalUser = mutation(mutations.identifyExternalUserDefinition);
export const trackEvent = mutation(mutations.trackEventDefinition);
export const recordFeedbackInteraction = mutation(mutations.recordFeedbackInteractionDefinition);
export const ingestSourceEvent = mutation(mutations.ingestSourceEventDefinition);
export const trustedIngestSourceEvent = internalMutation(
  mutations.trustedIngestSourceEventDefinition,
);
export const createFeedback = mutation(mutations.createFeedbackDefinition);
export const updateReviewStatus = mutation(mutations.updateReviewStatusDefinition);
export const revertAutomationDecision = mutation(mutations.revertAutomationDecisionDefinition);
export const upsertChangelogEntry = mutation(mutations.upsertChangelogEntryDefinition);
export const trustedUpsertChangelogEntry = internalMutation(
  mutations.trustedUpsertChangelogEntryDefinition,
);
export const generateChangelogCoverUploadUrl = mutation(
  mutations.generateChangelogCoverUploadUrlDefinition,
);
export const publishChangelogEntry = mutation(mutations.publishChangelogEntryDefinition);
export const trustedPublishChangelogEntry = internalMutation(
  mutations.trustedPublishChangelogEntryDefinition,
);
export const upsertRoadmapItem = mutation(mutations.upsertRoadmapItemDefinition);
export const trustedUpsertRoadmapItem = internalMutation(
  mutations.trustedUpsertRoadmapItemDefinition,
);
export const voteRoadmapItem = mutation(mutations.voteRoadmapItemDefinition);
export const joinWaitlist = mutation(mutations.joinWaitlistDefinition);
