import { assertIncludes, check, read, readIntegrationDocs, readSdkSource } from "./smoke-helpers";

export async function runSmokeProductWorkspaceAdminChecks() {
  await check("workspace members are manageable through backend, SDK, and docs", async () => {
    const http = await read("packages/backend/convex/httpRestPostWorkspace.ts");
    const backend = await read("packages/backend/convex/amend.ts");
    const sdk = await readSdkSource();
    const docs = await readIntegrationDocs();
    assertIncludes(http, 'resource === "members"', "REST members");
    assertIncludes(backend, "upsertWorkspaceMember", "backend members");
    assertIncludes(sdk, "upsertWorkspaceMember", "SDK members");
    assertIncludes(docs, "## Team Permissions", "integration guide");
  });

  await check("integrations are manageable through backend, SDK, and docs", async () => {
    const http = await read("packages/backend/convex/httpRestPostWorkspace.ts");
    const backend = await read("packages/backend/convex/amend.ts");
    const sdk = await readSdkSource();
    const docs = await readIntegrationDocs();
    assertIncludes(http, 'resource === "integrations"', "REST integrations");
    assertIncludes(backend, "upsertIntegrationConnection", "backend integrations");
    assertIncludes(sdk, "upsertIntegration", "SDK integrations");
    assertIncludes(docs, "## Integration Connections", "integration guide");
  });

  await check("custom domains are wired through backend, SDK, and docs", async () => {
    const http = [
      await read("packages/backend/convex/httpRestGet.ts"),
      await read("packages/backend/convex/httpRestPost.ts"),
      await read("packages/backend/convex/httpRestPostWorkspace.ts"),
    ].join("\n");
    const backend = await read("packages/backend/convex/amend.ts");
    const sdk = await readSdkSource();
    const docs = await readIntegrationDocs();
    assertIncludes(http, 'resource === "domains"', "REST custom domains");
    assertIncludes(http, 'workspaceSlug === "_"', "REST custom domains");
    assertIncludes(http, "verifyDomainTxt", "REST custom domains");
    assertIncludes(backend, "resolveCustomDomain", "backend custom domains");
    assertIncludes(backend, "registerCustomDomain", "backend custom domains");
    assertIncludes(backend, "updateCustomDomainStatus", "backend custom domains");
    assertIncludes(sdk, "registerCustomDomain", "SDK custom domains");
    assertIncludes(sdk, "resolveCustomDomain", "SDK custom domains");
    assertIncludes(sdk, "verifyCustomDomain", "SDK custom domains");
    assertIncludes(
      docs,
      "Register custom domains for portal, embed, or API surfaces",
      "integration guide",
    );
  });
}
