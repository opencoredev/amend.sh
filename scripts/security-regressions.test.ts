import { afterEach, describe, expect, test } from "bun:test";

import {
  requiresApiToken,
  requiresGetApiToken,
  verifyApiToken,
} from "../packages/backend/convex/lib/httpRuntimeAuth";

const originalEnv = {
  AMEND_API_TOKEN: process.env.AMEND_API_TOKEN,
  SITE_URL: process.env.SITE_URL,
  VITE_CONVEX_SITE_URL: process.env.VITE_CONVEX_SITE_URL,
  VITE_CONVEX_URL: process.env.VITE_CONVEX_URL,
};

afterEach(() => {
  restoreEnv("AMEND_API_TOKEN", originalEnv.AMEND_API_TOKEN);
  restoreEnv("SITE_URL", originalEnv.SITE_URL);
  restoreEnv("VITE_CONVEX_SITE_URL", originalEnv.VITE_CONVEX_SITE_URL);
  restoreEnv("VITE_CONVEX_URL", originalEnv.VITE_CONVEX_URL);
});

describe("security regressions", () => {
  test("owner REST reads require a bearer token outside local development", () => {
    delete process.env.AMEND_API_TOKEN;
    process.env.SITE_URL = "https://amend.sh";

    expect(requiresGetApiToken("settings")).toBe(true);
    expect(verifyApiToken(new Request("https://example.com"))).toEqual({
      error: "Missing Amend API token configuration",
      ok: false,
    });
  });

  test("owner REST reads can stay tokenless in local development", () => {
    delete process.env.AMEND_API_TOKEN;
    process.env.SITE_URL = "http://amend.localhost:1355";

    expect(requiresGetApiToken("settings")).toBe(false);
  });

  test("owner REST writes require a configured bearer token in production", () => {
    process.env.AMEND_API_TOKEN = "owner-secret";
    process.env.SITE_URL = "https://amend.sh";

    expect(requiresApiToken("source-events", {})).toBe(true);
    expect(verifyApiToken(new Request("https://example.com"))).toEqual({
      error: "Missing Amend API token",
      ok: false,
    });
    expect(
      verifyApiToken(
        new Request("https://example.com", {
          headers: { Authorization: "Bearer owner-secret" },
        }),
      ),
    ).toEqual({ ok: true });
  });

  test("analytics paths strip query strings and fragments", async () => {
    process.env.VITE_CONVEX_URL = "http://127.0.0.1:3210";
    process.env.VITE_CONVEX_SITE_URL = "http://127.0.0.1:3211";
    const { analyticsPath } = await import("../apps/web/src/lib/posthog");

    expect(analyticsPath("https://amend.sh/reset-password?token=secret#fragment")).toBe(
      "/reset-password",
    );
    expect(analyticsPath("/sign-in?redirectTo=%2Fportal%2Famend")).toBe("/sign-in");
  });
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}
