import { slugify } from "./projectWebsiteUrl";

declare const process: {
  env: {
    CROF_API_KEY?: string;
    CROF_BASE_URL?: string;
    CROF_MODEL?: string;
    OPENROUTER_API_KEY?: string;
    OPENROUTER_MODEL?: string;
    SITE_URL?: string;
  };
};

type ProjectEnrichmentProvider = {
  apiKey: string;
  headers: Record<string, string>;
  model: string;
  url: string;
};

type ProjectSuggestionArgs = {
  description?: string;
  host: string;
  name: string;
  pageText?: string;
  websiteUrl: string;
};

export async function enrichWithModel(args: ProjectSuggestionArgs) {
  const provider = getProjectEnrichmentProvider();
  if (!provider) return fallbackSuggestion(args);

  const response = await fetch(provider.url, {
    body: JSON.stringify({
      max_tokens: 220,
      messages: [
        {
          content:
            "Return compact JSON only with keys name, slug, description. Infer the product identity from website metadata and visible page text. Use a URL-safe lowercase slug. No markdown.",
          role: "system",
        },
        {
          content: JSON.stringify(args),
          role: "user",
        },
      ],
      model: provider.model,
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
    headers: {
      authorization: `Bearer ${provider.apiKey}`,
      "content-type": "application/json",
      ...provider.headers,
    },
    method: "POST",
  });

  if (!response.ok) return fallbackSuggestion(args);

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return fallbackSuggestion(args);

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
    return fallbackSuggestion(args);
  }
}

export function fallbackSuggestion(args: {
  description?: string;
  host: string;
  name: string;
  websiteUrl: string;
}) {
  return {
    description: args.description,
    name: args.name,
    slug: slugify(args.name || args.host),
    websiteUrl: args.websiteUrl,
  };
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
