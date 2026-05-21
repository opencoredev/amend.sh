import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError, v } from "convex/values";

import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

declare const process: {
  env: {
    OPENROUTER_API_KEY?: string;
    OPENROUTER_MODEL?: string;
    CROF_API_KEY?: string;
    CROF_BASE_URL?: string;
    CROF_MODEL?: string;
    SITE_URL?: string;
  };
};

const rateLimiter = new RateLimiter(components.rateLimiter, {
  projectWebsiteLookup: {
    kind: "token bucket",
    rate: 12,
    period: MINUTE,
    capacity: 4,
  },
});

const projectSuggestion = v.object({
  description: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  name: v.string(),
  slug: v.string(),
  websiteUrl: v.string(),
});

type AuthUser = {
  _id?: string;
  userId?: string;
  user?: {
    email?: string;
    id?: string;
    name?: string;
  };
};

type ProjectEnrichmentProvider = {
  apiKey: string;
  headers: Record<string, string>;
  model: string;
  url: string;
};

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const authUser = (await authComponent.safeGetAuthUser(ctx)) as AuthUser | null;
  const userId = authUser?.userId ?? authUser?.user?.id ?? authUser?._id;
  if (!userId) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Sign in before creating a project.",
    });
  }
  return {
    email: authUser?.user?.email,
    id: userId,
    name: authUser?.user?.name,
  };
}

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new ConvexError({
      code: "INVALID_WEBSITE",
      message: "Enter a website URL first.",
    });
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!isVerifiableHost(url.hostname)) {
      throw new Error("Host is not a complete domain.");
    }
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new ConvexError({
      code: "INVALID_WEBSITE",
      message: "Use a valid website URL.",
    });
  }
}

function isVerifiableHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === "localhost") return true;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true;
  if (host.includes("..") || !host.includes(".")) return false;
  const labels = host.split(".");
  const tld = labels[labels.length - 1] ?? "";
  return labels.every((label) => /^[a-z0-9-]+$/.test(label) && label.length > 0) && tld.length >= 2;
}

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "project";
}

function extractTitle(html: string) {
  const ogTitle = findMetaContent(html, ["og:title", "twitter:title", "application-name"]);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  return cleanMetadata(ogTitle ?? title);
}

function extractDescription(html: string) {
  return findMetaContent(html, ["og:description", "twitter:description", "description"]);
}

function cleanMetadata(value?: string) {
  return value ? decodeHtml(value).replace(/\s+/g, " ").trim() : undefined;
}

function readHtmlAttribute(tag: string, name: string) {
  const pattern = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
  return tag.match(pattern)?.[1];
}

function findMetaContent(html: string, names: string[]) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const key = (readHtmlAttribute(tag, "property") ?? readHtmlAttribute(tag, "name"))
      ?.toLowerCase()
      .trim();
    if (!key || !wanted.has(key)) continue;
    const content = readHtmlAttribute(tag, "content");
    if (content) return cleanMetadata(content);
  }
  return undefined;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function extractPageText(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  ).slice(0, 4_000);
}

function extractLogoUrl(html: string, websiteUrl: string) {
  const href = findIconHref(html) ?? findMetaContent(html, ["og:image", "twitter:image"]);
  if (!href) return fallbackFaviconUrl(websiteUrl);
  try {
    return new URL(href, websiteUrl).toString();
  } catch {
    return fallbackFaviconUrl(websiteUrl);
  }
}

function fallbackFaviconUrl(websiteUrl: string) {
  try {
    const host = new URL(websiteUrl).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return undefined;
  }
}

function findIconHref(html: string) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const rel = readHtmlAttribute(tag, "rel")?.toLowerCase() ?? "";
    if (!rel.includes("icon")) continue;
    const href = readHtmlAttribute(tag, "href");
    if (href) return cleanMetadata(href);
  }
  return undefined;
}

async function readHomepage(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Amend project setup (+https://amend.sh)",
      },
    });
    const html = response.status < 500 ? await response.text() : "";
    return {
      html: html.slice(0, 16_000),
      reachable: response.status < 500,
    };
  } catch {
    return {
      html: "",
      reachable: false,
    };
  }
}

