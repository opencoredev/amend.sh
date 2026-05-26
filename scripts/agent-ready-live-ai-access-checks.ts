import { aiAccessUserAgents } from "./agent-ready-policy";
import { fetchText } from "./agent-ready-live-fetch-client";
import type { AddCheck } from "./agent-ready-live-types";

export async function checkAiUserAgentAccess({
  add,
  includes,
  label,
  origin,
  path,
}: {
  add: AddCheck;
  includes: string[];
  label: string;
  origin: string;
  path: string;
}) {
  for (const userAgent of aiAccessUserAgents) {
    const url = `${origin}${path}`;
    try {
      const { body, response } = await fetchText(url, userAgent.value);
      add(
        `${label} ${path} allows ${userAgent.name}`,
        response.ok,
        `${response.status} ${response.statusText}`,
      );
      const finalUrl = new URL(response.url);
      add(
        `${label} ${path} ${userAgent.name} stays on expected origin`,
        finalUrl.origin === origin,
        finalUrl.toString(),
      );
      const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
      add(
        `${label} ${path} ${userAgent.name} x-robots-tag allows indexing`,
        !/\b(?:noindex|none)\b/i.test(xRobotsTag),
        xRobotsTag || "not set",
      );
      for (const expected of includes) {
        add(`${label} ${path} ${userAgent.name} includes ${expected}`, body.includes(expected));
      }
    } catch (error) {
      add(
        `${label} ${path} allows ${userAgent.name}`,
        false,
        error instanceof Error ? error.message : "unknown fetch error",
      );
    }
  }
}
