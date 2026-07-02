import { optionalString, record } from "./httpRuntimeScalars";

declare const process: {
  env: {
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
  };
};

export async function draftChangelogCopy(input: {
  body?: string;
  dryRun: boolean;
  kind: string;
  sourceLinks: unknown[];
  title: string;
}) {
  if (input.dryRun || !process.env.OPENAI_API_KEY) {
    return {
      body: `Amend detected shipped ${input.kind} work and prepared this source-linked update for review: ${input.title}`,
      model: "dry-run",
      provider: "dry-run",
      sourceCount: input.sourceLinks.length,
      summary: `Drafted from ${input.kind} source evidence.`,
      title: input.title,
    };
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-5.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [
        {
          content: [
            {
              text: JSON.stringify({
                body: input.body,
                kind: input.kind,
                sourceLinks: input.sourceLinks,
                title: input.title,
              }),
              type: "input_text",
            },
          ],
          role: "user",
        },
      ],
      instructions:
        "You write concise source-linked product changelog drafts for Amend.sh. Return only JSON with title, summary, and body. Keep public claims tied to the provided source evidence.",
      model,
    }),
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      body: `Amend could not reach the configured AI provider, so it preserved the source-linked draft for review: ${input.title}`,
      error: String(
        optionalString(record(record(payload)?.error)?.message) ??
          `OpenAI returned ${response.status}`,
      ),
      model,
      provider: "openai",
      sourceCount: input.sourceLinks.length,
      summary: "AI provider call failed; fallback draft created.",
      title: input.title,
    };
  }

  const outputText = responseOutputText(payload);
  const parsed = parseDraftJson(outputText);
  return {
    body: parsed.body ?? outputText,
    model,
    provider: "openai",
    sourceCount: input.sourceLinks.length,
    summary: parsed.summary ?? "AI-drafted source-linked changelog entry.",
    title: parsed.title ?? input.title,
  };
}

function responseOutputText(payload: unknown) {
  const output = record(payload)?.output;
  if (!Array.isArray(output)) {
    return "";
  }
  return output
    .flatMap((item) => {
      const content = record(item)?.content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => optionalString(record(content)?.text))
    .filter((text): text is string => Boolean(text))
    .join("\n")
    .trim();
}

function parseDraftJson(value: string) {
  try {
    const parsed = record(JSON.parse(value));
    return {
      body: optionalString(parsed?.body),
      summary: optionalString(parsed?.summary),
      title: optionalString(parsed?.title),
    };
  } catch {
    return {};
  }
}
