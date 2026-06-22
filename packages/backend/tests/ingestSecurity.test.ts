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
});
