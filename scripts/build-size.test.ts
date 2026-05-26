import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "bun:test";

import { inspectBuildSize } from "./build-size-core";
import { collectBuildAssets, collectSearchableBuildFiles } from "./build-size-files";

describe("build size guard", () => {
  test("passes when chunks are within budget and no dev auth tokens leak", () => {
    const result = inspectBuildSize({
      assets: [{ name: "app.js", size: 128 * 1024 }],
      files: [{ path: "/dist/client/assets/app.js", content: "console.log('prod')" }],
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.summary).toContain("production build has no local dev auth tokens");
  });

  test("flags the largest oversized client chunk", () => {
    const result = inspectBuildSize({
      assets: [
        { name: "small.js", size: 64 * 1024 },
        { name: "vendor.js", size: 501 * 1024 },
      ],
      files: [],
      maxChunkBytes: 500 * 1024,
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      "Largest client chunk is 501.00 KiB (vendor.js), above the 500.00 KiB limit.",
    ]);
  });

  test("flags local development auth tokens in production files", () => {
    const result = inspectBuildSize({
      assets: [{ name: "app.js", size: 32 * 1024 }],
      files: [
        {
          path: "/dist/client/assets/app.js",
          content: "button.textContent = 'Continue with local demo';",
        },
        {
          path: "/dist/server/server.js",
          content: "const email = 'developer@amend.sh';",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      "Production build includes local development auth code:",
      "- /dist/client/assets/app.js contains development demo button copy",
      "- /dist/server/server.js contains seeded demo email",
    ]);
  });

  test("fails clearly when no JavaScript assets were produced", () => {
    const result = inspectBuildSize({ assets: [], files: [] });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      "No built client JavaScript assets found. Run `bun run build` first.",
    ]);
    expect(result.summary).toBeNull();
  });

  test("collects built JavaScript assets and searchable production files", async () => {
    await withTempBuild(async (root) => {
      const assetsDir = join(root, "client", "assets");
      const serverDir = join(root, "server");
      await mkdir(assetsDir, { recursive: true });
      await mkdir(serverDir, { recursive: true });
      await writeFile(join(assetsDir, "app.js"), "console.log('app');");
      await writeFile(join(assetsDir, "app.css"), "body{}");
      await writeFile(join(serverDir, "server.js"), "console.log('server');");
      await writeFile(join(serverDir, "image.webp"), "not searched");

      await expect(collectBuildAssets(urlFor(assetsDir))).resolves.toEqual([
        { name: "app.js", size: "console.log('app');".length },
      ]);
      await expect(collectSearchableBuildFiles(urlFor(root))).resolves.toEqual([
        { path: join(assetsDir, "app.css"), content: "body{}" },
        { path: join(assetsDir, "app.js"), content: "console.log('app');" },
        { path: join(serverDir, "server.js"), content: "console.log('server');" },
      ]);
    });
  });

  test("treats missing build directories as empty collections", async () => {
    await withTempBuild(async (root) => {
      await expect(collectBuildAssets(urlFor(join(root, "missing-assets")))).resolves.toEqual([]);
      await expect(
        collectSearchableBuildFiles(urlFor(join(root, "missing-dist"))),
      ).resolves.toEqual([]);
    });
  });
});

async function withTempBuild(run: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), "amend-build-size-"));
  try {
    await run(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

function urlFor(path: string) {
  return pathToFileURL(`${path}/`);
}
