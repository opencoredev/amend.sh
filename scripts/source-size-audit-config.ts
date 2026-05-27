const defaultReportLimit = 20;

export const defaultMaxLines = 500;
export const defaultMaxAssetBytes = 250 * 1024;

export const defaultIgnoredDirectoryParts = new Set([
  ".codex-artifacts",
  ".convex",
  ".git",
  ".next",
  ".open-next",
  ".output",
  ".react-router",
  ".source",
  ".tanstack",
  ".turbo",
  ".vinxi",
  ".vite",
  ".wrangler",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

export const defaultIgnoredFileNames = new Set(["bun.lock"]);

export const defaultIgnoredExtensions = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".lock",
  ".png",
  ".svg",
  ".ttf",
  ".woff",
  ".woff2",
  ".webp",
]);

export const assetExtensions = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".ttf",
  ".woff",
  ".woff2",
  ".webp",
]);

export const defaultAllowedLargeFiles = new Map<string, string>([
  ["apps/web/src/lib/og-image.tsx", "static Open Graph image renderer template"],
  ["apps/web/public/images/project-setup-dashboard.webp", "binary product screenshot asset"],
  ["packages/api-spec/openapi.yaml", "public OpenAPI contract source of truth"],
  ["packages/sdk/src/openapi-types.ts", "generated from the OpenAPI contract"],
  ["prompt.txt", "canonical product build brief"],
]);

export function parseReportLimit(argv: string[]) {
  const reportIndex = argv.findIndex((arg) => arg === "--report");
  if (reportIndex >= 0) return defaultReportLimit;

  const topArg = argv.find((arg) => arg.startsWith("--top="));
  if (!topArg) return 0;

  const parsed = Number.parseInt(topArg.slice("--top=".length), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultReportLimit;
}
