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

function isMissingFile(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

export async function readFirst(paths: string[]) {
  const missing: string[] = [];
  for (const path of paths) {
    try {
      return await read(path);
    } catch (error) {
      if (isMissingFile(error)) {
        missing.push(path);
        continue;
      }
      throw error;
    }
  }
  throw new Error(
    `Missing one of ${missing.join(", ")}. Run \`bun run build\` before \`bun run agent-ready:built\`.`,
  );
}

export async function readBundleContaining(directory: string, marker: string) {
  const entries = await readdir(new URL(directory, root));
  for (const entry of entries.filter((entry) => /\.(?:mjs|js)$/.test(entry))) {
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

export async function readBundleContainingAny(directories: string[], marker: string) {
  const missing: string[] = [];
  for (const directory of directories) {
    try {
      return await readBundleContaining(directory, marker);
    } catch (error) {
      if (isMissingFile(error)) {
        missing.push(directory);
        continue;
      }
      if (error instanceof Error && error.message.includes("Missing built bundle")) {
        continue;
      }
      throw error;
    }
  }
  throw new Error(
    `Missing built bundle in ${directories.join(", ")} containing ${marker}. Run \`bun run build\`.`,
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
    copy: "Integrate Amend from the outside in",
    html: "apps/fumadocs/.next/server/app/docs/integration.html",
    markdownCopy: "Use the SDK when your product needs an update panel",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/integration/content.md.body",
    path: "/docs/integration",
  },
  {
    copy: "Wire customer identity",
    html: "apps/fumadocs/.next/server/app/docs/customer-surfaces.html",
    markdownCopy: "Customer surfaces are the parts of Amend",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/customer-surfaces/content.md.body",
    path: "/docs/customer-surfaces",
  },
  {
    copy: "Import GitHub",
    html: "apps/fumadocs/.next/server/app/docs/source-events.html",
    markdownCopy: "Source events are the evidence side",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/source-events/content.md.body",
    path: "/docs/source-events",
  },
  {
    copy: "Configure Mostly Auto rules",
    html: "apps/fumadocs/.next/server/app/docs/automation.html",
    markdownCopy: "Automation should start review-first",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/automation/content.md.body",
    path: "/docs/automation",
  },
  {
    copy: "Beta REST and SDK contract",
    html: "apps/fumadocs/.next/server/app/docs/api-reference.html",
    markdownCopy: "The REST API is served by Convex HTTP actions",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/api-reference/content.md.body",
    path: "/docs/api-reference",
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
    copy: "Make docs work from docs.amend.sh",
    html: "apps/fumadocs/.next/server/app/docs/production-routing.html",
    markdownCopy: "The canonical docs app runs on",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/production-routing/content.md.body",
    path: "/docs/production-routing",
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
      "Users asked. You shipped.",
      "Amend closes the loop.",
      "Amend watches selected Discord, Slack, GitHub, Linear, support, and in-app sources",
      "Open source and self-hostable",
    ],
    marker: "Users asked. You shipped.",
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
