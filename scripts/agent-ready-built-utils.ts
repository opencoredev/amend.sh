import { readdir, readFile } from "node:fs/promises";

type Check = {
  detail?: string;
  name: string;
  ok: boolean;
};

type BuiltMeta = {
  headers?: Record<string, string>;
  status?: number;
};

export const checks: Check[] = [];
const root = new URL("../", import.meta.url);

export async function read(path: string) {
  try {
    return await readFile(new URL(path, root), "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(
        `Missing ${path}. Run \`bun run build\` before \`bun run agent-ready:built\`.`,
      );
    }
    throw error;
  }
}

export async function readBundleContaining(directory: string, marker: string) {
  const entries = await readdir(new URL(directory, root));
  for (const entry of entries.filter((entry) => entry.endsWith(".js"))) {
    const path = `${directory}/${entry}`;
    const content = await read(path);
    if (content.includes(marker)) {
      return content;
    }
  }
  throw new Error(
    `Missing built bundle in ${directory} containing ${marker}. Run \`bun run build\`.`,
  );
}

export async function readMeta(path: string) {
  return JSON.parse(await read(path)) as BuiltMeta;
}

export function add(name: string, ok: boolean, detail?: string) {
  checks.push({ detail, name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

export function includesAll(content: string, expected: string[]) {
  return expected.every((value) => content.includes(value));
}

export function excludesAll(content: string, unexpected: string[]) {
  return unexpected.every((value) => !content.includes(value));
}

export function extractSitemapLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) => match[1].trim());
}

export function extractMarkdownLinks(markdown: string) {
  return Array.from(markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g), (match) => match[1].trim());
}

export function hasNoDuplicateValues(values: string[]) {
  return new Set(values).size === values.length;
}

export function locsStayOnOrigin(locs: string[], origin: string) {
  return locs.every((loc) => loc === origin || loc.startsWith(`${origin}/`));
}

export function metaHasContentType(meta: BuiltMeta, expected: string) {
  return meta.status === 200 && meta.headers?.["content-type"]?.includes(expected) === true;
}

export function isParseableJsonObject(content: string) {
  try {
    const parsed = JSON.parse(content);
    return Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed));
  } catch {
    return false;
  }
}

export const docsPages = [
  {
    copy: "Build a source-linked product update loop",
    html: "apps/fumadocs/.next/server/app/docs.html",
    markdownCopy: "Amend connects four things teams usually keep apart",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/content.md.body",
    path: "/docs",
  },
  {
    copy: "Prove one source-linked update loop",
    html: "apps/fumadocs/.next/server/app/docs/quickstart.html",
    markdownCopy: "one workspace, one customer request",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/quickstart/content.md.body",
    path: "/docs/quickstart",
  },
  {
    copy: "Connect Amend to your portal",
    html: "apps/fumadocs/.next/server/app/docs/integration.html",
    markdownCopy: "Integrate Amend from the outside in",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/integration/content.md.body",
    path: "/docs/integration",
  },
  {
    copy: "The evidence chain",
    html: "apps/fumadocs/.next/server/app/docs/source-trace.html",
    markdownCopy: "Source trace is the reason Amend exists",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/source-trace/content.md.body",
    path: "/docs/source-trace",
  },
  {
    copy: "Run Amend with your own deployment",
    html: "apps/fumadocs/.next/server/app/docs/self-hosting.html",
    markdownCopy: "Self-hosting keeps the same product loop",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/self-hosting/content.md.body",
    path: "/docs/self-hosting",
  },
  {
    copy: "Production launch checklist",
    html: "apps/fumadocs/.next/server/app/docs/launch.html",
    markdownCopy: "bun run agent-ready:live",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/launch/content.md.body",
    path: "/docs/launch",
  },
];

export const webPublicPages = [
  {
    copy: [
      "Close the loop between",
      "feedback and shipped code.",
      "Collect requests from the channels people already use.",
      "Customer feedback should not die in Slack.",
    ],
    marker: "Close the loop between",
    path: "/",
  },
  {
    copy: [
      "Use the full lockup first.",
      "The symbol is the compact mark.",
      "Lockup for the brand. Mark for the product surface.",
    ],
    marker: "Use the full lockup first.",
    path: "/brand",
  },
  {
    copy: [
      "The portal inside your app.",
      "This route mounts the same side-panel helper customer apps can install.",
      "View hosted portal",
    ],
    marker: "The portal inside your app.",
    path: "/embed-demo",
  },
  {
    copy: [
      "Requests, roadmap moves, and shipped updates with source evidence from Amend.",
      "Ready to collect feedback",
      "Share this portal with users to start collecting source-linked requests.",
    ],
    marker: "Ready to collect feedback",
    path: "/portal/amend-labs",
  },
];

export function finishBuiltChecks() {
  const failed = checks.filter((check) => !check.ok);
  console.log("");
  console.log(
    `Agent-ready built summary: ${checks.length - failed.length}/${checks.length} passing.`,
  );
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}
