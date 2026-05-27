import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("auth transactional email flow", () => {
  test("password reset UI avoids concrete delivery claims", async () => {
    const signInForm = await readFile("apps/web/src/components/sign-in-form.tsx", "utf8");

    expect(signInForm).not.toContain("Check <span");
    expect(signInForm).not.toContain("Reset link sent");
    expect(signInForm).toContain("Reset requested");
    expect(signInForm).toContain(
      "If the address is registered and email delivery is available, a reset link will arrive",
    );
  });

  test("transactional email helper logs provider delivery outcomes", async () => {
    const emailHelper = await readFile(
      "packages/backend/convex/amendTransactionalEmails.ts",
      "utf8",
    );

    expect(emailHelper).toContain("[transactional-email] provider accepted email");
    expect(emailHelper).toContain("[transactional-email] provider rejected email");
    expect(emailHelper).toContain('purpose: "password_reset"');
  });
});
