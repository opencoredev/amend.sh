import { describe, expect, test } from "bun:test";

import { isThirdPartyExtensionException } from "../apps/web/src/lib/posthog-exception-filter";

describe("isThirdPartyExtensionException", () => {
  test("drops a frameless WebExtension runtime.sendMessage error", () => {
    expect(
      isThirdPartyExtensionException({
        $exception_list: [
          {
            type: "Error",
            value: "Invalid call to runtime.sendMessage(). Tab not found.",
            stacktrace: { frames: [] },
          },
        ],
      }),
    ).toBe(true);
  });

  test("drops a matching error that has no stacktrace at all", () => {
    expect(
      isThirdPartyExtensionException({
        $exception_list: [{ value: "tabs.sendMessage failed" }],
      }),
    ).toBe(true);
  });

  test("keeps an error that carries an application frame", () => {
    expect(
      isThirdPartyExtensionException({
        $exception_list: [
          {
            value: "runtime.sendMessage failed",
            stacktrace: { frames: [{ in_app: false }, { in_app: true }] },
          },
        ],
      }),
    ).toBe(false);
  });

  test("keeps an unrelated application error", () => {
    expect(
      isThirdPartyExtensionException({
        $exception_list: [{ value: "Cannot read properties of undefined (reading 'id')" }],
      }),
    ).toBe(false);
  });

  test("ignores events without an exception list", () => {
    expect(isThirdPartyExtensionException({})).toBe(false);
    expect(isThirdPartyExtensionException(undefined)).toBe(false);
  });
});
