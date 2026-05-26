import { describe, expect, test } from "bun:test";

import { parsePortalRedirectTo, portalRedirectTo } from "../apps/web/src/lib/auth-redirects";

describe("auth redirects", () => {
  test("builds portal return paths for account and feedback sign-in", () => {
    expect(portalRedirectTo("amend-labs")).toBe("/portal/amend-labs");
    expect(portalRedirectTo("amend-labs", "feedback")).toBe("/portal/amend-labs#feedback");
  });

  test("accepts only relative portal return targets", () => {
    expect(parsePortalRedirectTo("/portal/amend-labs")).toEqual({
      href: "/portal/amend-labs",
      workspaceSlug: "amend-labs",
    });
    expect(parsePortalRedirectTo("/portal/amend-labs#feedback")).toEqual({
      href: "/portal/amend-labs#feedback",
      section: "feedback",
      workspaceSlug: "amend-labs",
    });

    for (const unsafe of [
      "https://amend.sh/portal/amend-labs",
      "//amend.sh/portal/amend-labs",
      "/dashboard/proactivation",
      "/portal/amend-labs?next=/dashboard",
      "/portal/amend-labs#billing",
      "/portal/%20#feedback",
      "/portal/amend%2Flabs",
      "/portal/%E0%A4%A",
      "/portal/",
    ]) {
      expect(parsePortalRedirectTo(unsafe)).toBeNull();
    }
  });
});
