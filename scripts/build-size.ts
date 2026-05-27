import { inspectBuildSize } from "./build-size-core";
import { collectBuildAssets, collectSearchableBuildFiles } from "./build-size-files";

const publicDir = new URL("../apps/web/.output/public/", import.meta.url);
const assetsDir = new URL("assets/", publicDir);

const inspection = inspectBuildSize({
  assets: await collectBuildAssets(assetsDir),
  files: await collectSearchableBuildFiles(publicDir),
});

if (!inspection.ok) {
  for (const error of inspection.errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(inspection.summary);
