import { normalizeAgentDecisions } from "./amendAgentDecisionNormalizer";
import { fallbackAgentDecisions } from "./amendAgentFallback";
import type { AgentContext } from "./amendAgentTypes";

declare const process: {
  env: {
    CROF_API_KEY?: string;
    CROF_BASE_URL?: string;
    CROF_MODEL?: string;
  };
};

export async function callCrofAgent(context: AgentContext) {
  const apiKey = process.env.CROF_API_KEY;
  if (!apiKey) {
    return {
      decisions: fallbackAgentDecisions(context),
      provider: "fallback",
      providerConfigured: false,
    };
  }

  const baseUrl = process.env.CROF_BASE_URL ?? "https://crof.ai/v1";
  const model = process.env.CROF_MODEL ?? "kimi-k2.6";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are Amend's proactive product-update agent. Return compact JSON only with a decisions array. Keep public copy reviewable. Do not invent source links.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Decide what Amend should do next from channel events, source evidence, feedback, roadmap, changelog, and automation rules.",
              outputShape: {
                decisions: [
                  {
                    action:
                      "link_signal_to_source | draft_changelog | update_roadmap_status | update_feedback_status | notify_users",
                    confidence: "0..1",
                    needsReview: true,
                    outcome: "applied | queued_for_review | skipped",
                    sourceEventExternalIds: ["external ids from context only"],
                    summary: "source-linked decision summary",
                    targetKey: "existing or proposed stable key",
                    targetKind: "source | feedback | roadmap | changelog | notification",
                  },
                ],
              },
              context,
            }),
          },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return {
        decisions: fallbackAgentDecisions(context),
        error: `provider_${response.status}`,
        provider: model,
        providerConfigured: true,
      };
    }
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return {
        decisions: fallbackAgentDecisions(context),
        error: "empty_provider_response",
        provider: model,
        providerConfigured: true,
      };
    }
    try {
      return {
        decisions: normalizeAgentDecisions(JSON.parse(content), context),
        provider: model,
        providerConfigured: true,
      };
    } catch {
      return {
        decisions: fallbackAgentDecisions(context),
        error: "invalid_provider_json",
        provider: model,
        providerConfigured: true,
      };
    }
  } catch (error) {
    return {
      decisions: fallbackAgentDecisions(context),
      error: error instanceof Error ? error.name : "provider_error",
      provider: model,
      providerConfigured: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}
