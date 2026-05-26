import { describe, expect, test } from "bun:test";

import {
  assertSeededDemoLocalAuthAllowed,
  isLocalAuthSiteUrl,
  seededDemoLocalOnlyMessage,
} from "../packages/backend/convex/amendBackendUtils";
import {
  joinSeededDemoWorkspaceHandler,
  seedDemoDataHandler,
} from "../packages/backend/convex/amendDevAndGithubHandlers";

describe("development auth guards", () => {
  test("allows only localhost SITE_URL values for seeded demo auth", () => {
    withSiteUrl(undefined, () => {
      expect(isLocalAuthSiteUrl()).toBe(false);
      expect(() => assertSeededDemoLocalAuthAllowed()).toThrow(seededDemoLocalOnlyMessage);
    });

    for (const siteUrl of [
      "http://localhost:1355",
      "http://127.0.0.1:1355",
      "http://[::1]:1355",
      "[::1]:1355",
      "https://localhost:1355",
      "LOCALHOST:1355",
      "http://amend.localhost:1355",
      "amend.localhost:1355",
      " amend.localhost:1355 ",
    ]) {
      expect(isLocalAuthSiteUrl(siteUrl)).toBe(true);
      withSiteUrl(siteUrl, () => {
        expect(() => assertSeededDemoLocalAuthAllowed()).not.toThrow();
      });
    }

    for (const siteUrl of [
      "https://amend.sh",
      "https://app.amend.sh",
      "https://notlocalhost.com",
      "http://127.0.0.1.evil.com",
      "http://localhost.evil.com",
      "ftp://localhost:1355",
      "//amend.localhost:1355",
      "http:////amend.localhost:1355",
      "not a url with localhost inside it",
    ]) {
      expect(isLocalAuthSiteUrl(siteUrl)).toBe(false);
      withSiteUrl(siteUrl, () => {
        expect(() => assertSeededDemoLocalAuthAllowed()).toThrow(seededDemoLocalOnlyMessage);
      });
    }
  });

  test("seeded demo mutations fail before touching data outside local development", async () => {
    await withSiteUrl("https://amend.sh", async () => {
      await expect(seedDemoDataHandler({} as never, {})).rejects.toThrow(
        seededDemoLocalOnlyMessage,
      );
      await expect(
        joinSeededDemoWorkspaceHandler({} as never, {
          email: "developer@amend.sh",
          workspaceSlug: "amend-labs",
        }),
      ).rejects.toThrow(seededDemoLocalOnlyMessage);
    });
  });
});

async function withSiteUrl<T>(siteUrl: string | undefined, run: () => T | Promise<T>) {
  const originalSiteUrl = process.env.SITE_URL;
  try {
    if (siteUrl === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = siteUrl;
    }
    return await run();
  } finally {
    if (originalSiteUrl === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = originalSiteUrl;
    }
  }
}
