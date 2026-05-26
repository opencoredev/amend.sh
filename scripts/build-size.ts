import { inspectBuildSize } from "./build-size-core";
import { collectBuildAssets, collectSearchableBuildFiles } from "./build-size-files";

const assetsDir = new URL("../apps/web/dist/client/assets/", import.meta.url);
const distDir = new URL("../apps/web/dist/", import.meta.url);

const inspection = inspectBuildSize({
  assets: await collectBuildAssets(assetsDir),
  files: await collectSearchableBuildFiles(distDir),
});

if (!inspection.ok) {
  for (const error of inspection.errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(inspection.summary);
