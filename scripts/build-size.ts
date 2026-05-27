import type { BuildAsset, SearchableBuildFile } from "./build-size-core";
import { inspectBuildSize } from "./build-size-core";
import { collectBuildAssets, collectSearchableBuildFiles } from "./build-size-files";

const buildOutputs = [
  {
    assetsDir: new URL("../apps/web/dist/client/assets/", import.meta.url),
    distDir: new URL("../apps/web/dist/", import.meta.url),
  },
  {
    assetsDir: new URL("../apps/web/.output/public/assets/", import.meta.url),
    distDir: new URL("../apps/web/.output/public/", import.meta.url),
  },
];

const { assets, files } = await collectCurrentBuildOutput();

const inspection = inspectBuildSize({
  assets,
  files,
});

if (!inspection.ok) {
  for (const error of inspection.errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(inspection.summary);

async function collectCurrentBuildOutput() {
  let files: SearchableBuildFile[] = [];
  for (const output of buildOutputs) {
    const assets = await collectBuildAssets(output.assetsDir);
    if (assets.length === 0) continue;

    files = await collectSearchableBuildFiles(output.distDir);
    return { assets, files };
  }

  return {
    assets: [] as BuildAsset[],
    files,
  };
}
