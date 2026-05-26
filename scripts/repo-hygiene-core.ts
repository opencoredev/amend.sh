export type RepoHygieneIssue = {
  path: string;
  reason: string;
};

type ForbiddenTrackedPathRule = {
  reason: string;
  test: (path: string) => boolean;
};

const appFrameworkBuildDirs = [".open-next", ".output", ".react-router", ".tanstack", ".vinxi"];
const buildOutputDirs = ["dist", "build", "out"];
const localFrameworkCacheDirs = [".cache", ".source", ".wrangler"];

const forbiddenTrackedPathRules: ForbiddenTrackedPathRule[] = [
  {
    reason: "local browser and screenshot evidence artifacts must stay outside tracked source",
    test: (path) => pathIsAtOrInside(path, ".codex-artifacts"),
  },
  {
    reason: "Next build output must not be tracked",
    test: (path) => pathIsAtOrInside(path, ".next"),
  },
  {
    reason: "app framework build output must not be tracked",
    test: (path) => pathIsAtOrInsideAny(path, appFrameworkBuildDirs),
  },
  {
    reason: "Convex local development state must not be tracked",
    test: (path) => pathIsAtOrInside(path, ".convex"),
  },
  {
    reason: "Turbo cache output must not be tracked",
    test: (path) => pathIsAtOrInside(path, ".turbo"),
  },
  {
    reason: "build output directories must not be tracked",
    test: (path) => pathIsAtOrInsideAny(path, buildOutputDirs),
  },
  {
    reason: "Vite cache output must not be tracked",
    test: (path) => pathIsAtOrInside(path, ".vite"),
  },
  {
    reason: "local framework cache output must not be tracked",
    test: (path) => pathIsAtOrInsideAny(path, localFrameworkCacheDirs),
  },
  {
    reason: "dependency vendor directories must not be tracked",
    test: (path) => pathIsAtOrInside(path, "node_modules"),
  },
  {
    reason: "coverage output must not be tracked",
    test: (path) => pathIsAtOrInside(path, "coverage"),
  },
  {
    reason: "TypeScript build metadata must not be tracked",
    test: (path) => path.endsWith(".tsbuildinfo"),
  },
  {
    reason: "temporary scratch files must not be tracked",
    test: (path) => rootPathIsAtOrInsideAny(path, ["tmp", "temp"]),
  },
];

export function collectRepoHygieneIssues(trackedFiles: string[]) {
  const issues: RepoHygieneIssue[] = [];

  for (const path of trackedFiles) {
    for (const rule of forbiddenTrackedPathRules) {
      if (rule.test(path)) {
        issues.push({ path, reason: rule.reason });
        break;
      }
    }
  }

  return issues.sort((a, b) => a.path.localeCompare(b.path));
}

function pathIsAtOrInsideAny(path: string, directories: string[]) {
  return directories.some((directory) => pathIsAtOrInside(path, directory));
}

function pathIsAtOrInside(path: string, directory: string) {
  return path === directory || path.startsWith(`${directory}/`) || path.includes(`/${directory}/`);
}

function rootPathIsAtOrInsideAny(path: string, directories: string[]) {
  return directories.some((directory) => path === directory || path.startsWith(`${directory}/`));
}
