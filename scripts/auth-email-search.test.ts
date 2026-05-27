import { describe, expect, test } from "bun:test";

import { authEmailSearch, parseAuthEmailSearch } from "../apps/web/src/lib/auth-email-search";

describe("auth email search", () => {
  test("normalizes typed email query values", () => {
    expect(parseAuthEmailSearch("  ada@example.com  ")).toBe("ada@example.com");
    expect(authEmailSearch("  ada@example.com  ")).toEqual({ email: "ada@example.com" });
  });

  test("drops empty and non-string query values", () => {
    expect(parseAuthEmailSearch("   ")).toBeUndefined();
    expect(parseAuthEmailSearch(["ada@example.com"])).toBeUndefined();
    expect(authEmailSearch("   ")).toEqual({});
  });
});
