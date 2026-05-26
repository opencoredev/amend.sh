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
    const validators = await read("packages/backend/convex/amendValidators.ts");
    const sdk = await readSdkSource();
    const docs = await readIntegrationDocs();
    assertIncludes(validators, 'v.literal("identify")', "event schema");
    assertIncludes(validators, 'v.literal("account_identify")', "event schema");
    assertIncludes(sdk, "identify(identity", "SDK identify");
    assertIncludes(sdk, "identifyAccount", "SDK identify account");
    assertIncludes(docs, "await amend.identifyAccount", "integration guide");
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
