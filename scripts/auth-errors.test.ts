import { describe, expect, test } from "bun:test";

import { authErrorMessage } from "../apps/web/src/lib/auth-errors";

describe("auth error messages", () => {
  test("prefers auth callback message over status text and fallback", () => {
    expect(
      authErrorMessage(
        {
          error: {
            message: "Invalid password",
            statusText: "Unauthorized",
          },
        },
        "Fallback",
      ),
    ).toBe("Invalid password");
  });

  test("uses status text when message is missing", () => {
    expect(
      authErrorMessage(
        {
          error: {
            statusText: "Too many requests",
          },
        },
        "Fallback",
      ),
    ).toBe("Too many requests");
  });

  test("falls back for empty or missing callback details", () => {
    expect(authErrorMessage(undefined, "Fallback")).toBe("Fallback");
    expect(authErrorMessage({}, "Fallback")).toBe("Fallback");
    expect(authErrorMessage({ error: {} }, "Fallback")).toBe("Fallback");
  });
});
