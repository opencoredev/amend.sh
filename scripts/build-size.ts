import { inspectBuildSize } from "./build-size-core";
import { collectBuildAssets, collectSearchableBuildFiles } from "./build-size-files";

const distAssetsDir = new URL("../apps/web/dist/client/assets/", import.meta.url);
const distDir = new URL("../apps/web/dist/", import.meta.url);
const outputAssetsDir = new URL("../apps/web/.output/public/assets/", import.meta.url);
const outputDir = new URL("../apps/web/.output/", import.meta.url);
const distAssets = await collectBuildAssets(distAssetsDir);
const outputAssets = distAssets.length > 0 ? [] : await collectBuildAssets(outputAssetsDir);

const inspection = inspectBuildSize({
  assets: distAssets.length > 0 ? distAssets : outputAssets,
  files: await collectSearchableBuildFiles(distAssets.length > 0 ? distDir : outputDir),
});

if (!inspection.ok) {
  for (const error of inspection.errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(inspection.summary);
