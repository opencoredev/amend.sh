import { expect, test } from "bun:test";
import { aiAccessUserAgents, aiCrawlerNames } from "./agent-ready-policy";
import {
  productionEnvChecks,
  requiredProductionEnv,
  webProductionEnvKeys,
} from "./agent-ready-production-env";

export function registerAgentReadyCoreTests() {
  test("shared crawler policy covers every named agent once", () => {
    const expectedCrawlerNames = [
      "GPTBot",
      "ChatGPT-User",
      "OAI-SearchBot",
      "ClaudeBot",
      "Claude-User",
      "Claude-SearchBot",
      "PerplexityBot",
      "Perplexity-User",
      "Googlebot",
      "Google-Extended",
      "Bingbot",
      "CCBot",
    ];
    const accessAgentNames = aiAccessUserAgents.map((agent) => agent.name);

    expect(aiCrawlerNames).toEqual(expectedCrawlerNames);
    expect(new Set(aiCrawlerNames).size).toBe(aiCrawlerNames.length);
    expect(accessAgentNames.toSorted()).toEqual([...aiCrawlerNames].toSorted());
    for (const agent of aiAccessUserAgents) {
      expect(agent.value.toLowerCase()).toContain(agent.name.toLowerCase());
    }
  });

  test("shared production env contract covers every launch key once", () => {
    const expectedProductionEnv = [
      "VITE_CONVEX_URL",
      "VITE_CONVEX_SITE_URL",
      "VITE_DOCS_URL",
      "SITE_URL",
      "BETTER_AUTH_SECRET",
      "GITHUB_WEBHOOK_SECRET",
      "GITHUB_APP_ID",
      "GITHUB_APP_SLUG",
      "GITHUB_APP_CLIENT_ID",
      "GITHUB_APP_CLIENT_SECRET",
      "GITHUB_APP_PRIVATE_KEY",
      "AMEND_API_TOKEN",
      "OPENAI_API_KEY",
      "OPENAI_MODEL",
      "CROF_API_KEY",
      "CROF_MODEL",
      "CROF_BASE_URL",
      "RESEND_API_KEY",
      "EMAIL_FROM",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ];
    const envKeys = productionEnvChecks.map(([key]) => key);

    expect(requiredProductionEnv).toEqual(expectedProductionEnv);
    expect(envKeys).toEqual(expectedProductionEnv);
    expect(new Set(requiredProductionEnv).size).toBe(requiredProductionEnv.length);
    expect(new Set(envKeys).size).toBe(envKeys.length);
    expect([...webProductionEnvKeys]).toEqual([
      "VITE_CONVEX_URL",
      "VITE_CONVEX_SITE_URL",
      "VITE_DOCS_URL",
    ]);
    expect([...webProductionEnvKeys].every((key) => requiredProductionEnv.includes(key))).toBe(
      true,
    );
    for (const [, purpose] of productionEnvChecks) {
      expect(purpose.length).toBeGreaterThan(0);
    }
  });
}
