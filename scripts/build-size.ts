import { stat } from "node:fs/promises";

import { inspectBuildSize } from "./build-size-core";
import { collectBuildAssets, collectSearchableBuildFiles } from "./build-size-files";

const buildRoot = await firstExistingDirectory([
  new URL("../apps/web/dist/", import.meta.url),
  new URL("../apps/web/.output/", import.meta.url),
]);
const assetsDir = await firstExistingDirectory([
  new URL("client/assets/", buildRoot),
  new URL("public/assets/", buildRoot),
]);

const inspection = inspectBuildSize({
  assets: await collectBuildAssets(assetsDir),
  files: await collectSearchableBuildFiles(buildRoot),
});

if (!inspection.ok) {
  for (const error of inspection.errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(inspection.summary);

async function firstExistingDirectory(candidates: URL[]) {
  for (const candidate of candidates) {
    if (await isDirectory(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Missing web build output. Run \`bun run build\` first. Checked: ${candidates
      .map((candidate) => candidate.pathname)
      .join(", ")}`,
  );
}

async function isDirectory(url: URL) {
  return await stat(url)
    .then((fileStat) => fileStat.isDirectory())
    .catch((error: unknown) => {
      if (isMissingFileError(error)) return false;
      throw error;
    });
}

function isMissingFileError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
