import { stat } from "node:fs/promises";

const defaultPostHogCliHost = "https://us.posthog.com";
const defaultPostHogProjectId = "441195";
const staticAssetsDirectory = ".vercel/output/static";

const apiKey = process.env.POSTHOG_CLI_API_KEY;
const projectId =
  process.env.POSTHOG_CLI_PROJECT_ID ??
  process.env.VITE_POSTHOG_PROJECT_ID ??
  defaultPostHogProjectId;
const host = process.env.POSTHOG_CLI_HOST ?? defaultPostHogCliHost;
const releaseName = process.env.POSTHOG_RELEASE_NAME ?? "amend-web";
const releaseVersion =
  process.env.POSTHOG_RELEASE_VERSION ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  (await readGitCommit());

if (!apiKey) {
  console.log("Skipping PostHog sourcemap upload: POSTHOG_CLI_API_KEY is not set.");
  process.exit(0);
}

if (!(await directoryHasSourceMaps(staticAssetsDirectory))) {
  console.log(
    `Skipping PostHog sourcemap upload: no sourcemaps found in ${staticAssetsDirectory}.`,
  );
  process.exit(0);
}

const env = {
  ...process.env,
  POSTHOG_CLI_API_KEY: apiKey,
  POSTHOG_CLI_HOST: host,
  POSTHOG_CLI_PROJECT_ID: projectId,
};

await run(
  "bun",
  [
    "--cwd",
    "apps/web",
    "posthog-cli",
    "sourcemap",
    "inject",
    "--directory",
    `../../${staticAssetsDirectory}`,
  ],
  env,
);
await run(
  "bun",
  [
    "--cwd",
    "apps/web",
    "posthog-cli",
    "sourcemap",
    "upload",
    "--directory",
    `../../${staticAssetsDirectory}`,
    "--release-name",
    releaseName,
    "--release-version",
    releaseVersion,
    "--delete-after",
  ],
  env,
);

async function readGitCommit() {
  const child = Bun.spawn(["git", "rev-parse", "HEAD"], {
    stderr: "pipe",
    stdout: "pipe",
  });
  const output = await new Response(child.stdout).text();
  if ((await child.exited) !== 0) {
    return "local";
  }

  return output.trim() || "local";
}

async function directoryHasSourceMaps(directory: string) {
  try {
    if (!(await stat(directory)).isDirectory()) {
      return false;
    }
  } catch {
    return false;
  }

  const glob = new Bun.Glob("**/*.map");
  for await (const _file of glob.scan({ cwd: directory, onlyFiles: true })) {
    return true;
  }
  return false;
}

async function run(command: string, args: string[], env: Record<string, string | undefined>) {
  const child = Bun.spawn([command, ...args], {
    env,
    stderr: "inherit",
    stdout: "inherit",
  });
  const code = await child.exited;
  if (code !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${code}`);
  }
}
