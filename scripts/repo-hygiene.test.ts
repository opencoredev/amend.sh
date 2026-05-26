import { describe, expect, test } from "bun:test";

import { collectRepoHygieneIssues } from "./repo-hygiene-core";

describe("repo hygiene", () => {
  test("flags tracked local evidence and generated cache paths", () => {
    expect(
      collectRepoHygieneIssues([
        ".codex-artifacts/browser-evidence.md",
        "apps/fumadocs/.next/dev/cache/file.sst",
        "apps/web/.vinxi/build/server.js",
        "packages/backend/.convex/local/default/convex_local_backend.sqlite3",
        ".turbo/cache/build.tar.zst",
        "apps/web/dist/client/index.js",
        "apps/web/node_modules/.vite/deps/react.js",
        "apps/fumadocs/.source/index.ts",
        ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite",
        "apps/fumadocs/tsconfig.tsbuildinfo",
        "tmp/playwriter-screenshot.png",
        "apps/web/src/main.tsx",
      ]),
    ).toEqual([
      {
        path: ".codex-artifacts/browser-evidence.md",
        reason: "local browser and screenshot evidence artifacts must stay outside tracked source",
      },
      { path: ".turbo/cache/build.tar.zst", reason: "Turbo cache output must not be tracked" },
      {
        path: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite",
        reason: "local framework cache output must not be tracked",
      },
      {
        path: "apps/fumadocs/.next/dev/cache/file.sst",
        reason: "Next build output must not be tracked",
      },
      {
        path: "apps/fumadocs/.source/index.ts",
        reason: "local framework cache output must not be tracked",
      },
      {
        path: "apps/fumadocs/tsconfig.tsbuildinfo",
        reason: "TypeScript build metadata must not be tracked",
      },
      {
        path: "apps/web/.vinxi/build/server.js",
        reason: "app framework build output must not be tracked",
      },
      {
        path: "apps/web/dist/client/index.js",
        reason: "build output directories must not be tracked",
      },
      {
        path: "apps/web/node_modules/.vite/deps/react.js",
        reason: "Vite cache output must not be tracked",
      },
      {
        path: "packages/backend/.convex/local/default/convex_local_backend.sqlite3",
        reason: "Convex local development state must not be tracked",
      },
      {
        path: "tmp/playwriter-screenshot.png",
        reason: "temporary scratch files must not be tracked",
      },
    ]);
  });

  test("allows authored source and intentional generated contracts", () => {
    expect(
      collectRepoHygieneIssues([
        "apps/web/src/distill-summary.ts",
        "apps/web/src/building-blocks.ts",
        "apps/web/src/outreach.ts",
        "apps/web/src/node_modules-notes.ts",
        "apps/web/src/coverage-map.ts",
        "apps/web/src/components/tmp-panel.tsx",
        "apps/web/src/components/sign-in-form.tsx",
        "packages/api-spec/openapi.yaml",
        "packages/sdk/src/openapi-types.ts",
      ]),
    ).toEqual([]);
  });
});
