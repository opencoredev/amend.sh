import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const convexDir = join(import.meta.dir, "../convex");

function tsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "_generated" ? [] : tsFiles(path);
    return entry.isFile() && entry.name.endsWith(".ts") ? [path] : [];
  });
}

describe("external send gate", () => {
  test("transactional email sender is isolated from proactive drafts", () => {
    const offenders = tsFiles(convexDir).filter((file) => {
      const source = readFileSync(file, "utf8");
      return (
        source.includes("sendTransactionalEmail(") &&
        !file.endsWith("amendTransactionalEmails.ts") &&
        !file.endsWith("httpRuntimeDeliveries.ts") &&
        !file.endsWith("draftSendGate.test.ts")
      );
    });

    expect(offenders).toEqual([]);
  });

  test("proactive delivery enqueue is gated by drafts.approve", () => {
    const source = readFileSync(join(convexDir, "drafts.ts"), "utf8");
    expect(source).toContain("export const approve");
    expect(source).toContain("queueNotificationDeliveries");
    expect(source).toContain("gatedBy: \"drafts.approve\"");
  });
});
