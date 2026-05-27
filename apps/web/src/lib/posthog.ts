import { env } from "@amend/env/web";
import type posthog from "posthog-js";
import type { PostHogConfig } from "posthog-js";

const defaultPostHogHost = "https://us.i.posthog.com";
const defaultPostHogProjectId = "441195";
const defaultPostHogToken = "phc_BCb25jVTo59jtEMPysgGUvgt85bUYGwN8XBNA2oMNLY7";

let initialized = false;
let clientPromise: Promise<typeof posthog> | undefined;

export type PostHogEventName =
  | "project_created"
  | "project_source_connected"
  | "sign_in_failed"
  | "sign_in_submitted"
  | "sign_up_failed"
  | "sign_up_submitted"
  | "user_signed_in"
  | "user_signed_out"
  | "user_signed_up";

type PostHogEventProperties = Record<string, boolean | number | string | null | undefined>;

type PostHogIdentity = {
  email?: string;
  name?: string;
  userId?: string;
};

const postHogEventNames: Record<PostHogEventName, string> = {
  project_created: "project created",
  project_source_connected: "project source connected",
  sign_in_failed: "sign in failed",
  sign_in_submitted: "sign in submitted",
  sign_up_failed: "sign up failed",
  sign_up_submitted: "sign up submitted",
  user_signed_in: "user signed in",
  user_signed_out: "user signed out",
  user_signed_up: "user signed up",
};

function loadPostHog() {
  clientPromise ??= import("posthog-js").then((module) => module.default);
  return clientPromise;
}

export function getPostHogToken() {
  return env.VITE_POSTHOG_TOKEN ?? defaultPostHogToken;
}

export function getPostHogOptions(): Partial<PostHogConfig> {
  return {
    api_host: env.VITE_POSTHOG_HOST ?? defaultPostHogHost,
    autocapture: true,
    capture_exceptions: true,
    capture_pageleave: true,
    capture_pageview: false,
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    persistence: "localStorage+cookie",
    loaded: (client) => {
      client.register({
        amend_project_id: env.VITE_POSTHOG_PROJECT_ID ?? defaultPostHogProjectId,
        app: "amend-web",
      });
    },
  };
}

export async function initPostHog() {
  if (initialized || typeof window === "undefined") {
    return initialized;
  }

  const token = getPostHogToken();
  if (!token) {
    return false;
  }

  const posthog = await loadPostHog();

  posthog.init(token, getPostHogOptions());

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

export async function capturePostHogEvent(
  event: PostHogEventName,
  properties: PostHogEventProperties = {},
) {
  if (!(await initPostHog())) {
    return;
  }

  const posthog = await loadPostHog();
  posthog.capture(postHogEventNames[event], cleanProperties(properties));
}

export async function identifyAndCapturePostHogEvent({
  event,
  identity,
  properties = {},
}: {
  event: PostHogEventName;
  identity: PostHogIdentity;
  properties?: PostHogEventProperties;
}) {
  if (!(await initPostHog())) {
    return;
  }

  const posthog = await loadPostHog();
  const distinctId = identity.userId ?? identity.email;
  if (distinctId) {
    posthog.identify(distinctId, cleanProperties({ email: identity.email, name: identity.name }));
  }

  posthog.capture(postHogEventNames[event], cleanProperties(properties));
}

function cleanProperties(properties: PostHogEventProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(
      (entry): entry is [string, boolean | number | string | null] => {
        return entry[1] !== undefined;
      },
    ),
  );
}
