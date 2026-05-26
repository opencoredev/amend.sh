import { readdir, readFile, stat } from "node:fs/promises";

import {
  type BuildAsset,
  extension,
  searchableBuildExtensions,
  type SearchableBuildFile,
} from "./build-size-core";

export async function collectBuildAssets(assetsDir: URL) {
  const assets: BuildAsset[] = [];

  for (const entry of await readDirectoryEntries(assetsDir)) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    const fileStat = await stat(new URL(entry.name, assetsDir));
    assets.push({ name: entry.name, size: fileStat.size });
  }

  return assets.sort((a, b) => a.name.localeCompare(b.name));
}

export async function collectSearchableBuildFiles(distDir: URL) {
  const files: SearchableBuildFile[] = [];

  for (const file of await listFiles(distDir)) {
    if (!searchableBuildExtensions.has(extension(file.pathname))) continue;
    files.push({
      content: await readFile(file, "utf8"),
      path: decodeURIComponent(file.pathname),
    });
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function listFiles(dir: URL): Promise<URL[]> {
  const files: URL[] = [];

  for (const entry of await readDirectoryEntries(dir)) {
    const url = new URL(entry.name, dir);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(new URL(`${entry.name}/`, dir))));
      continue;
    }
    if (entry.isFile()) {
      files.push(url);
    }
  }

  return files;
}

async function readDirectoryEntries(dir: URL) {
  return readdir(dir, { withFileTypes: true }).catch((error: unknown) => {
    if (isMissingFileError(error)) return [];
    throw error;
  });
}

function isMissingFileError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
