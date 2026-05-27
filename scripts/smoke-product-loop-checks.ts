import {
  assertIncludes,
  check,
  read,
  readIntegrationDocs,
  readSdkEmbedSource,
  readSdkSource,
} from "./smoke-helpers";

export async function runSmokeProductLoopChecks() {
  await check("shipped GitHub work closes linked feedback loop", async () => {
    const sourceIngest = [
      await read("packages/backend/convex/amendSourceIngest.ts"),
      await read("packages/backend/convex/amendSourceIngestRelations.ts"),
      await read("packages/backend/convex/amendSourceIngestShipped.ts"),
      await read("packages/backend/convex/amendSourceNotifications.ts"),
    ].join("\n");
    assertIncludes(sourceIngest, "update_feedback_status", "GitHub ingestion");
    assertIncludes(sourceIngest, "update_roadmap_status", "GitHub ingestion");
    assertIncludes(sourceIngest, "Requested work shipped", "GitHub ingestion");
    assertIncludes(sourceIngest, 'status: "shipped"', "GitHub ingestion");
    assertIncludes(sourceIngest, "relatedFeedbackIds", "GitHub ingestion");
  });

  await check("feedback interactions are durable records", async () => {
    const schemaIdentityTables = await read(
      "packages/backend/convex/schemaProductIdentityTables.ts",
    );
    const validators = await read("packages/backend/convex/amendValidators.ts");
    const sdk = await readSdkSource();
    const embed = await readSdkEmbedSource();
    assertIncludes(schemaIdentityTables, "feedbackInteractions", "schema");
    assertIncludes(validators, 'v.literal("archived")', "schema");
    assertIncludes(validators, 'v.literal("under_review")', "schema");
    assertIncludes(sdk, "interactions", "SDK");
    assertIncludes(embed, "updatesForUser", "embed");
    assertIncludes(embed, "userId", "embed");
  });

  await check("event-lite analytics expose identify and account identify", async () => {
    const backendAnalytics = await read("packages/backend/convex/amendAnalytics.ts");
    const backendAnalyticsEvents = await read("packages/backend/convex/amendAnalyticsEvents.ts");
    const backendIdentity = await read(
      "packages/backend/convex/amendFeedbackIdentityMutationHandlers.ts",
    );
    const backendConfig = await read("packages/backend/convex/convex.config.ts");
    const sourceIngest = await read("packages/backend/convex/amendSourceIngest.ts");
    const agentPersistence = await read("packages/backend/convex/amendAgentRunPersistence.ts");
    const dashboardOverview = await read("packages/backend/convex/amendDashboardOverview.ts");
    const webPostHog = await read("apps/web/src/lib/posthog.ts");
    const rootRoute = await read("apps/web/src/routes/__root.tsx");
    const openApi = await read("packages/api-spec/openapi.yaml");
    const openApiTypes = await read("packages/sdk/src/openapi-types.ts");
    const proactivationAnalytics = await read(
      "apps/web/src/components/proactivation-analytics-panel.tsx",
    );
    const validators = await read("packages/backend/convex/amendValidators.ts");
    const sdk = await readSdkSource();
    const docs = await readIntegrationDocs();
    const readme = await read("README.md");
    assertIncludes(backendConfig, "@posthog/convex", "Convex PostHog component");
    assertIncludes(backendAnalytics, "posthog.capture", "PostHog event capture");
    assertIncludes(backendAnalytics, "recordAnalyticsEvent", "analytics event recorder");
    assertIncludes(backendAnalytics, "analyticsEventCategory", "analytics event categories");
    assertIncludes(backendAnalyticsEvents, "analyticsEventCategories", "analytics event contract");
    assertIncludes(
      backendAnalyticsEvents,
      'agent_run_completed: "agent"',
      "agent analytics category",
    );
    assertIncludes(
      backendAnalyticsEvents,
      'feedback_submitted: "feedback"',
      "feedback analytics category",
    );
    assertIncludes(backendAnalyticsEvents, 'user_signed_up: "identity"', "signup analytics");
    assertIncludes(backendAnalyticsEvents, 'project_created: "project"', "project analytics");
    assertIncludes(backendIdentity, "recordAnalyticsEvent", "analytics fan-out");
    assertIncludes(sourceIngest, "source_event_ingested", "source analytics");
    assertIncludes(agentPersistence, "agent_run_completed", "agent analytics");
    assertIncludes(openApi, "source_event_ingested", "OpenAPI analytics events");
    assertIncludes(openApiTypes, '"source_event_ingested"', "OpenAPI analytics event types");
    assertIncludes(dashboardOverview, "topEvents", "dashboard analytics");
    assertIncludes(dashboardOverview, "topCategories", "dashboard analytics categories");
    assertIncludes(webPostHog, "posthog.init", "browser PostHog setup");
    assertIncludes(webPostHog, "capturePostHogEvent", "browser semantic PostHog events");
    assertIncludes(rootRoute, "capturePostHogPageview", "browser PostHog pageviews");
    assertIncludes(proactivationAnalytics, "Event capture", "analytics panel");
    assertIncludes(validators, 'v.literal("identify")', "event schema");
    assertIncludes(validators, 'v.literal("account_identify")', "event schema");
    assertIncludes(validators, 'v.literal("user_signed_up")', "event schema");
    assertIncludes(validators, 'v.literal("project_created")', "event schema");
    assertIncludes(sdk, "identify(identity", "SDK identify");
    assertIncludes(sdk, "identifyAccount", "SDK identify account");
    assertIncludes(docs, "await amend.identifyAccount", "integration guide");
    assertIncludes(docs, "Analytics Contract", "integration analytics contract");
    assertIncludes(docs, "recordAnalyticsEvent", "integration analytics contract");
    assertIncludes(readme, "amendAnalyticsEvents.ts", "README analytics contract");
  });

  await check("notification preferences support digest and unsubscribe flows", async () => {
    const sdk = await readSdkSource();
    const functionArgs = await read("packages/backend/convex/amendNotificationFunctionArgs.ts");
    const schemaNotificationTables = await read(
      "packages/backend/convex/schemaProductNotificationTables.ts",
    );
    const httpRuntime = await read("packages/backend/convex/httpRuntimeAuth.ts");
    const docs = await readIntegrationDocs();
    assertIncludes(sdk, "setNotificationPreference", "SDK preferences");
    assertIncludes(sdk, "unsubscribe", "SDK preferences");
    assertIncludes(functionArgs, 'v.literal("digest")', "backend preferences");
    assertIncludes(schemaNotificationTables, "unsubscribed", "backend preferences");
    assertIncludes(httpRuntime, "body.unsubscribed !== true", "REST preferences");
    assertIncludes(docs, "await amend.unsubscribe", "integration guide");
  });
}
