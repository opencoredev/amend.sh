import type { SourceProvider } from "../lib/amendValidators";
import { optionalString } from "../lib/httpRuntimeScalars";

declare const process: {
  env: {
    CROF_API_KEY?: string;
    CROF_BASE_URL?: string;
    CROF_CLASSIFIER_MODEL?: string;
    CROF_MODEL?: string;
    OPENROUTER_API_KEY?: string;
    OPENROUTER_MODEL?: string;
    SITE_URL?: string;
  };
};

export type SignalTriageKind = "feature" | "bug" | "feedback";

export type SignalTriageVerdict = {
  signal: boolean;
  title?: string;
  kind?: SignalTriageKind;
};

const NOT_SIGNAL: SignalTriageVerdict = { signal: false };

// One hint line per conversational provider. The provider changes the prompt,
// never the code path — that is the signal-bus contract: one triage function
// for every channel.
const PROVIDER_HINTS: Partial<Record<SourceProvider, string>> = {
  discord: "discord chat message",
  email: "inbound support email",
  embed: "in-app feedback widget message",
  slack: "slack workspace message",
  support: "support ticket message",
  telegram: "telegram chat message",
  x: "public X (Twitter) mention",
};

type TriageProvider = {
  apiKey: string;
  headers: Record<string, string>;
  model: string;
  url: string;
};

/**
 * Triage LLM provider order: CROF is primary whenever CROF_API_KEY is set
 * (CROF_CLASSIFIER_MODEL, falling back to CROF_MODEL). OpenRouter is used only
 * when CROF_API_KEY is unset and OPENROUTER_API_KEY is present. With neither
 * configured triage fails closed — no provider, no capture.
 */
function getTriageProvider(): TriageProvider | null {
  if (process.env.CROF_API_KEY) {
    const baseUrl = (process.env.CROF_BASE_URL ?? "https://crof.ai/v1").replace(/\/$/, "");
    return {
      apiKey: process.env.CROF_API_KEY,
      headers: {},
      // Use a deliberately cheap classifier model; falls back to the main model.
      model: process.env.CROF_CLASSIFIER_MODEL ?? process.env.CROF_MODEL ?? "kimi-k2.6",
      url: `${baseUrl}/chat/completions`,
    };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        "http-referer": process.env.SITE_URL ?? "http://amend.localhost:1355",
        "x-openrouter-title": "Amend.sh signal triage",
      },
      model: process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
      url: "https://openrouter.ai/api/v1/chat/completions",
    };
  }
  return null;
}

// Extract the first JSON object from a model response — robust to code fences,
// prose, or reasoning text some models prepend/append around the JSON.
export function extractJsonObject(value: string): {
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

// The model is prompted for feature|bug|feedback; anything else (or missing)
// normalizes to "feedback" so downstream labels stay bounded.
function triageKind(value: unknown): SignalTriageKind {
  const kind = optionalString(value);
  return kind === "feature" || kind === "bug" ? kind : "feedback";
}

/**
 * Cheap-model AI judge shared by every conversational channel: is this message
 * genuine product signal worth capturing? Only survivors of channel allowlists
 * (enforced by gateway workers and channelRoutes config) reach here, and only
 * "signal" messages become needs. On any error — missing provider, HTTP
 * failure, timeout (12s abort), or unparseable output — the verdict defaults
 * to NOT signal: never manufacture noise or cost on a bad response.
 */
export async function classifySignalContent(args: {
  body: string;
  provider: SourceProvider;
  hint?: string;
}): Promise<SignalTriageVerdict> {
  const triageProvider = getTriageProvider();
  if (!triageProvider) {
    return NOT_SIGNAL;
  }
  const channelHint = args.hint ?? PROVIDER_HINTS[args.provider] ?? `${args.provider} message`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(triageProvider.url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${triageProvider.apiKey}`,
        "content-type": "application/json",
        ...triageProvider.headers,
      },
      body: JSON.stringify({
        model: triageProvider.model,
        max_tokens: 120,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You triage messages for a product-feedback tool. A message is SIGNAL only when it expresses a feature request, a bug or problem with the product, or concrete product feedback. Greetings, banter, reactions, links, and questions aimed at other people are NOT signal. Reply with compact JSON only — no prose, no code fences.",
          },
          {
            role: "user",
            content: `Channel: ${channelHint}\nMessage: ${JSON.stringify(args.body)}\nReply exactly: {"signal": true|false, "title": "imperative summary, <= 8 words", "kind": "feature|bug|feedback"}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return NOT_SIGNAL;
    }
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content;
    if (!raw) {
      return NOT_SIGNAL;
    }
    const parsed = extractJsonObject(raw);
    if (!parsed) {
      return NOT_SIGNAL;
    }
    return {
      signal: parsed.signal === true,
      title: optionalString(parsed.title),
      kind: triageKind(parsed.kind),
    };
  } catch {
    return NOT_SIGNAL;
  } finally {
    clearTimeout(timeout);
  }
}
