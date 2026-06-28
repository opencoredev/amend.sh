import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { verifyApiToken } from "./httpRuntimeAuth";
import { json, readBody } from "./httpRuntimeRouting";
import { optionalString } from "./httpRuntimeScalars";

declare const process: {
  env: {
    CROF_API_KEY?: string;
    CROF_BASE_URL?: string;
    CROF_MODEL?: string;
    CROF_CLASSIFIER_MODEL?: string;
    DISCORD_DEFAULT_WORKSPACE_SLUG?: string;
  };
};

type Verdict = { signal: boolean; title: string; kind: string };

// Extract the first JSON object from a model response — robust to code fences,
// prose, or reasoning text some models prepend/append around the JSON.
function extractJsonObject(value: string): {
  signal?: boolean;
  title?: string;
  kind?: string;
} | null {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end < start) {
    return null;
  }
  try {
    return JSON.parse(value.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Cheap-model AI judge: is this Discord message genuine product signal worth
// capturing? Only survivors of the channel allowlist (enforced by the gateway
// worker) reach here, and only "signal" messages become needs. On any error we
// default to NOT signal — never manufacture noise or cost on a bad response.
async function classifyMessage(content: string): Promise<Verdict> {
  const apiKey = process.env.CROF_API_KEY;
  if (!apiKey) {
    return { signal: false, title: "", kind: "feedback" };
  }
  const baseUrl = (process.env.CROF_BASE_URL ?? "https://crof.ai/v1").replace(/\/$/, "");
  // Use a deliberately cheap classifier model; falls back to the main model.
  const model = process.env.CROF_CLASSIFIER_MODEL ?? process.env.CROF_MODEL ?? "kimi-k2.6";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 120,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You triage chat messages for a product-feedback tool. A message is SIGNAL only when it expresses a feature request, a bug or problem with the product, or concrete product feedback. Greetings, banter, reactions, links, and questions aimed at other people are NOT signal. Reply with compact JSON only — no prose, no code fences.",
          },
          {
            role: "user",
            content: `Message: ${JSON.stringify(content)}\nReply exactly: {"signal": true|false, "title": "imperative summary, <= 8 words", "kind": "feature|bug|feedback"}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return { signal: false, title: "", kind: "feedback" };
    }
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content;
    if (!raw) {
      return { signal: false, title: "", kind: "feedback" };
    }
    const parsed = extractJsonObject(raw);
    if (!parsed) {
      return { signal: false, title: "", kind: "feedback" };
    }
    return {
      signal: parsed.signal === true,
      title: optionalString(parsed.title) ?? "",
      kind: optionalString(parsed.kind) ?? "feedback",
    };
  } catch {
    return { signal: false, title: "", kind: "feedback" };
  } finally {
    clearTimeout(timeout);
  }
}

// POST /ingest/discordMessage — called by the always-on gateway worker for each
// message in an allowlisted channel. Classifies with a cheap model and, when the
// message is real signal, ingests it as a discord-channel need. Returns
// `{ capture, react }` so the worker knows whether to add the 👀 reaction.
export const discordMessageIngest = httpAction(async (ctx, request) => {
  const auth = verifyApiToken(request);
  if (!auth.ok) {
    return json({ error: auth.error }, 401);
  }

  const body = readBody(await request.text());
  const content = (optionalString(body.content) ?? "").trim();
  if (!content) {
    return json({ capture: false, react: false }, 200);
  }

  const verdict = await classifyMessage(content);
  if (!verdict.signal) {
    return json({ capture: false, react: false }, 200);
  }

  const guildId = optionalString(body.guildId);
  const channelId = optionalString(body.channelId);
  const messageId = optionalString(body.messageId);
  const author =
    optionalString(body.authorName) ?? optionalString(body.authorId) ?? "Discord";
  const url =
    guildId && channelId && messageId
      ? `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
      : "https://discord.com/channels/@me";

  await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
    provider: "discord",
    externalId: `discord:message:${messageId ?? `${channelId ?? "unknown"}:${Date.now()}`}`,
    kind: "customer_signal",
    title: verdict.title || content.slice(0, 120),
    url,
    author,
    labels: ["discord", verdict.kind],
    workspaceSlug: optionalString(process.env.DISCORD_DEFAULT_WORKSPACE_SLUG),
  });

  return json({ capture: true, react: true, title: verdict.title }, 200);
});
