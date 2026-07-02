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
import type * as agent_amendAgent from "../agent/amendAgent.js";
import type * as agent_amendAgentDecisionNormalizer from "../agent/amendAgentDecisionNormalizer.js";
import type * as agent_amendAgentFallback from "../agent/amendAgentFallback.js";
import type * as agent_amendAgentFunctionDefinitions from "../agent/amendAgentFunctionDefinitions.js";
import type * as agent_amendAgentProvider from "../agent/amendAgentProvider.js";
import type * as agent_amendAgentRunContextHandler from "../agent/amendAgentRunContextHandler.js";
import type * as agent_amendAgentRunHandlers from "../agent/amendAgentRunHandlers.js";
import type * as agent_amendAgentRunPersistence from "../agent/amendAgentRunPersistence.js";
import type * as agent_amendAgentRunTypes from "../agent/amendAgentRunTypes.js";
import type * as agent_amendAgentTypes from "../agent/amendAgentTypes.js";
import type * as agent_amendAutomationFunctionArgs from "../agent/amendAutomationFunctionArgs.js";
import type * as agent_amendAutomationRecordNormalizers from "../agent/amendAutomationRecordNormalizers.js";
import type * as agent_amendAutomationRulesMutationHandlers from "../agent/amendAutomationRulesMutationHandlers.js";
import type * as agent_amendDecisionRevertHandlers from "../agent/amendDecisionRevertHandlers.js";
import type * as amend from "../amend.js";
import type * as amendGithubInstall from "../amendGithubInstall.js";
import type * as amendPurge from "../amendPurge.js";
import type * as auth from "../auth.js";
import type * as backfill from "../backfill.js";
import type * as changelog from "../changelog.js";
import type * as changelogScheduler from "../changelogScheduler.js";
import type * as channelRoutes from "../channelRoutes.js";
import type * as content_amendContentFunctionArgs from "../content/amendContentFunctionArgs.js";
import type * as content_amendContentMutationHandlers from "../content/amendContentMutationHandlers.js";
import type * as content_amendFeedbackCreateMutationHandler from "../content/amendFeedbackCreateMutationHandler.js";
import type * as content_amendFeedbackIdentityMutationHandlers from "../content/amendFeedbackIdentityMutationHandlers.js";
import type * as content_amendFeedbackInteractionMutationHandlers from "../content/amendFeedbackInteractionMutationHandlers.js";
import type * as content_amendFeedbackMutationHandlers from "../content/amendFeedbackMutationHandlers.js";
import type * as content_amendFeedbackTypes from "../content/amendFeedbackTypes.js";
import type * as content_amendPortalReadHandlers from "../content/amendPortalReadHandlers.js";
import type * as content_amendProductRecordNormalizers from "../content/amendProductRecordNormalizers.js";
import type * as content_amendReviewHandlers from "../content/amendReviewHandlers.js";
import type * as content_amendReviewStatusHandlers from "../content/amendReviewStatusHandlers.js";
import type * as content_amendUserUpdateReadHandlers from "../content/amendUserUpdateReadHandlers.js";
import type * as convexDiscordDelivery from "../convexDiscordDelivery.js";
import type * as convexDiscordInteractions from "../convexDiscordInteractions.js";
import type * as convexDiscordMessages from "../convexDiscordMessages.js";
import type * as crons from "../crons.js";
import type * as dashboard_amendAnalytics from "../dashboard/amendAnalytics.js";
import type * as dashboard_amendAnalyticsEvents from "../dashboard/amendAnalyticsEvents.js";
import type * as dashboard_amendDashboardActivity from "../dashboard/amendDashboardActivity.js";
import type * as dashboard_amendDashboardFallbacks from "../dashboard/amendDashboardFallbacks.js";
import type * as dashboard_amendDashboardOverview from "../dashboard/amendDashboardOverview.js";
import type * as dashboard_amendDashboardOverviewRecords from "../dashboard/amendDashboardOverviewRecords.js";
import type * as dashboard_amendOperationalReadHandlers from "../dashboard/amendOperationalReadHandlers.js";
import type * as dashboard_amendOperationalReadQueries from "../dashboard/amendOperationalReadQueries.js";
import type * as dashboard_amendReadFunctionArgs from "../dashboard/amendReadFunctionArgs.js";
import type * as dashboard_amendReadFunctionDefinitions from "../dashboard/amendReadFunctionDefinitions.js";
import type * as dashboard_amendReadHandlers from "../dashboard/amendReadHandlers.js";
import type * as delivery_amendDeliveryMutationHandlers from "../delivery/amendDeliveryMutationHandlers.js";
import type * as delivery_amendNotificationFunctionArgs from "../delivery/amendNotificationFunctionArgs.js";
import type * as delivery_amendNotificationMutationHandlers from "../delivery/amendNotificationMutationHandlers.js";
import type * as delivery_amendNotificationPreferenceMutationHandlers from "../delivery/amendNotificationPreferenceMutationHandlers.js";
import type * as delivery_amendNotifications from "../delivery/amendNotifications.js";
import type * as delivery_amendTransactionalEmails from "../delivery/amendTransactionalEmails.js";
import type * as delivery_httpRuntimeDeliveries from "../delivery/httpRuntimeDeliveries.js";
import type * as deliveryScheduler from "../deliveryScheduler.js";
import type * as demo_amendDemoContent from "../demo/amendDemoContent.js";
import type * as demo_amendDemoCore from "../demo/amendDemoCore.js";
import type * as demo_amendDemoData from "../demo/amendDemoData.js";
import type * as demo_amendDemoPlanData from "../demo/amendDemoPlanData.js";
import type * as demo_amendDemoSettingsData from "../demo/amendDemoSettingsData.js";
import type * as demo_amendDemoSourceEvents from "../demo/amendDemoSourceEvents.js";
import type * as demo_amendDemoWorkspaceData from "../demo/amendDemoWorkspaceData.js";
import type * as demo_amendSeed from "../demo/amendSeed.js";
import type * as demo_amendSeedBase from "../demo/amendSeedBase.js";
import type * as demo_amendSeedContent from "../demo/amendSeedContent.js";
import type * as demo_amendSeedPrimaryRecords from "../demo/amendSeedPrimaryRecords.js";
import type * as demo_amendSeedWorkflowRecords from "../demo/amendSeedWorkflowRecords.js";
import type * as digest from "../digest.js";
import type * as drafts from "../drafts.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as httpRestGet from "../httpRestGet.js";
import type * as httpRestPost from "../httpRestPost.js";
import type * as ingest from "../ingest.js";
import type * as ingest_amendSignalFunctionArgs from "../ingest/amendSignalFunctionArgs.js";
import type * as ingest_amendSourceIngest from "../ingest/amendSourceIngest.js";
import type * as ingest_amendSourceIngestChangelog from "../ingest/amendSourceIngestChangelog.js";
import type * as ingest_amendSourceIngestDecisions from "../ingest/amendSourceIngestDecisions.js";
import type * as ingest_amendSourceIngestModel from "../ingest/amendSourceIngestModel.js";
import type * as ingest_amendSourceIngestRelations from "../ingest/amendSourceIngestRelations.js";
import type * as ingest_amendSourceIngestShipped from "../ingest/amendSourceIngestShipped.js";
import type * as ingest_amendSourceLinks from "../ingest/amendSourceLinks.js";
import type * as ingest_amendSourceNotifications from "../ingest/amendSourceNotifications.js";
import type * as ingest_channelRouting from "../ingest/channelRouting.js";
import type * as ingest_httpRuntimeGithubSourceEvents from "../ingest/httpRuntimeGithubSourceEvents.js";
import type * as ingest_httpRuntimeSourceEventInputs from "../ingest/httpRuntimeSourceEventInputs.js";
import type * as ingest_httpRuntimeSourceEventTypes from "../ingest/httpRuntimeSourceEventTypes.js";
import type * as lib_amendBackendUtils from "../lib/amendBackendUtils.js";
import type * as lib_amendDevAndGithubHandlers from "../lib/amendDevAndGithubHandlers.js";
import type * as lib_amendDevFunctionDefinitions from "../lib/amendDevFunctionDefinitions.js";
import type * as lib_amendFunctionArgShared from "../lib/amendFunctionArgShared.js";
import type * as lib_amendFunctionArgs from "../lib/amendFunctionArgs.js";
import type * as lib_amendGithub from "../lib/amendGithub.js";
import type * as lib_amendMutationFunctionDefinitions from "../lib/amendMutationFunctionDefinitions.js";
import type * as lib_amendNormalizers from "../lib/amendNormalizers.js";
import type * as lib_amendProviderLabels from "../lib/amendProviderLabels.js";
import type * as lib_amendRecordNormalizers from "../lib/amendRecordNormalizers.js";
import type * as lib_amendTypes from "../lib/amendTypes.js";
import type * as lib_amendValidators from "../lib/amendValidators.js";
import type * as lib_httpRestPostAutomation from "../lib/httpRestPostAutomation.js";
import type * as lib_httpRestPostSignals from "../lib/httpRestPostSignals.js";
import type * as lib_httpRestPostTypes from "../lib/httpRestPostTypes.js";
import type * as lib_httpRestPostWorkspace from "../lib/httpRestPostWorkspace.js";
import type * as lib_httpRuntime from "../lib/httpRuntime.js";
import type * as lib_httpRuntimeAuth from "../lib/httpRuntimeAuth.js";
import type * as lib_httpRuntimeDns from "../lib/httpRuntimeDns.js";
import type * as lib_httpRuntimeDrafts from "../lib/httpRuntimeDrafts.js";
import type * as lib_httpRuntimeEnumInputs from "../lib/httpRuntimeEnumInputs.js";
import type * as lib_httpRuntimeInputScalars from "../lib/httpRuntimeInputScalars.js";
import type * as lib_httpRuntimeInputs from "../lib/httpRuntimeInputs.js";
import type * as lib_httpRuntimeMetadata from "../lib/httpRuntimeMetadata.js";
import type * as lib_httpRuntimeRouting from "../lib/httpRuntimeRouting.js";
import type * as lib_httpRuntimeScalars from "../lib/httpRuntimeScalars.js";
import type * as lib_httpRuntimeStripe from "../lib/httpRuntimeStripe.js";
import type * as lib_posthog from "../lib/posthog.js";
import type * as lib_signatures from "../lib/signatures.js";
import type * as memory from "../memory.js";
import type * as needs from "../needs.js";
import type * as pipeline from "../pipeline.js";
import type * as pipeline_proactiveArgs from "../pipeline/proactiveArgs.js";
import type * as pipeline_proactiveClassifier from "../pipeline/proactiveClassifier.js";
import type * as pipeline_proactiveProof from "../pipeline/proactiveProof.js";
import type * as pipeline_proactiveShared from "../pipeline/proactiveShared.js";
import type * as pipeline_proactiveValidators from "../pipeline/proactiveValidators.js";
import type * as pipeline_signalTriage from "../pipeline/signalTriage.js";
import type * as privateData from "../privateData.js";
import type * as projectSetup_amendProjectCreateHandlers from "../projectSetup/amendProjectCreateHandlers.js";
import type * as projectSetup_amendProjectLookup from "../projectSetup/amendProjectLookup.js";
import type * as projectSetup_amendProjectMutationHandlers from "../projectSetup/amendProjectMutationHandlers.js";
import type * as projectSetup_amendProjectMutationTypes from "../projectSetup/amendProjectMutationTypes.js";
import type * as projectSetup_amendProjectSourceHandlers from "../projectSetup/amendProjectSourceHandlers.js";
import type * as projectSetup_amendProjectUpdateHandlers from "../projectSetup/amendProjectUpdateHandlers.js";
import type * as projectSetup_projectWebsiteEnrichment from "../projectSetup/projectWebsiteEnrichment.js";
import type * as projectSetup_projectWebsiteMetadata from "../projectSetup/projectWebsiteMetadata.js";
import type * as projectSetup_projectWebsiteSuggestions from "../projectSetup/projectWebsiteSuggestions.js";
import type * as projectSetup_projectWebsiteUrl from "../projectSetup/projectWebsiteUrl.js";
import type * as projects from "../projects.js";
import type * as schema_schemaProactiveTables from "../schema/schemaProactiveTables.js";
import type * as schema_schemaProductCommon from "../schema/schemaProductCommon.js";
import type * as schema_schemaProductContentTables from "../schema/schemaProductContentTables.js";
import type * as schema_schemaProductIdentityTables from "../schema/schemaProductIdentityTables.js";
import type * as schema_schemaProductNotificationTables from "../schema/schemaProductNotificationTables.js";
import type * as schema_schemaProductReviewTables from "../schema/schemaProductReviewTables.js";
import type * as schema_schemaProductTables from "../schema/schemaProductTables.js";
import type * as schema_schemaShared from "../schema/schemaShared.js";
import type * as schema_schemaWorkspaceAutomationTables from "../schema/schemaWorkspaceAutomationTables.js";
import type * as schema_schemaWorkspaceCoreTables from "../schema/schemaWorkspaceCoreTables.js";
import type * as schema_schemaWorkspaceIntegrationTables from "../schema/schemaWorkspaceIntegrationTables.js";
import type * as schema_schemaWorkspaceSourceTables from "../schema/schemaWorkspaceSourceTables.js";
import type * as schema_schemaWorkspaceTables from "../schema/schemaWorkspaceTables.js";
import type * as signalIngest from "../signalIngest.js";
import type * as sources from "../sources.js";
import type * as tags from "../tags.js";
import type * as workspace_amendAccessFunctionArgs from "../workspace/amendAccessFunctionArgs.js";
import type * as workspace_amendAccessMutationHandlers from "../workspace/amendAccessMutationHandlers.js";
import type * as workspace_amendCustomDomainMutationHandlers from "../workspace/amendCustomDomainMutationHandlers.js";
import type * as workspace_amendIntegrationMutationHandlers from "../workspace/amendIntegrationMutationHandlers.js";
import type * as workspace_amendPlanMutationHandlers from "../workspace/amendPlanMutationHandlers.js";
import type * as workspace_amendWorkspace from "../workspace/amendWorkspace.js";
import type * as workspace_amendWorkspaceAccess from "../workspace/amendWorkspaceAccess.js";
import type * as workspace_amendWorkspaceAdminMutationHandlers from "../workspace/amendWorkspaceAdminMutationHandlers.js";
import type * as workspace_amendWorkspaceDomainReadHandlers from "../workspace/amendWorkspaceDomainReadHandlers.js";
import type * as workspace_amendWorkspaceFunctionArgs from "../workspace/amendWorkspaceFunctionArgs.js";
import type * as workspace_amendWorkspaceMemberMutationHandlers from "../workspace/amendWorkspaceMemberMutationHandlers.js";
import type * as workspace_amendWorkspaceMutationHandlers from "../workspace/amendWorkspaceMutationHandlers.js";
import type * as workspace_amendWorkspacePlanReadHandlers from "../workspace/amendWorkspacePlanReadHandlers.js";
import type * as workspace_amendWorkspaceProjectReadHandlers from "../workspace/amendWorkspaceProjectReadHandlers.js";
import type * as workspace_amendWorkspaceProvisioning from "../workspace/amendWorkspaceProvisioning.js";
import type * as workspace_amendWorkspaceReadHandlers from "../workspace/amendWorkspaceReadHandlers.js";
import type * as workspace_amendWorkspaceRecordNormalizers from "../workspace/amendWorkspaceRecordNormalizers.js";
import type * as workspace_amendWorkspaceSettingsMutationHandlers from "../workspace/amendWorkspaceSettingsMutationHandlers.js";
import type * as workspace_amendWorkspaceSettingsReadHandlers from "../workspace/amendWorkspaceSettingsReadHandlers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  "agent/amendAgent": typeof agent_amendAgent;
  "agent/amendAgentDecisionNormalizer": typeof agent_amendAgentDecisionNormalizer;
  "agent/amendAgentFallback": typeof agent_amendAgentFallback;
  "agent/amendAgentFunctionDefinitions": typeof agent_amendAgentFunctionDefinitions;
  "agent/amendAgentProvider": typeof agent_amendAgentProvider;
  "agent/amendAgentRunContextHandler": typeof agent_amendAgentRunContextHandler;
  "agent/amendAgentRunHandlers": typeof agent_amendAgentRunHandlers;
  "agent/amendAgentRunPersistence": typeof agent_amendAgentRunPersistence;
  "agent/amendAgentRunTypes": typeof agent_amendAgentRunTypes;
  "agent/amendAgentTypes": typeof agent_amendAgentTypes;
  "agent/amendAutomationFunctionArgs": typeof agent_amendAutomationFunctionArgs;
  "agent/amendAutomationRecordNormalizers": typeof agent_amendAutomationRecordNormalizers;
  "agent/amendAutomationRulesMutationHandlers": typeof agent_amendAutomationRulesMutationHandlers;
  "agent/amendDecisionRevertHandlers": typeof agent_amendDecisionRevertHandlers;
  amend: typeof amend;
  amendGithubInstall: typeof amendGithubInstall;
  amendPurge: typeof amendPurge;
  auth: typeof auth;
  backfill: typeof backfill;
  changelog: typeof changelog;
  changelogScheduler: typeof changelogScheduler;
  channelRoutes: typeof channelRoutes;
  "content/amendContentFunctionArgs": typeof content_amendContentFunctionArgs;
  "content/amendContentMutationHandlers": typeof content_amendContentMutationHandlers;
  "content/amendFeedbackCreateMutationHandler": typeof content_amendFeedbackCreateMutationHandler;
  "content/amendFeedbackIdentityMutationHandlers": typeof content_amendFeedbackIdentityMutationHandlers;
  "content/amendFeedbackInteractionMutationHandlers": typeof content_amendFeedbackInteractionMutationHandlers;
  "content/amendFeedbackMutationHandlers": typeof content_amendFeedbackMutationHandlers;
  "content/amendFeedbackTypes": typeof content_amendFeedbackTypes;
  "content/amendPortalReadHandlers": typeof content_amendPortalReadHandlers;
  "content/amendProductRecordNormalizers": typeof content_amendProductRecordNormalizers;
  "content/amendReviewHandlers": typeof content_amendReviewHandlers;
  "content/amendReviewStatusHandlers": typeof content_amendReviewStatusHandlers;
  "content/amendUserUpdateReadHandlers": typeof content_amendUserUpdateReadHandlers;
  convexDiscordDelivery: typeof convexDiscordDelivery;
  convexDiscordInteractions: typeof convexDiscordInteractions;
  convexDiscordMessages: typeof convexDiscordMessages;
  crons: typeof crons;
  "dashboard/amendAnalytics": typeof dashboard_amendAnalytics;
  "dashboard/amendAnalyticsEvents": typeof dashboard_amendAnalyticsEvents;
  "dashboard/amendDashboardActivity": typeof dashboard_amendDashboardActivity;
  "dashboard/amendDashboardFallbacks": typeof dashboard_amendDashboardFallbacks;
  "dashboard/amendDashboardOverview": typeof dashboard_amendDashboardOverview;
  "dashboard/amendDashboardOverviewRecords": typeof dashboard_amendDashboardOverviewRecords;
  "dashboard/amendOperationalReadHandlers": typeof dashboard_amendOperationalReadHandlers;
  "dashboard/amendOperationalReadQueries": typeof dashboard_amendOperationalReadQueries;
  "dashboard/amendReadFunctionArgs": typeof dashboard_amendReadFunctionArgs;
  "dashboard/amendReadFunctionDefinitions": typeof dashboard_amendReadFunctionDefinitions;
  "dashboard/amendReadHandlers": typeof dashboard_amendReadHandlers;
  "delivery/amendDeliveryMutationHandlers": typeof delivery_amendDeliveryMutationHandlers;
  "delivery/amendNotificationFunctionArgs": typeof delivery_amendNotificationFunctionArgs;
  "delivery/amendNotificationMutationHandlers": typeof delivery_amendNotificationMutationHandlers;
  "delivery/amendNotificationPreferenceMutationHandlers": typeof delivery_amendNotificationPreferenceMutationHandlers;
  "delivery/amendNotifications": typeof delivery_amendNotifications;
  "delivery/amendTransactionalEmails": typeof delivery_amendTransactionalEmails;
  "delivery/httpRuntimeDeliveries": typeof delivery_httpRuntimeDeliveries;
  deliveryScheduler: typeof deliveryScheduler;
  "demo/amendDemoContent": typeof demo_amendDemoContent;
  "demo/amendDemoCore": typeof demo_amendDemoCore;
  "demo/amendDemoData": typeof demo_amendDemoData;
  "demo/amendDemoPlanData": typeof demo_amendDemoPlanData;
  "demo/amendDemoSettingsData": typeof demo_amendDemoSettingsData;
  "demo/amendDemoSourceEvents": typeof demo_amendDemoSourceEvents;
  "demo/amendDemoWorkspaceData": typeof demo_amendDemoWorkspaceData;
  "demo/amendSeed": typeof demo_amendSeed;
  "demo/amendSeedBase": typeof demo_amendSeedBase;
  "demo/amendSeedContent": typeof demo_amendSeedContent;
  "demo/amendSeedPrimaryRecords": typeof demo_amendSeedPrimaryRecords;
  "demo/amendSeedWorkflowRecords": typeof demo_amendSeedWorkflowRecords;
  digest: typeof digest;
  drafts: typeof drafts;
  healthCheck: typeof healthCheck;
  http: typeof http;
  httpRestGet: typeof httpRestGet;
  httpRestPost: typeof httpRestPost;
  ingest: typeof ingest;
  "ingest/amendSignalFunctionArgs": typeof ingest_amendSignalFunctionArgs;
  "ingest/amendSourceIngest": typeof ingest_amendSourceIngest;
  "ingest/amendSourceIngestChangelog": typeof ingest_amendSourceIngestChangelog;
  "ingest/amendSourceIngestDecisions": typeof ingest_amendSourceIngestDecisions;
  "ingest/amendSourceIngestModel": typeof ingest_amendSourceIngestModel;
  "ingest/amendSourceIngestRelations": typeof ingest_amendSourceIngestRelations;
  "ingest/amendSourceIngestShipped": typeof ingest_amendSourceIngestShipped;
  "ingest/amendSourceLinks": typeof ingest_amendSourceLinks;
  "ingest/amendSourceNotifications": typeof ingest_amendSourceNotifications;
  "ingest/channelRouting": typeof ingest_channelRouting;
  "ingest/httpRuntimeGithubSourceEvents": typeof ingest_httpRuntimeGithubSourceEvents;
  "ingest/httpRuntimeSourceEventInputs": typeof ingest_httpRuntimeSourceEventInputs;
  "ingest/httpRuntimeSourceEventTypes": typeof ingest_httpRuntimeSourceEventTypes;
  "lib/amendBackendUtils": typeof lib_amendBackendUtils;
  "lib/amendDevAndGithubHandlers": typeof lib_amendDevAndGithubHandlers;
  "lib/amendDevFunctionDefinitions": typeof lib_amendDevFunctionDefinitions;
  "lib/amendFunctionArgShared": typeof lib_amendFunctionArgShared;
  "lib/amendFunctionArgs": typeof lib_amendFunctionArgs;
  "lib/amendGithub": typeof lib_amendGithub;
  "lib/amendMutationFunctionDefinitions": typeof lib_amendMutationFunctionDefinitions;
  "lib/amendNormalizers": typeof lib_amendNormalizers;
  "lib/amendProviderLabels": typeof lib_amendProviderLabels;
  "lib/amendRecordNormalizers": typeof lib_amendRecordNormalizers;
  "lib/amendTypes": typeof lib_amendTypes;
  "lib/amendValidators": typeof lib_amendValidators;
  "lib/httpRestPostAutomation": typeof lib_httpRestPostAutomation;
  "lib/httpRestPostSignals": typeof lib_httpRestPostSignals;
  "lib/httpRestPostTypes": typeof lib_httpRestPostTypes;
  "lib/httpRestPostWorkspace": typeof lib_httpRestPostWorkspace;
  "lib/httpRuntime": typeof lib_httpRuntime;
  "lib/httpRuntimeAuth": typeof lib_httpRuntimeAuth;
  "lib/httpRuntimeDns": typeof lib_httpRuntimeDns;
  "lib/httpRuntimeDrafts": typeof lib_httpRuntimeDrafts;
  "lib/httpRuntimeEnumInputs": typeof lib_httpRuntimeEnumInputs;
  "lib/httpRuntimeInputScalars": typeof lib_httpRuntimeInputScalars;
  "lib/httpRuntimeInputs": typeof lib_httpRuntimeInputs;
  "lib/httpRuntimeMetadata": typeof lib_httpRuntimeMetadata;
  "lib/httpRuntimeRouting": typeof lib_httpRuntimeRouting;
  "lib/httpRuntimeScalars": typeof lib_httpRuntimeScalars;
  "lib/httpRuntimeStripe": typeof lib_httpRuntimeStripe;
  "lib/posthog": typeof lib_posthog;
  "lib/signatures": typeof lib_signatures;
  memory: typeof memory;
  needs: typeof needs;
  pipeline: typeof pipeline;
  "pipeline/proactiveArgs": typeof pipeline_proactiveArgs;
  "pipeline/proactiveClassifier": typeof pipeline_proactiveClassifier;
  "pipeline/proactiveProof": typeof pipeline_proactiveProof;
  "pipeline/proactiveShared": typeof pipeline_proactiveShared;
  "pipeline/proactiveValidators": typeof pipeline_proactiveValidators;
  "pipeline/signalTriage": typeof pipeline_signalTriage;
  privateData: typeof privateData;
  "projectSetup/amendProjectCreateHandlers": typeof projectSetup_amendProjectCreateHandlers;
  "projectSetup/amendProjectLookup": typeof projectSetup_amendProjectLookup;
  "projectSetup/amendProjectMutationHandlers": typeof projectSetup_amendProjectMutationHandlers;
  "projectSetup/amendProjectMutationTypes": typeof projectSetup_amendProjectMutationTypes;
  "projectSetup/amendProjectSourceHandlers": typeof projectSetup_amendProjectSourceHandlers;
  "projectSetup/amendProjectUpdateHandlers": typeof projectSetup_amendProjectUpdateHandlers;
  "projectSetup/projectWebsiteEnrichment": typeof projectSetup_projectWebsiteEnrichment;
  "projectSetup/projectWebsiteMetadata": typeof projectSetup_projectWebsiteMetadata;
  "projectSetup/projectWebsiteSuggestions": typeof projectSetup_projectWebsiteSuggestions;
  "projectSetup/projectWebsiteUrl": typeof projectSetup_projectWebsiteUrl;
  projects: typeof projects;
  "schema/schemaProactiveTables": typeof schema_schemaProactiveTables;
  "schema/schemaProductCommon": typeof schema_schemaProductCommon;
  "schema/schemaProductContentTables": typeof schema_schemaProductContentTables;
  "schema/schemaProductIdentityTables": typeof schema_schemaProductIdentityTables;
  "schema/schemaProductNotificationTables": typeof schema_schemaProductNotificationTables;
  "schema/schemaProductReviewTables": typeof schema_schemaProductReviewTables;
  "schema/schemaProductTables": typeof schema_schemaProductTables;
  "schema/schemaShared": typeof schema_schemaShared;
  "schema/schemaWorkspaceAutomationTables": typeof schema_schemaWorkspaceAutomationTables;
  "schema/schemaWorkspaceCoreTables": typeof schema_schemaWorkspaceCoreTables;
  "schema/schemaWorkspaceIntegrationTables": typeof schema_schemaWorkspaceIntegrationTables;
  "schema/schemaWorkspaceSourceTables": typeof schema_schemaWorkspaceSourceTables;
  "schema/schemaWorkspaceTables": typeof schema_schemaWorkspaceTables;
  signalIngest: typeof signalIngest;
  sources: typeof sources;
  tags: typeof tags;
  "workspace/amendAccessFunctionArgs": typeof workspace_amendAccessFunctionArgs;
  "workspace/amendAccessMutationHandlers": typeof workspace_amendAccessMutationHandlers;
  "workspace/amendCustomDomainMutationHandlers": typeof workspace_amendCustomDomainMutationHandlers;
  "workspace/amendIntegrationMutationHandlers": typeof workspace_amendIntegrationMutationHandlers;
  "workspace/amendPlanMutationHandlers": typeof workspace_amendPlanMutationHandlers;
  "workspace/amendWorkspace": typeof workspace_amendWorkspace;
  "workspace/amendWorkspaceAccess": typeof workspace_amendWorkspaceAccess;
  "workspace/amendWorkspaceAdminMutationHandlers": typeof workspace_amendWorkspaceAdminMutationHandlers;
  "workspace/amendWorkspaceDomainReadHandlers": typeof workspace_amendWorkspaceDomainReadHandlers;
  "workspace/amendWorkspaceFunctionArgs": typeof workspace_amendWorkspaceFunctionArgs;
  "workspace/amendWorkspaceMemberMutationHandlers": typeof workspace_amendWorkspaceMemberMutationHandlers;
  "workspace/amendWorkspaceMutationHandlers": typeof workspace_amendWorkspaceMutationHandlers;
  "workspace/amendWorkspacePlanReadHandlers": typeof workspace_amendWorkspacePlanReadHandlers;
  "workspace/amendWorkspaceProjectReadHandlers": typeof workspace_amendWorkspaceProjectReadHandlers;
  "workspace/amendWorkspaceProvisioning": typeof workspace_amendWorkspaceProvisioning;
  "workspace/amendWorkspaceReadHandlers": typeof workspace_amendWorkspaceReadHandlers;
  "workspace/amendWorkspaceRecordNormalizers": typeof workspace_amendWorkspaceRecordNormalizers;
  "workspace/amendWorkspaceSettingsMutationHandlers": typeof workspace_amendWorkspaceSettingsMutationHandlers;
  "workspace/amendWorkspaceSettingsReadHandlers": typeof workspace_amendWorkspaceSettingsReadHandlers;
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
