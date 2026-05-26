export type BuildAsset = {
  name: string;
  size: number;
};

export type SearchableBuildFile = {
  content: string;
  path: string;
};

export type BuildSizeInspection = {
  errors: string[];
  largest: BuildAsset | null;
  ok: boolean;
  summary: string | null;
};

type ForbiddenProductionToken = {
  label: string;
  token: string;
};

export const maxClientChunkBytes = 500 * 1024;

export const forbiddenProductionTokens: ForbiddenProductionToken[] = [
  { label: "seeded demo email", token: "developer@amend.sh" },
  { label: "seeded demo password", token: "amend-demo-local" },
  { label: "seed demo mutation", token: "amend:seedDemoData" },
  { label: "join seeded workspace mutation", token: "amend:joinSeededDemoWorkspace" },
  { label: "development demo button copy", token: "Continue with local demo" },
];

export const searchableBuildExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".svg",
  ".txt",
  ".xml",
]);

export function inspectBuildSize({
  assets,
  files,
  maxChunkBytes = maxClientChunkBytes,
}: {
  assets: BuildAsset[];
  files: SearchableBuildFile[];
  maxChunkBytes?: number;
}): BuildSizeInspection {
  const errors: string[] = [];
  const largest = [...assets].sort((a, b) => b.size - a.size)[0] ?? null;

  if (!largest) {
    errors.push("No built client JavaScript assets found. Run `bun run build` first.");
  } else if (largest.size > maxChunkBytes) {
    errors.push(
      `Largest client chunk is ${formatKiB(largest.size)} (${largest.name}), above the ${formatKiB(
        maxChunkBytes,
      )} limit.`,
    );
  }

  const leakedTokens = findForbiddenProductionTokens(files);
  if (leakedTokens.length > 0) {
    errors.push("Production build includes local development auth code:");
    for (const leak of leakedTokens) {
      errors.push(`- ${leak.path} contains ${leak.label}`);
    }
  }

  return {
    errors,
    largest,
    ok: errors.length === 0,
    summary:
      largest && errors.length === 0
        ? `PASS build size: largest client chunk is ${formatKiB(largest.size)} (${largest.name}); production build has no local dev auth tokens.`
        : null,
  };
}

export function extension(path: string) {
  const match = path.match(/(\.[^/.]+)$/);
  return match?.[1] ?? "";
}

export function formatKiB(bytes: number) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function findForbiddenProductionTokens(files: SearchableBuildFile[]) {
  const leaks: Array<{ label: string; path: string }> = [];

  for (const file of files) {
    for (const forbidden of forbiddenProductionTokens) {
      if (file.content.includes(forbidden.token)) {
        leaks.push({ label: forbidden.label, path: file.path });
      }
    }
  }

  return leaks;
}
