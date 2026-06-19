/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent from "../agent.js";
import type * as amend from "../amend.js";
import type * as amendAccessFunctionArgs from "../amendAccessFunctionArgs.js";
import type * as amendAccessMutationHandlers from "../amendAccessMutationHandlers.js";
import type * as amendAgent from "../amendAgent.js";
import type * as amendAgentDecisionNormalizer from "../amendAgentDecisionNormalizer.js";
import type * as amendAgentFallback from "../amendAgentFallback.js";
import type * as amendAgentFunctionDefinitions from "../amendAgentFunctionDefinitions.js";
import type * as amendAgentProvider from "../amendAgentProvider.js";
import type * as amendAgentRunContextHandler from "../amendAgentRunContextHandler.js";
import type * as amendAgentRunHandlers from "../amendAgentRunHandlers.js";
import type * as amendAgentRunPersistence from "../amendAgentRunPersistence.js";
import type * as amendAgentRunTypes from "../amendAgentRunTypes.js";
import type * as amendAgentTypes from "../amendAgentTypes.js";
import type * as amendAnalytics from "../amendAnalytics.js";
import type * as amendAnalyticsEvents from "../amendAnalyticsEvents.js";
import type * as amendAutomationFunctionArgs from "../amendAutomationFunctionArgs.js";
import type * as amendAutomationRecordNormalizers from "../amendAutomationRecordNormalizers.js";
import type * as amendAutomationRulesMutationHandlers from "../amendAutomationRulesMutationHandlers.js";
import type * as amendBackendUtils from "../amendBackendUtils.js";
import type * as amendContentFunctionArgs from "../amendContentFunctionArgs.js";
import type * as amendContentMutationHandlers from "../amendContentMutationHandlers.js";
import type * as amendCustomDomainMutationHandlers from "../amendCustomDomainMutationHandlers.js";
import type * as amendDashboardActivity from "../amendDashboardActivity.js";
import type * as amendDashboardFallbacks from "../amendDashboardFallbacks.js";
import type * as amendDashboardOverview from "../amendDashboardOverview.js";
import type * as amendDashboardOverviewRecords from "../amendDashboardOverviewRecords.js";
import type * as amendDecisionRevertHandlers from "../amendDecisionRevertHandlers.js";
import type * as amendDeliveryMutationHandlers from "../amendDeliveryMutationHandlers.js";
import type * as amendDemoContent from "../amendDemoContent.js";
import type * as amendDemoCore from "../amendDemoCore.js";
import type * as amendDemoData from "../amendDemoData.js";
import type * as amendDemoPlanData from "../amendDemoPlanData.js";
import type * as amendDemoSettingsData from "../amendDemoSettingsData.js";
import type * as amendDemoSourceEvents from "../amendDemoSourceEvents.js";
import type * as amendDemoWorkspaceData from "../amendDemoWorkspaceData.js";
import type * as amendDevAndGithubHandlers from "../amendDevAndGithubHandlers.js";
import type * as amendDevFunctionDefinitions from "../amendDevFunctionDefinitions.js";
import type * as amendFeedbackCreateMutationHandler from "../amendFeedbackCreateMutationHandler.js";
import type * as amendFeedbackIdentityMutationHandlers from "../amendFeedbackIdentityMutationHandlers.js";
import type * as amendFeedbackInteractionMutationHandlers from "../amendFeedbackInteractionMutationHandlers.js";
import type * as amendFeedbackMutationHandlers from "../amendFeedbackMutationHandlers.js";
import type * as amendFeedbackTypes from "../amendFeedbackTypes.js";
import type * as amendFunctionArgShared from "../amendFunctionArgShared.js";
import type * as amendFunctionArgs from "../amendFunctionArgs.js";
import type * as amendGithub from "../amendGithub.js";
import type * as amendIntegrationMutationHandlers from "../amendIntegrationMutationHandlers.js";
import type * as amendLegacyWorkspaceHandler from "../amendLegacyWorkspaceHandler.js";
import type * as amendMutationFunctionDefinitions from "../amendMutationFunctionDefinitions.js";
import type * as amendNormalizers from "../amendNormalizers.js";
import type * as amendNotificationFunctionArgs from "../amendNotificationFunctionArgs.js";
import type * as amendNotificationMutationHandlers from "../amendNotificationMutationHandlers.js";
import type * as amendNotificationPreferenceMutationHandlers from "../amendNotificationPreferenceMutationHandlers.js";
import type * as amendNotifications from "../amendNotifications.js";
import type * as amendOperationalReadHandlers from "../amendOperationalReadHandlers.js";
import type * as amendOperationalReadQueries from "../amendOperationalReadQueries.js";
import type * as amendPlanMutationHandlers from "../amendPlanMutationHandlers.js";
import type * as amendPortalReadHandlers from "../amendPortalReadHandlers.js";
import type * as amendProductRecordNormalizers from "../amendProductRecordNormalizers.js";
import type * as amendProjectCreateHandlers from "../amendProjectCreateHandlers.js";
import type * as amendProjectLookup from "../amendProjectLookup.js";
import type * as amendProjectMutationHandlers from "../amendProjectMutationHandlers.js";
import type * as amendProjectMutationTypes from "../amendProjectMutationTypes.js";
import type * as amendProjectSourceHandlers from "../amendProjectSourceHandlers.js";
import type * as amendProjectUpdateHandlers from "../amendProjectUpdateHandlers.js";
import type * as amendProviderLabels from "../amendProviderLabels.js";
import type * as amendReadFunctionArgs from "../amendReadFunctionArgs.js";
import type * as amendReadFunctionDefinitions from "../amendReadFunctionDefinitions.js";
import type * as amendReadHandlers from "../amendReadHandlers.js";
import type * as amendRecordNormalizers from "../amendRecordNormalizers.js";
import type * as amendReviewHandlers from "../amendReviewHandlers.js";
import type * as amendReviewStatusHandlers from "../amendReviewStatusHandlers.js";
import type * as amendSeed from "../amendSeed.js";
import type * as amendSeedBase from "../amendSeedBase.js";
import type * as amendSeedContent from "../amendSeedContent.js";
import type * as amendSeedPrimaryRecords from "../amendSeedPrimaryRecords.js";
import type * as amendSeedWorkflowRecords from "../amendSeedWorkflowRecords.js";
import type * as amendSignalFunctionArgs from "../amendSignalFunctionArgs.js";
import type * as amendSourceIngest from "../amendSourceIngest.js";
import type * as amendSourceIngestChangelog from "../amendSourceIngestChangelog.js";
import type * as amendSourceIngestDecisions from "../amendSourceIngestDecisions.js";
import type * as amendSourceIngestModel from "../amendSourceIngestModel.js";
import type * as amendSourceIngestRelations from "../amendSourceIngestRelations.js";
import type * as amendSourceIngestShipped from "../amendSourceIngestShipped.js";
import type * as amendSourceLinks from "../amendSourceLinks.js";
import type * as amendSourceNotifications from "../amendSourceNotifications.js";
import type * as amendTransactionalEmails from "../amendTransactionalEmails.js";
import type * as amendTypes from "../amendTypes.js";
import type * as amendUserUpdateReadHandlers from "../amendUserUpdateReadHandlers.js";
import type * as amendValidators from "../amendValidators.js";
import type * as amendWorkspace from "../amendWorkspace.js";
import type * as amendWorkspaceAccess from "../amendWorkspaceAccess.js";
import type * as amendWorkspaceAdminMutationHandlers from "../amendWorkspaceAdminMutationHandlers.js";
import type * as amendWorkspaceDomainReadHandlers from "../amendWorkspaceDomainReadHandlers.js";
import type * as amendWorkspaceFunctionArgs from "../amendWorkspaceFunctionArgs.js";
import type * as amendWorkspaceMemberMutationHandlers from "../amendWorkspaceMemberMutationHandlers.js";
import type * as amendWorkspaceMutationHandlers from "../amendWorkspaceMutationHandlers.js";
import type * as amendWorkspacePlanReadHandlers from "../amendWorkspacePlanReadHandlers.js";
import type * as amendWorkspaceProjectReadHandlers from "../amendWorkspaceProjectReadHandlers.js";
import type * as amendWorkspaceProvisioning from "../amendWorkspaceProvisioning.js";
import type * as amendWorkspaceReadHandlers from "../amendWorkspaceReadHandlers.js";
import type * as amendWorkspaceRecordNormalizers from "../amendWorkspaceRecordNormalizers.js";
import type * as amendWorkspaceSettingsMutationHandlers from "../amendWorkspaceSettingsMutationHandlers.js";
import type * as amendWorkspaceSettingsReadHandlers from "../amendWorkspaceSettingsReadHandlers.js";
import type * as auth from "../auth.js";
import type * as backfill from "../backfill.js";
import type * as changelog from "../changelog.js";
import type * as crons from "../crons.js";
import type * as digest from "../digest.js";
import type * as drafts from "../drafts.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as httpRestGet from "../httpRestGet.js";
import type * as httpRestPost from "../httpRestPost.js";
import type * as httpRestPostAutomation from "../httpRestPostAutomation.js";
import type * as httpRestPostSignals from "../httpRestPostSignals.js";
import type * as httpRestPostTypes from "../httpRestPostTypes.js";
import type * as httpRestPostWorkspace from "../httpRestPostWorkspace.js";
import type * as httpRuntime from "../httpRuntime.js";
import type * as httpRuntimeAuth from "../httpRuntimeAuth.js";
import type * as httpRuntimeDeliveries from "../httpRuntimeDeliveries.js";
import type * as httpRuntimeDns from "../httpRuntimeDns.js";
import type * as httpRuntimeDrafts from "../httpRuntimeDrafts.js";
import type * as httpRuntimeEnumInputs from "../httpRuntimeEnumInputs.js";
import type * as httpRuntimeGithubSourceEvents from "../httpRuntimeGithubSourceEvents.js";
import type * as httpRuntimeInputScalars from "../httpRuntimeInputScalars.js";
import type * as httpRuntimeInputs from "../httpRuntimeInputs.js";
import type * as httpRuntimeMetadata from "../httpRuntimeMetadata.js";
import type * as httpRuntimeRouting from "../httpRuntimeRouting.js";
import type * as httpRuntimeScalars from "../httpRuntimeScalars.js";
import type * as httpRuntimeSourceEventInputs from "../httpRuntimeSourceEventInputs.js";
import type * as httpRuntimeSourceEventTypes from "../httpRuntimeSourceEventTypes.js";
import type * as httpRuntimeStripe from "../httpRuntimeStripe.js";
import type * as ingest from "../ingest.js";
import type * as memory from "../memory.js";
import type * as needs from "../needs.js";
import type * as pipeline from "../pipeline.js";
import type * as posthog from "../posthog.js";
import type * as privateData from "../privateData.js";
import type * as proactiveArgs from "../proactiveArgs.js";
import type * as proactiveClassifier from "../proactiveClassifier.js";
import type * as proactiveProof from "../proactiveProof.js";
import type * as proactiveShared from "../proactiveShared.js";
import type * as proactiveValidators from "../proactiveValidators.js";
import type * as projectWebsiteEnrichment from "../projectWebsiteEnrichment.js";
import type * as projectWebsiteMetadata from "../projectWebsiteMetadata.js";
import type * as projectWebsiteSuggestions from "../projectWebsiteSuggestions.js";
import type * as projectWebsiteUrl from "../projectWebsiteUrl.js";
import type * as projects from "../projects.js";
import type * as schemaProactiveTables from "../schemaProactiveTables.js";
import type * as schemaProductCommon from "../schemaProductCommon.js";
import type * as schemaProductContentTables from "../schemaProductContentTables.js";
import type * as schemaProductIdentityTables from "../schemaProductIdentityTables.js";
import type * as schemaProductNotificationTables from "../schemaProductNotificationTables.js";
import type * as schemaProductReviewTables from "../schemaProductReviewTables.js";
import type * as schemaProductTables from "../schemaProductTables.js";
import type * as schemaShared from "../schemaShared.js";
import type * as schemaWorkspaceAutomationTables from "../schemaWorkspaceAutomationTables.js";
import type * as schemaWorkspaceCoreTables from "../schemaWorkspaceCoreTables.js";
import type * as schemaWorkspaceIntegrationTables from "../schemaWorkspaceIntegrationTables.js";
import type * as schemaWorkspaceSourceTables from "../schemaWorkspaceSourceTables.js";
import type * as schemaWorkspaceTables from "../schemaWorkspaceTables.js";
import type * as signatures from "../signatures.js";
import type * as sources from "../sources.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  amend: typeof amend;
  amendAccessFunctionArgs: typeof amendAccessFunctionArgs;
  amendAccessMutationHandlers: typeof amendAccessMutationHandlers;
  amendAgent: typeof amendAgent;
  amendAgentDecisionNormalizer: typeof amendAgentDecisionNormalizer;
  amendAgentFallback: typeof amendAgentFallback;
  amendAgentFunctionDefinitions: typeof amendAgentFunctionDefinitions;
  amendAgentProvider: typeof amendAgentProvider;
  amendAgentRunContextHandler: typeof amendAgentRunContextHandler;
  amendAgentRunHandlers: typeof amendAgentRunHandlers;
  amendAgentRunPersistence: typeof amendAgentRunPersistence;
  amendAgentRunTypes: typeof amendAgentRunTypes;
  amendAgentTypes: typeof amendAgentTypes;
  amendAnalytics: typeof amendAnalytics;
  amendAnalyticsEvents: typeof amendAnalyticsEvents;
  amendAutomationFunctionArgs: typeof amendAutomationFunctionArgs;
  amendAutomationRecordNormalizers: typeof amendAutomationRecordNormalizers;
  amendAutomationRulesMutationHandlers: typeof amendAutomationRulesMutationHandlers;
  amendBackendUtils: typeof amendBackendUtils;
  amendContentFunctionArgs: typeof amendContentFunctionArgs;
  amendContentMutationHandlers: typeof amendContentMutationHandlers;
  amendCustomDomainMutationHandlers: typeof amendCustomDomainMutationHandlers;
  amendDashboardActivity: typeof amendDashboardActivity;
  amendDashboardFallbacks: typeof amendDashboardFallbacks;
  amendDashboardOverview: typeof amendDashboardOverview;
  amendDashboardOverviewRecords: typeof amendDashboardOverviewRecords;
  amendDecisionRevertHandlers: typeof amendDecisionRevertHandlers;
  amendDeliveryMutationHandlers: typeof amendDeliveryMutationHandlers;
  amendDemoContent: typeof amendDemoContent;
  amendDemoCore: typeof amendDemoCore;
  amendDemoData: typeof amendDemoData;
  amendDemoPlanData: typeof amendDemoPlanData;
  amendDemoSettingsData: typeof amendDemoSettingsData;
  amendDemoSourceEvents: typeof amendDemoSourceEvents;
  amendDemoWorkspaceData: typeof amendDemoWorkspaceData;
  amendDevAndGithubHandlers: typeof amendDevAndGithubHandlers;
  amendDevFunctionDefinitions: typeof amendDevFunctionDefinitions;
  amendFeedbackCreateMutationHandler: typeof amendFeedbackCreateMutationHandler;
  amendFeedbackIdentityMutationHandlers: typeof amendFeedbackIdentityMutationHandlers;
  amendFeedbackInteractionMutationHandlers: typeof amendFeedbackInteractionMutationHandlers;
  amendFeedbackMutationHandlers: typeof amendFeedbackMutationHandlers;
  amendFeedbackTypes: typeof amendFeedbackTypes;
  amendFunctionArgShared: typeof amendFunctionArgShared;
  amendFunctionArgs: typeof amendFunctionArgs;
  amendGithub: typeof amendGithub;
  amendIntegrationMutationHandlers: typeof amendIntegrationMutationHandlers;
  amendLegacyWorkspaceHandler: typeof amendLegacyWorkspaceHandler;
  amendMutationFunctionDefinitions: typeof amendMutationFunctionDefinitions;
  amendNormalizers: typeof amendNormalizers;
  amendNotificationFunctionArgs: typeof amendNotificationFunctionArgs;
  amendNotificationMutationHandlers: typeof amendNotificationMutationHandlers;
  amendNotificationPreferenceMutationHandlers: typeof amendNotificationPreferenceMutationHandlers;
  amendNotifications: typeof amendNotifications;
  amendOperationalReadHandlers: typeof amendOperationalReadHandlers;
  amendOperationalReadQueries: typeof amendOperationalReadQueries;
  amendPlanMutationHandlers: typeof amendPlanMutationHandlers;
  amendPortalReadHandlers: typeof amendPortalReadHandlers;
  amendProductRecordNormalizers: typeof amendProductRecordNormalizers;
  amendProjectCreateHandlers: typeof amendProjectCreateHandlers;
  amendProjectLookup: typeof amendProjectLookup;
  amendProjectMutationHandlers: typeof amendProjectMutationHandlers;
  amendProjectMutationTypes: typeof amendProjectMutationTypes;
  amendProjectSourceHandlers: typeof amendProjectSourceHandlers;
  amendProjectUpdateHandlers: typeof amendProjectUpdateHandlers;
  amendProviderLabels: typeof amendProviderLabels;
  amendReadFunctionArgs: typeof amendReadFunctionArgs;
  amendReadFunctionDefinitions: typeof amendReadFunctionDefinitions;
  amendReadHandlers: typeof amendReadHandlers;
  amendRecordNormalizers: typeof amendRecordNormalizers;
  amendReviewHandlers: typeof amendReviewHandlers;
  amendReviewStatusHandlers: typeof amendReviewStatusHandlers;
  amendSeed: typeof amendSeed;
  amendSeedBase: typeof amendSeedBase;
  amendSeedContent: typeof amendSeedContent;
  amendSeedPrimaryRecords: typeof amendSeedPrimaryRecords;
  amendSeedWorkflowRecords: typeof amendSeedWorkflowRecords;
  amendSignalFunctionArgs: typeof amendSignalFunctionArgs;
  amendSourceIngest: typeof amendSourceIngest;
  amendSourceIngestChangelog: typeof amendSourceIngestChangelog;
  amendSourceIngestDecisions: typeof amendSourceIngestDecisions;
  amendSourceIngestModel: typeof amendSourceIngestModel;
  amendSourceIngestRelations: typeof amendSourceIngestRelations;
  amendSourceIngestShipped: typeof amendSourceIngestShipped;
  amendSourceLinks: typeof amendSourceLinks;
  amendSourceNotifications: typeof amendSourceNotifications;
  amendTransactionalEmails: typeof amendTransactionalEmails;
  amendTypes: typeof amendTypes;
  amendUserUpdateReadHandlers: typeof amendUserUpdateReadHandlers;
  amendValidators: typeof amendValidators;
  amendWorkspace: typeof amendWorkspace;
  amendWorkspaceAccess: typeof amendWorkspaceAccess;
  amendWorkspaceAdminMutationHandlers: typeof amendWorkspaceAdminMutationHandlers;
  amendWorkspaceDomainReadHandlers: typeof amendWorkspaceDomainReadHandlers;
  amendWorkspaceFunctionArgs: typeof amendWorkspaceFunctionArgs;
  amendWorkspaceMemberMutationHandlers: typeof amendWorkspaceMemberMutationHandlers;
  amendWorkspaceMutationHandlers: typeof amendWorkspaceMutationHandlers;
  amendWorkspacePlanReadHandlers: typeof amendWorkspacePlanReadHandlers;
  amendWorkspaceProjectReadHandlers: typeof amendWorkspaceProjectReadHandlers;
  amendWorkspaceProvisioning: typeof amendWorkspaceProvisioning;
  amendWorkspaceReadHandlers: typeof amendWorkspaceReadHandlers;
  amendWorkspaceRecordNormalizers: typeof amendWorkspaceRecordNormalizers;
  amendWorkspaceSettingsMutationHandlers: typeof amendWorkspaceSettingsMutationHandlers;
  amendWorkspaceSettingsReadHandlers: typeof amendWorkspaceSettingsReadHandlers;
  auth: typeof auth;
  backfill: typeof backfill;
  changelog: typeof changelog;
  crons: typeof crons;
  digest: typeof digest;
  drafts: typeof drafts;
  healthCheck: typeof healthCheck;
  http: typeof http;
  httpRestGet: typeof httpRestGet;
  httpRestPost: typeof httpRestPost;
  httpRestPostAutomation: typeof httpRestPostAutomation;
  httpRestPostSignals: typeof httpRestPostSignals;
  httpRestPostTypes: typeof httpRestPostTypes;
  httpRestPostWorkspace: typeof httpRestPostWorkspace;
  httpRuntime: typeof httpRuntime;
  httpRuntimeAuth: typeof httpRuntimeAuth;
  httpRuntimeDeliveries: typeof httpRuntimeDeliveries;
  httpRuntimeDns: typeof httpRuntimeDns;
  httpRuntimeDrafts: typeof httpRuntimeDrafts;
  httpRuntimeEnumInputs: typeof httpRuntimeEnumInputs;
  httpRuntimeGithubSourceEvents: typeof httpRuntimeGithubSourceEvents;
  httpRuntimeInputScalars: typeof httpRuntimeInputScalars;
  httpRuntimeInputs: typeof httpRuntimeInputs;
  httpRuntimeMetadata: typeof httpRuntimeMetadata;
  httpRuntimeRouting: typeof httpRuntimeRouting;
  httpRuntimeScalars: typeof httpRuntimeScalars;
  httpRuntimeSourceEventInputs: typeof httpRuntimeSourceEventInputs;
  httpRuntimeSourceEventTypes: typeof httpRuntimeSourceEventTypes;
  httpRuntimeStripe: typeof httpRuntimeStripe;
  ingest: typeof ingest;
  memory: typeof memory;
  needs: typeof needs;
  pipeline: typeof pipeline;
  posthog: typeof posthog;
  privateData: typeof privateData;
  proactiveArgs: typeof proactiveArgs;
  proactiveClassifier: typeof proactiveClassifier;
  proactiveProof: typeof proactiveProof;
  proactiveShared: typeof proactiveShared;
  proactiveValidators: typeof proactiveValidators;
  projectWebsiteEnrichment: typeof projectWebsiteEnrichment;
  projectWebsiteMetadata: typeof projectWebsiteMetadata;
  projectWebsiteSuggestions: typeof projectWebsiteSuggestions;
  projectWebsiteUrl: typeof projectWebsiteUrl;
  projects: typeof projects;
  schemaProactiveTables: typeof schemaProactiveTables;
  schemaProductCommon: typeof schemaProductCommon;
  schemaProductContentTables: typeof schemaProductContentTables;
  schemaProductIdentityTables: typeof schemaProductIdentityTables;
  schemaProductNotificationTables: typeof schemaProductNotificationTables;
  schemaProductReviewTables: typeof schemaProductReviewTables;
  schemaProductTables: typeof schemaProductTables;
  schemaShared: typeof schemaShared;
  schemaWorkspaceAutomationTables: typeof schemaWorkspaceAutomationTables;
  schemaWorkspaceCoreTables: typeof schemaWorkspaceCoreTables;
  schemaWorkspaceIntegrationTables: typeof schemaWorkspaceIntegrationTables;
  schemaWorkspaceSourceTables: typeof schemaWorkspaceSourceTables;
  schemaWorkspaceTables: typeof schemaWorkspaceTables;
  signatures: typeof signatures;
  sources: typeof sources;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  posthog: import("@posthog/convex/_generated/component.js").ComponentApi<"posthog">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
