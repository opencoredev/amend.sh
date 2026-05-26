import { env } from "@amend/env/web";
import type posthog from "posthog-js";

const defaultPostHogHost = "https://us.i.posthog.com";
const defaultPostHogProjectId = "441195";
const defaultPostHogToken = "phc_BCb25jVTo59jtEMPysgGUvgt85bUYGwN8XBNA2oMNLY7";

let initialized = false;
let clientPromise: Promise<typeof posthog> | undefined;

function loadPostHog() {
  clientPromise ??= import("posthog-js").then((module) => module.default);
  return clientPromise;
}

export async function initPostHog() {
  if (initialized || typeof window === "undefined") {
    return initialized;
  }

  const token = env.VITE_POSTHOG_TOKEN ?? defaultPostHogToken;
  if (!token) {
    return false;
  }

  const posthog = await loadPostHog();

  posthog.init(token, {
    api_host: env.VITE_POSTHOG_HOST ?? defaultPostHogHost,
    autocapture: true,
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "identified_only",
    persistence: "localStorage+cookie",
    loaded: (client) => {
      client.register({
        amend_project_id: env.VITE_POSTHOG_PROJECT_ID ?? defaultPostHogProjectId,
        app: "amend-web",
      });
    },
  });

  initialized = true;
  return true;
}

export async function capturePostHogPageview(path: string) {
  if (!(await initPostHog())) {
    return;
  }

  const posthog = await loadPostHog();

  posthog.capture("$pageview", {
    $current_url: window.location.href,
    path,
  });
}
