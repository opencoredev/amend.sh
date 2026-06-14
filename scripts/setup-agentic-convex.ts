import { randomBytes } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type CommandResult = {
  ok: boolean;
  output: string;
};

type SetupOptions = {
  dryRun: boolean;
  expiration: string;
  local: boolean;
  projectRef?: string;
  siteUrl: string;
  skipDefaultEnv: boolean;
  skipInstall: boolean;
  worktreeName: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..");
const backendDir = join(repoRoot, "packages/backend");
const backendEnvPath = join(backendDir, ".env.local");
const webEnvPath = join(repoRoot, "apps/web/.env");
const webEnvExamplePath = join(repoRoot, "apps/web/.env.example");
const defaultConvexProjectRef =
  process.env.CONVEX_DEV_PROJECT_REF ?? process.env.CONVEX_PROJECT_REF;

const options = parseArgs(process.argv.slice(2));

if (options.dryRun) {
  const deploymentRef = deploymentReference(options);
  console.log(
    options.skipInstall
      ? "Would skip dependency installation."
      : "Would install dependencies with bun install.",
  );
  console.log(
    options.local
      ? "Would set up a local anonymous Convex deployment."
      : `Would create/select Convex deployment ${deploymentRef} with expiration ${JSON.stringify(
          options.expiration,
        )}.`,
  );
  process.exit(0);
}

if (!options.skipInstall) {
  await run("bun", ["install"], {
    cwd: repoRoot,
    label: "Install Bun dependencies",
  });
}

if (options.local) {
  await runBunx(["convex", "dev", "--once", "--tail-logs", "disable"], {
    cwd: backendDir,
    label: "Set up local Convex deployment",
  });
} else {
  const deploymentRef = deploymentReference(options);
  const created = await runBunx(
    [
      "convex",
      "deployment",
      "create",
      "--type",
      "dev",
      "--select",
      deploymentRef,
      "--expiration",
      options.expiration,
    ],
    {
      allowFailure: true,
      cwd: backendDir,
      label: `Create/select Convex deployment ${deploymentRef}`,
    },
  );

  if (!created.ok) {
    console.warn(
      `Could not create ${deploymentRef}; trying to select it in case it already exists.`,
    );
    await runBunx(["convex", "deployment", "select", deploymentRef], {
      cwd: backendDir,
      label: `Select existing Convex deployment ${deploymentRef}`,
    });
  }

  if (!options.skipDefaultEnv) {
    await ensureConvexEnv("SITE_URL", options.siteUrl);
    await ensureConvexEnv("BETTER_AUTH_SECRET", randomSecret());
    await ensureConvexEnv("GITHUB_WEBHOOK_SECRET", randomSecret());
    await ensureConvexEnv("AMEND_API_TOKEN", randomSecret());
    if (process.env.POSTHOG_API_KEY) {
      await ensureConvexEnv("POSTHOG_API_KEY", process.env.POSTHOG_API_KEY);
    }
    if (process.env.POSTHOG_HOST) {
      await ensureConvexEnv("POSTHOG_HOST", process.env.POSTHOG_HOST);
    }
  }

  await runBunx(["convex", "dev", "--once", "--tail-logs", "disable"], {
    cwd: backendDir,
    label: "Deploy Convex functions once",
  });
}

await syncWebEnv();

const backendEnv = await readEnvFile(backendEnvPath);
console.log("");
console.log("Convex development deployment is ready.");
console.log(`Backend: ${backendEnv.CONVEX_DEPLOYMENT ?? "selected deployment"}`);
console.log(`Web env: ${relativePath(webEnvPath)}`);

function parseArgs(args: string[]): SetupOptions {
  const optionValues = new Map<string, string>();
  const flags = new Set<string>();
  const valueOptions = new Set(["expiration", "project-ref", "site-url", "worktree-name"]);
  const booleanOptions = new Set(["dry-run", "local", "skip-default-env"]);

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") {
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument ${arg}`);
    }

    const [name, inlineValue] = arg.slice(2).split("=", 2);
    if (valueOptions.has(name)) {
      const value = inlineValue ?? args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`--${name} requires a value`);
      }
      optionValues.set(name, value);
      if (!inlineValue) index += 1;
      continue;
    }

    if (!booleanOptions.has(name)) {
      throw new Error(`Unknown option --${name}. Run with --help for usage.`);
    }
    if (inlineValue !== undefined) {
      throw new Error(`--${name} does not accept a value`);
    }
    flags.add(name);
  }

  const local = flags.has("local") || process.env.CONVEX_SETUP_MODE === "local";
  const worktreeName =
    optionValues.get("worktree-name") ?? process.env.CONVEX_WORKTREE_NAME ?? basename(repoRoot);

  return {
    dryRun: flags.has("dry-run"),
    expiration: optionValues.get("expiration") ?? process.env.CONVEX_DEV_EXPIRATION ?? "in 3 days",
    local,
    projectRef: optionValues.get("project-ref") ?? defaultConvexProjectRef,
    siteUrl:
      optionValues.get("site-url") ??
      process.env.SITE_URL ??
      process.env.VITE_APP_URL ??
      localWebUrl(worktreeName),
    skipDefaultEnv: flags.has("skip-default-env"),
    skipInstall:
      flags.has("skip-install") ||
      process.env.AMEND_SKIP_INSTALL === "1" ||
      process.env.CI === "true",
    worktreeName,
  };
}

function deploymentReference(optionsValue: SetupOptions) {
  const user = sanitizeRefPart(process.env.USER || process.env.LOGNAME || "agent");
  const worktree = sanitizeRefPart(optionsValue.worktreeName);
  const deployment = `dev/${user}/${worktree}`;
  return optionsValue.projectRef ? `${optionsValue.projectRef}:${deployment}` : deployment;
}

function sanitizeRefPart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .slice(0, 48)
      .replace(/^-+|-+$/g, "") || "worktree"
  );
}

function localWebUrl(worktreeNameValue: string) {
  return `http://${sanitizeLocalhostPart(worktreeNameValue)}.localhost:1355`;
}

function localDocsUrl(worktreeNameValue: string) {
  return `http://docs.${sanitizeLocalhostPart(worktreeNameValue)}.localhost:1355/docs`;
}

function sanitizeLocalhostPart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .slice(0, 48)
      .replace(/^-+|-+$/g, "") || "amend"
  );
}

