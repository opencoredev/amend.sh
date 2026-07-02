import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { classifySignalContent, extractJsonObject } from "../convex/pipeline/signalTriage";

const root = join(import.meta.dir, "..", "convex");

describe("signal triage json extraction", () => {
  test("parses a bare JSON object", () => {
    expect(extractJsonObject('{"signal": true, "title": "Add CSV export", "kind": "feature"}'))
      .toEqual({ signal: true, title: "Add CSV export", kind: "feature" });
  });

  test("parses JSON wrapped in a code fence", () => {
    const raw = '```json\n{"signal": true, "title": "Fix login crash", "kind": "bug"}\n```';
    expect(extractJsonObject(raw)).toEqual({
      signal: true,
      title: "Fix login crash",
      kind: "bug",
    });
  });

  test("parses JSON wrapped in prose and reasoning text", () => {
    const raw =
      'Let me think. The user reports a problem, so this is signal.\n{"signal": true, "title": "Fix export timeout", "kind": "bug"}\nHope that helps!';
    expect(extractJsonObject(raw)).toEqual({
      signal: true,
      title: "Fix export timeout",
      kind: "bug",
    });
  });

  test("fails closed on malformed JSON", () => {
    expect(extractJsonObject('{"signal": true, "title": ')).toBeNull();
    expect(extractJsonObject('{"signal": true oops}')).toBeNull();
  });

  test("fails closed when no JSON object is present", () => {
    expect(extractJsonObject("this message is definitely signal, trust me")).toBeNull();
    expect(extractJsonObject("")).toBeNull();
  });
});

describe("signal triage provider selection", () => {
  const TRIAGE_ENV_KEYS = [
    "CROF_API_KEY",
    "CROF_BASE_URL",
    "CROF_CLASSIFIER_MODEL",
    "CROF_MODEL",
    "OPENROUTER_API_KEY",
    "OPENROUTER_MODEL",
  ] as const;
  let savedEnv: Partial<Record<(typeof TRIAGE_ENV_KEYS)[number], string | undefined>> = {};

  beforeEach(() => {
    savedEnv = {};
    for (const key of TRIAGE_ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of TRIAGE_ENV_KEYS) {
      const value = savedEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  test("fails closed with no triage provider configured (no network call)", async () => {
    const verdict = await classifySignalContent({
      body: "The export button crashes every time",
      provider: "discord",
    });
    expect(verdict).toEqual({ signal: false });
  });

  test("CROF stays primary over OpenRouter in the provider order", () => {
    const source = readFileSync(join(root, "pipeline/signalTriage.ts"), "utf8");
    // CROF is checked before OpenRouter, and OpenRouter is documented as the
    // CROF_API_KEY-unset fallback.
    expect(source.indexOf("CROF_API_KEY")).toBeGreaterThan(-1);
    expect(source.indexOf("CROF_API_KEY")).toBeLessThan(source.indexOf("OPENROUTER_API_KEY"));
    expect(source).toContain("https://openrouter.ai/api/v1/chat/completions");
    // The 12s abort + fail-closed mechanics survived the move out of the
    // Discord endpoint.
    expect(source).toContain("12_000");
    expect(source).toContain("AbortController");
    expect(source).toContain("return NOT_SIGNAL");
  });
});
