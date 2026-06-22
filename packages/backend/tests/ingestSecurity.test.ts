import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "convex");

describe("proactive ingest security guards", () => {
  test("ad-hoc ingest endpoints require signature or owner token verification", () => {
    const source = readFileSync(join(root, "ingest.ts"), "utf8");

    expect(source).toContain("verifyGitHubSignature(request, rawBody)");
    expect(source.match(/verifyApiToken\(request\)/g)?.length).toBe(2);
  });

  test("inbound accountId does not create paying people", () => {
    const source = readFileSync(join(root, "proactiveProof.ts"), "utf8");

    expect(source).toContain("paying: false");
    expect(source).not.toContain("paying: Boolean(accountId)");
  });

  test("proactive draft redaction covers common token families", () => {
    const source = readFileSync(join(root, "drafts.ts"), "utf8");

    expect(source).toContain("AKIA");
    expect(source).toContain("xox[baprs]");
    expect(source).toContain("eyJ");
    expect(source).toContain("github_pat");
  });

  test("public project slug lookup is collision safe", () => {
    const portalReadHandlers = readFileSync(join(root, "amendPortalReadHandlers.ts"), "utf8");
    const seed = readFileSync(join(root, "amendSeed.ts"), "utf8");

    expect(portalReadHandlers).toContain("take(2)");
    expect(portalReadHandlers).toContain("matches.length === 1");
    expect(seed).toContain("take(2)");
    expect(seed).toContain("matches.length === 1");
  });

  test("proactive clustering can merge compatible cross-channel needs", () => {
    const source = readFileSync(join(root, "pipeline.ts"), "utf8");

    expect(source).toContain("facetsCompatible");
    expect(source).toContain("facetsFromClusterKey");
    expect(source).toContain("by_workspace_and_facetArea");
    expect(source).not.toContain(
      '.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))',
    );
  });

  test("weekly digest skips blank email recipients", () => {
    const source = readFileSync(join(root, "digest.ts"), "utf8");

    expect(source).toContain("const recipient = member.email?.trim()");
    expect(source).toContain("if (!recipient) continue");
  });

  test("proof recompute batches person lookups", () => {
    const source = readFileSync(join(root, "proactiveProof.ts"), "utf8");

    expect(source).toContain("Promise.all");
    expect(source).toContain("peopleById");
  });

  test("scheduled changelog publish queues subscriber deliveries", () => {
    const source = readFileSync(join(root, "changelogScheduler.ts"), "utf8");

    expect(source).toContain('audience: "subscribers"');
    expect(source).toContain("trustedPlanNotificationDeliveriesHandler");
  });

  test("workspace portal branding does not fall back to an arbitrary project", () => {
    const source = readFileSync(join(root, "amendPortalReadHandlers.ts"), "utf8");

    expect(source).toContain("Project portals use project branding");
    expect(source).not.toContain("brandingProject");
  });

  test("tag rename duplicate check uses the composite name index", () => {
    const source = readFileSync(join(root, "tags.ts"), "utf8");

    expect(source).toContain("by_workspace_and_name");
    expect(source).not.toContain("const all = await ctx.db");
  });
});