async function enrichWithModel(args: {
  description?: string;
  host: string;
  name: string;
  pageText?: string;
  websiteUrl: string;
}) {
  const provider = getProjectEnrichmentProvider();
  if (!provider) {
    return {
      description: args.description,
      name: args.name,
      slug: slugify(args.name || args.host),
      websiteUrl: args.websiteUrl,
    };
  }

  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${provider.apiKey}`,
      "content-type": "application/json",
      ...provider.headers,
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "Return compact JSON only with keys name, slug, description. Infer the product identity from website metadata and visible page text. Use a URL-safe lowercase slug. No markdown.",
        },
        {
          role: "user",
          content: JSON.stringify({
            description: args.description,
            host: args.host,
            name: args.name,
            pageText: args.pageText,
            websiteUrl: args.websiteUrl,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    return {
      description: args.description,
      name: args.name,
      slug: slugify(args.name || args.host),
      websiteUrl: args.websiteUrl,
    };
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return {
      description: args.description,
      name: args.name,
      slug: slugify(args.name || args.host),
      websiteUrl: args.websiteUrl,
    };
  }

  try {
    const parsed = parseModelJson(content) as {
      description?: string;
      name?: string;
      slug?: string;
    };
    const name = parsed.name?.trim() || args.name;
    return {
      description: parsed.description?.trim() || args.description,
      name,
      slug: slugify(parsed.slug || name),
      websiteUrl: args.websiteUrl,
    };
  } catch {
    return {
      description: args.description,
      name: args.name,
      slug: slugify(args.name || args.host),
      websiteUrl: args.websiteUrl,
    };
  }
}

function getProjectEnrichmentProvider(): ProjectEnrichmentProvider | null {
  if (process.env.OPENROUTER_API_KEY) {
    return {
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        "http-referer": process.env.SITE_URL ?? "http://amend.localhost:1355",
        "x-openrouter-title": "Amend.sh local project setup",
      },
      model: process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
      url: "https://openrouter.ai/api/v1/chat/completions",
    };
  }

  if (process.env.CROF_API_KEY) {
    const baseUrl = process.env.CROF_BASE_URL ?? "https://crof.ai/v1";
    return {
      apiKey: process.env.CROF_API_KEY,
      headers: {},
      model: process.env.CROF_MODEL ?? "kimi-k2.6",
      url: `${baseUrl.replace(/\/$/, "")}/chat/completions`,
    };
  }

  return null;
}

function parseModelJson(content: string) {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const unfenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const objectMatch = unfenced.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new Error("Model response did not contain JSON.");
    }
    return JSON.parse(objectMatch[0]) as unknown;
  }
}

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      description: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      name: v.string(),
      slug: v.string(),
      websiteUrl: v.optional(v.string()),
      workspaceId: v.id("workspaces"),
    }),
  ),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_externalUserId", (q) => q.eq("externalUserId", user.id))
      .collect();

    const projects = [];
    for (const membership of memberships) {
      const workspaceProjects = await ctx.db
        .query("projects")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", membership.workspaceId))
        .collect();
      projects.push(...workspaceProjects);
    }

    return projects.map((project) => ({
      _id: project._id,
      description: project.description,
      logoUrl: project.logoUrl,
      name: project.name,
      slug: project.slug,
      websiteUrl: project.websiteUrl,
      workspaceId: project.workspaceId,
    }));
  },
});

export const consumeWebsiteLookup = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    await rateLimiter.limit(ctx, "projectWebsiteLookup", {
      key: user.id,
      throws: true,
    });
    return null;
  },
});

export const suggestFromWebsite = action({
  args: { websiteUrl: v.string() },
  returns: projectSuggestion,
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.projects.consumeWebsiteLookup, {});
    const websiteUrl = normalizeUrl(args.websiteUrl);
    const host = new URL(websiteUrl).hostname.replace(/^www\./, "");
    const { html, reachable } = await readHomepage(websiteUrl);
    if (!reachable) {
      throw new ConvexError({
        code: "INVALID_WEBSITE",
        message: "We could not verify that domain. Check the URL and try again.",
      });
    }
    const name = extractTitle(html) ?? host.split(".")[0] ?? "Project";
    const description = extractDescription(html);
    const logoUrl = extractLogoUrl(html, websiteUrl);
    const pageText = extractPageText(html);
    const suggestion = await enrichWithModel({
      description,
      host,
      name,
      pageText,
      websiteUrl,
    });

    return {
      ...suggestion,
      logoUrl,
    };
  },
});

export const create = mutation({
  args: projectSuggestion,
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const workspaceSlug = `${slugify(args.slug)}-${user.id.slice(0, 6).toLowerCase()}`;
    const workspaceId = await ctx.db.insert("workspaces", {
      createdAt: now,
      description: args.description,
      name: args.name,
      portalSettings: {
        changelogVisibility: "public",
        feedbackMode: "open",
        headline: `${args.name} updates`,
        intro: "Feedback, roadmap moves, and shipped updates with source evidence.",
        roadmapVisibility: "public",
      },
      slug: workspaceSlug,
      updatedAt: now,
      visibility: "private",
    });

    await ctx.db.insert("workspaceMembers", {
      createdAt: now,
      email: user.email ?? "local@amend.sh",
      externalUserId: user.id,
      name: user.name,
      permissions: ["workspace:admin", "project:create", "post:review"],
      role: "owner",
      updatedAt: now,
      workspaceId,
    });

    const projectId: Id<"projects"> = await ctx.db.insert("projects", {
      createdAt: now,
      description: args.description,
      logoUrl: args.logoUrl,
      name: args.name,
      slug: args.slug,
      stableKey: `project:${args.slug}`,
      updatedAt: now,
      visibility: "private",
      websiteUrl: args.websiteUrl,
      workspaceId,
    });

    return projectId;
  },
});
