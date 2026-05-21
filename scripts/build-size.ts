import { readdir, stat } from "node:fs/promises";

const assetsDir = new URL("../apps/web/dist/client/assets/", import.meta.url);
const maxClientChunkBytes = 500 * 1024;

type AssetSize = {
  name: string;
  size: number;
};

function formatKb(bytes: number) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

const entries = await readdir(assetsDir, { withFileTypes: true });
const jsAssets: AssetSize[] = [];

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith(".js")) {
    continue;
  }

  const fileStat = await stat(new URL(entry.name, assetsDir));
  jsAssets.push({ name: entry.name, size: fileStat.size });
}

if (jsAssets.length === 0) {
  console.error("No built client JavaScript assets found. Run `bun run build` first.");
  process.exit(1);
}

jsAssets.sort((a, b) => b.size - a.size);

const largest = jsAssets[0];
if (!largest) {
  console.error("Unable to inspect built client JavaScript assets.");
  process.exit(1);
}

if (largest.size > maxClientChunkBytes) {
  console.error(
    `Largest client chunk is ${formatKb(largest.size)} (${largest.name}), above the ${formatKb(
      maxClientChunkBytes,
    )} limit.`,
  );
  process.exit(1);
}

console.log(
  `PASS build size: largest client chunk is ${formatKb(largest.size)} (${largest.name}).`,
);