async function ensureConvexEnv(name: string, value: string) {
  const existing = await runBunx(["convex", "env", "get", name], {
    allowFailure: true,
    cwd: backendDir,
    label: `Check Convex env ${name}`,
    quiet: true,
  });

  if (existing.ok && existing.output.trim() && !existing.output.includes("not found")) {
    return;
  }

  await runBunx(["convex", "env", "set", name, value], {
    cwd: backendDir,
    label: `Set Convex env ${name}`,
  });
}

async function syncWebEnv() {
  const backendEnv = await readEnvFile(backendEnvPath);
  const convexUrl = backendEnv.CONVEX_URL;
  const convexSiteUrl = backendEnv.CONVEX_SITE_URL;

  if (!convexUrl || !convexSiteUrl) {
    throw new Error(
      `${relativePath(backendEnvPath)} must contain CONVEX_URL and CONVEX_SITE_URL after setup.`,
    );
  }

  const webEnv = {
    ...(await readEnvFile(webEnvExamplePath)),
    ...(await readEnvFile(webEnvPath)),
    VITE_CONVEX_URL: convexUrl,
    VITE_CONVEX_SITE_URL: convexSiteUrl,
    VITE_DOCS_URL: localDocsUrl(options.worktreeName),
  };

  await Bun.write(webEnvPath, formatEnvFile(webEnv));
}

async function readEnvFile(path: string) {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return {} as Record<string, string>;
  }

  const env: Record<string, string> = {};
  const text = await file.text();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const name = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[name] = unquoteEnvValue(value);
  }
  return env;
}

function formatEnvFile(env: Record<string, string>) {
  return `${Object.entries(env)
    .map(([name, value]) => `${name}=${quoteEnvValue(value)}`)
    .join("\n")}\n`;
}

function quoteEnvValue(value: string) {
  return /^[A-Za-z0-9_./:@-]+$/.test(value) ? value : JSON.stringify(value);
}

function unquoteEnvValue(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function randomSecret() {
  return randomBytes(32).toString("base64url");
}

async function runBunx(
  args: string[],
  optionsValue: {
    allowFailure?: boolean;
    cwd: string;
    label: string;
    quiet?: boolean;
  },
): Promise<CommandResult> {
  return run("bun", ["x", ...args], optionsValue);
}

async function run(
  cmd: string,
  args: string[],
  optionsValue: {
    allowFailure?: boolean;
    cwd: string;
    label: string;
    quiet?: boolean;
  },
): Promise<CommandResult> {
  if (!optionsValue.quiet) {
    console.log(optionsValue.label);
  }

  const proc = Bun.spawn([cmd, ...args], {
    cwd: optionsValue.cwd,
    env: process.env,
    stderr: "pipe",
    stdout: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  const output = `${stdout}${stderr}`;

  if (exitCode === 0) {
    if (!optionsValue.quiet && output.trim()) {
      console.log(output.trim());
    }
    return { ok: true, output };
  }

  if (optionsValue.allowFailure) {
    if (!optionsValue.quiet && output.trim()) {
      console.warn(output.trim());
    }
    return { ok: false, output };
  }

  throw new Error(`${optionsValue.label} failed with exit code ${exitCode}:\n${output}`);
}

function relativePath(path: string) {
  return path.replace(`${repoRoot}/`, "");
}

function printHelp() {
  console.log(`Usage: bun scripts/setup-agentic-convex.ts [options]

Creates/selects a per-worktree Convex cloud dev deployment, deploys once, and syncs apps/web/.env.

Options:
  --expiration <value>    Convex expiration value. Default: "in 3 days"
  --project-ref <ref>     Team/project prefix. Defaults to CONVEX_DEV_PROJECT_REF when set.
  --worktree-name <name>  Override the deployment ref suffix. Default: repo directory name
  --site-url <url>        SITE_URL to set on new deployments. Default: worktree .localhost URL
  --skip-default-env      Do not seed default Convex env vars
  --skip-install          Do not run bun install before Convex setup
  --local                 Use Convex local anonymous setup instead of cloud dev
  --dry-run               Print the target setup without creating a deployment
`);
}
