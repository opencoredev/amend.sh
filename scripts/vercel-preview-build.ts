const isPreview =
  process.env.VERCEL_ENV === "preview" || process.env.VITE_AMEND_PREVIEW_AUTH === "true";
const vercelUrl = process.env.VERCEL_URL;
const convexUrl = process.env.VITE_CONVEX_URL;
const docsOrigin = process.env.AMEND_DOCS_ORIGIN ?? "https://docs.amend.sh";

if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL must be set by convex deploy --cmd-url-env-var-name.");
}

const convexSiteUrl = convexUrl.replace(".convex.cloud", ".convex.site");

process.env.NITRO_PRESET ??= "vercel";
process.env.VITE_CONVEX_SITE_URL ??= convexSiteUrl;
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
await injectDocsProxyRoutes();
await run("bun", ["scripts/posthog-sourcemaps.ts"]);
await writePreviewMetadata();

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

async function injectDocsProxyRoutes() {
  const configPath = ".vercel/output/config.json";
  const configFile = Bun.file(configPath);
  const config = (await configFile.exists())
    ? ((await configFile.json()) as {
        routes?: Array<Record<string, unknown>>;
        version?: number;
      })
    : { version: 3 };
  const routes = config.routes ?? [];
  const docsProxyRoutes = [
    { src: "/docs/?", dest: `${docsOrigin}/docs` },
    { src: "/docs/(.*)", dest: `${docsOrigin}/docs/$1` },
    { src: "/og/docs/(.*)", dest: `${docsOrigin}/og/docs/$1` },
    { src: "/llms.mdx/docs/(.*)", dest: `${docsOrigin}/llms.mdx/docs/$1` },
    { src: "/schemas/(.*)", dest: `${docsOrigin}/schemas/$1` },
    { src: "/fonts/(.*)", dest: `${docsOrigin}/fonts/$1` },
    { src: "/api/search", dest: `${docsOrigin}/api/search` },
    { src: "/api/chat", dest: `${docsOrigin}/api/chat` },
  ];
  const docsRouteSources = new Set(docsProxyRoutes.map((route) => route.src));

  config.version = 3;
  config.routes = [
    ...docsProxyRoutes,
    ...routes.filter((route) => typeof route.src !== "string" || !docsRouteSources.has(route.src)),
  ];

  await Bun.write(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

async function writePreviewMetadata() {
  if (!isPreview) {
    return;
  }

  await Bun.write(
    ".vercel/convex-preview.json",
    `${JSON.stringify({ convexSiteUrl, convexUrl }, null, 2)}\n`,
  );
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
