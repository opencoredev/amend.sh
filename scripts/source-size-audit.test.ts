import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

import { collectSourceSizeAudit } from "./source-size-audit-core";
import { renderSourceSizeAudit } from "./source-size-audit-render";

describe("source size audit", () => {
  test("flags product assets above the asset size cap", async () => {
    await withTempProject(async (root) => {
      await mkdir(join(root, "public"), { recursive: true });
      await writeFile(join(root, "public", "hero.png"), new Uint8Array(2048));

      const result = await collectSourceSizeAudit({
        allowedLargeFiles: new Map(),
        listProjectFiles: () => ["public/hero.png"],
        maxAssetBytes: 1024,
        root,
      });
      const rendered = renderSourceSizeAudit(result);

      expect(rendered.ok).toBe(false);
      expect(result.oversizedAssets).toEqual([{ bytes: 2048, path: "public/hero.png" }]);
      expect(rendered.stderr.join("\n")).toContain("public/hero.png: 2 KB");
    });
  });

  test("ignores local screenshot evidence artifacts", async () => {
    await withTempProject(async (root) => {
      await mkdir(join(root, ".codex-artifacts"), { recursive: true });
      await writeFile(join(root, ".codex-artifacts", "desktop.png"), new Uint8Array(4096));

      const result = await collectSourceSizeAudit({
        listProjectFiles: () => [".codex-artifacts/desktop.png"],
        maxAssetBytes: 1024,
        root,
      });
      const rendered = renderSourceSizeAudit(result);

      expect(rendered.ok).toBe(true);
      expect(result.oversizedAssets).toEqual([]);
    });
  });

  test("ignores generated framework output directories", async () => {
    await withTempProject(async (root) => {
      const result = await collectSourceSizeAudit({
        allowedLargeFiles: new Map(),
        listProjectFiles: () => [
          "apps/fumadocs/.next/dev/server/chunks/huge.js",
          "apps/web/.vinxi/server/chunks/huge.js",
          "apps/web/.vite/deps/huge.js",
          "apps/web/.output/server/index.mjs",
          "apps/web/.react-router/types.ts",
          "apps/web/.tanstack/routes.ts",
          "apps/web/.open-next/server.js",
          "apps/fumadocs/.source/index.ts",
          "packages/backend/.convex/local/db.sqlite",
          ".wrangler/state/v3/cache.sqlite",
          "apps/web/out/index.html",
        ],
        maxLines: 1,
        root,
      });

      expect(result.oversized).toEqual([]);
      expect(result.authored).toEqual([]);
    });
  });

  test("does not ignore authored files whose names only contain ignored directory words", async () => {
    await withTempProject(async (root) => {
      await mkdir(join(root, "src"), { recursive: true });
      await writeFile(join(root, "src", "distill.ts"), "one\ntwo\nthree\n");
      await writeFile(join(root, "src", "next-steps.ts"), "one\ntwo\nthree\n");
      await writeFile(join(root, "src", "coverage-map.ts"), "one\ntwo\nthree\n");

      const result = await collectSourceSizeAudit({
        allowedLargeFiles: new Map(),
        listProjectFiles: () => ["src/distill.ts", "src/next-steps.ts", "src/coverage-map.ts"],
        maxLines: 2,
        root,
      });

      expect(result.oversized).toEqual([
        { lines: 3, path: "src/distill.ts" },
        { lines: 3, path: "src/next-steps.ts" },
        { lines: 3, path: "src/coverage-map.ts" },
      ]);
    });
  });

  test("flags authored text above the line cap", async () => {
    await withTempProject(async (root) => {
      await writeFile(join(root, "large.ts"), "one\ntwo\nthree\n");

      const result = await collectSourceSizeAudit({
        allowedLargeFiles: new Map(),
        listProjectFiles: () => ["large.ts"],
        maxLines: 2,
        root,
      });
      const rendered = renderSourceSizeAudit(result);

      expect(rendered.ok).toBe(false);
      expect(result.oversized).toEqual([{ lines: 3, path: "large.ts" }]);
      expect(rendered.stderr.join("\n")).toContain("large.ts: 3 lines");
    });
  });

  test("skips tracked files deleted from the working tree", async () => {
    await withTempProject(async (root) => {
      const result = await collectSourceSizeAudit({
        listProjectFiles: () => ["deleted.ts"],
        root,
      });

      expect(result.oversized).toEqual([]);
      expect(result.authored).toEqual([]);
    });
  });

  test("only treats generated markers as generated when they appear in the header", async () => {
    await withTempProject(async (root) => {
      const body = [
        "line1",
        "line2",
        "line3",
        "line4",
        "line5",
        "line6",
        "line7",
        "line8",
        "line9",
        "line10",
        "line11",
        "line12",
        'const marker = "@generated";',
      ].join("\n");
      await writeFile(join(root, "audit.ts"), `${body}\n`);

      const result = await collectSourceSizeAudit({
        allowedLargeFiles: new Map(),
        listProjectFiles: () => ["audit.ts"],
        maxLines: 12,
        root,
      });

      expect(result.oversized).toEqual([{ lines: 13, path: "audit.ts" }]);
    });
  });

  test("allows generated source with a generated marker in the header", async () => {
    await withTempProject(async (root) => {
      await writeFile(join(root, "generated.ts"), "/* @generated */\none\ntwo\nthree\n");

      const result = await collectSourceSizeAudit({
        allowedLargeFiles: new Map(),
        listProjectFiles: () => ["generated.ts"],
        maxLines: 2,
        root,
      });

      expect(result.oversized).toEqual([]);
      expect(result.allowed).toContainEqual({
        kind: "text",
        lines: 4,
        path: "generated.ts",
        reason: "generated source",
      });
    });
  });
});

async function withTempProject(run: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), "amend-source-size-"));
  try {
    await run(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}
