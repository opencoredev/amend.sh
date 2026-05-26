const isPreview =
  process.env.VERCEL_ENV === "preview" || process.env.VITE_AMEND_PREVIEW_AUTH === "true";
const vercelUrl = process.env.VERCEL_URL;
const convexUrl = process.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL must be set by convex deploy --cmd-url-env-var-name.");
}

process.env.VITE_CONVEX_SITE_URL ??= convexUrl.replace(".convex.cloud", ".convex.site");
process.env.VITE_DOCS_URL ??= "https://amend.sh/docs";
process.env.VITE_AMEND_PREVIEW_AUTH = isPreview ? "true" : "false";

if (isPreview && vercelUrl) {
  await run("bun", [
    "--cwd",
    "packages/backend",
    "convex",
    "env",
    "set",
    "SITE_URL",
    `https://${vercelUrl}`,
  ]);
}

await run("bun", ["run", "--cwd", "packages/sdk", "build"]);
await run("bun", ["run", "--cwd", "apps/web", "build"]);
await prepareVercelOutput();

async function prepareVercelOutput() {
  await run("sh", [
    "-lc",
    [
      "rm -rf .vercel/output",
      "mkdir -p .vercel",
      "cp -R apps/web/.vercel/output .vercel/output",
      "rm -rf .vercel/output/functions/__server.func/node_modules",
      "mkdir -p .vercel/output/functions/__server.func/node_modules",
      "cp -RL node_modules/.bun/react@*/node_modules/react .vercel/output/functions/__server.func/node_modules/react",
      "cp -RL node_modules/.bun/react-dom@*/node_modules/react-dom .vercel/output/functions/__server.func/node_modules/react-dom",
      "cp -RL node_modules/.bun/scheduler@*/node_modules/scheduler .vercel/output/functions/__server.func/node_modules/scheduler",
    ].join(" && "),
  ]);
}

async function run(command: string, args: string[]) {
  const child = Bun.spawn([command, ...args], {
    env: process.env,
    stderr: "inherit",
    stdout: "inherit",
  });
  const code = await child.exited;
  if (code !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${code}`);
  }
}
