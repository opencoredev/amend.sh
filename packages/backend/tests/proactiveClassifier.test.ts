import { describe, expect, test } from "bun:test";

import { classifySignal, facetsCompatible } from "../convex/pipeline/proactiveClassifier";

describe("proactive facet guard", () => {
  test("keeps export and import requests split", () => {
    const exportSignal = classifySignal({
      channel: "support",
      title: "Need CSV export",
      text: "Please let us export tagged feedback to CSV",
    });
    const importSignal = classifySignal({
      channel: "support",
      title: "Need CSV import",
      text: "Please let us import old feedback from CSV",
    });

    expect(exportSignal.area).toBe("export");
    expect(importSignal.area).toBe("import");
    expect(facetsCompatible(exportSignal, importSignal)).toBe(false);
  });

  test("merges paraphrases of the same notification need", () => {
    const first = classifySignal({
      channel: "github",
      text: "Notify users when a thing they asked for ships",
    });
    const second = classifySignal({
      channel: "embed",
      text: "Send an email alert after requested work is shipped",
    });

    expect(first.area).toBe("notification");
    expect(second.area).toBe("notification");
    expect(facetsCompatible(first, second)).toBe(true);
  });
});
