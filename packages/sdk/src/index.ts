export type AmendClientOptions = {
  apiBaseUrl?: string;
  fetch?: typeof fetch;
  project: string;
  token?: string;
};

export type AmendIdentity = {
  accountId?: string;
  email?: string;
  externalUserId: string;
  name?: string;
  traits?: Record<string, JsonValue>;
};

export type AmendFeedbackInput = {
  authorEmail?: string;
  authorName?: string;
  body: string;
  labels?: string[];
  sourceUrl?: string;
  title: string;
};

export type AmendEventName =
  | "identify"
  | "account_identify"
  | "feedback_submitted"
  | "vote_added"
  | "comment_added"
  | "reaction_added"
  | "roadmap_viewed"
  | "changelog_viewed"
  | "update_seen"
  | "shipped_feature_used";

export type AmendEventInput = {
  accountId?: string;
  event: AmendEventName;
  metadata?: Record<string, JsonValue>;
  updateKey?: string;
  userId?: string;
};

export type AmendAutomationRulesInput = {
  autoDraftChangelog?: boolean;
  autoNotifyUsers?: boolean;
  autoPublishChangelog?: boolean;
  autoUpdateFeedbackStatus?: boolean;
  autoUpdateRoadmapStatus?: boolean;
  byokConfigured?: boolean;
  byokProvider?: string;
  mode?: "manual" | "mostly_auto" | "review_first";
  requireReviewBelowConfidence?: number;
  requireReviewForHighImpact?: boolean;
  requireReviewForPublicCopy?: boolean;
};

export type AmendWorkspaceMemberInput = {
  email: string;
  externalUserId?: string;
  name?: string;
  permissions?: string[];
  role: "admin" | "member" | "owner" | "reviewer" | "viewer";
};

export type AmendIntegrationInput = {
  config?: Record<string, JsonValue>;
  direction: "bidirectional" | "inbound" | "outbound";
  displayName?: string;
  provider: "databuddy" | "discord" | "github" | "linear" | "posthog" | "slack" | "support" | "x";
  state: "attention" | "connected" | "disabled" | "planned";
};

export type AmendPortalSettingsInput = {
  accentColor?: string;
  changelogVisibility?: "private" | "public";
  feedbackMode?: "authenticated" | "closed" | "open";
  headline?: string;
  intro?: string;
  roadmapVisibility?: "private" | "public";
};

export type AmendNotificationPreferenceInput = {
  accountId?: string;
  digestDay?: string;
  digestHour?: number;
  email?: string;
  externalUserId?: string;
  mode: "digest" | "instant" | "muted";
  unsubscribed?: boolean;
};

export type AmendDeliveryPlanInput = {
  channel?: "email" | "in_app" | "slack" | "webhook";
  notificationKey?: string;
  provider?: string;
};

export type AmendDeliverySendInput = {
  channel?: "email" | "in_app" | "slack" | "webhook";
  dryRun?: boolean;
  limit?: number;
};

export type AmendProjectInput = {
  description?: string;
  name: string;
  slug?: string;
  visibility?: "private" | "public";
};

export type AmendRepositoryInput = {
  defaultBranch?: string;
  owner: string;
  projectKey: string;
  repo: string;
  repositoryUrl?: string;
};

export type AmendChangelogDraftInput = {
  body?: string;
  dryRun?: boolean;
  kind?: string;
  sourceLinks?: JsonValue[];
  title: string;
};

export type AmendChangelogEntryInput = {
  body: string;
  category?: "added" | "changed" | "fixed" | "removed" | "security";
  publishedAt?: number;
  scheduledFor?: number;
  stableKey?: string;
  status?: "archived" | "draft" | "in_review" | "published" | "scheduled";
  summary: string;
  tags?: string[];
  title: string;
  version?: string;
};

export type AmendRoadmapItemInput = {
  description: string;
  impact?: string;
  priority?: "P0" | "P1" | "P2" | "P3";
  stableKey?: string;
  status?:
    | "closed"
    | "considering"
    | "in_progress"
    | "paused"
    | "planned"
    | "shipped"
    | "under_review";
  target?: string;
  title: string;
};

export type AmendPlanTier =
  | "enterprise"
  | "free"
  | "open_source"
  | "pro"
  | "scale"
  | "starter"
  | "team";

export type AmendCheckoutInput = {
  cancelUrl?: string;
  customerEmail?: string;
  dryRun?: boolean;
  seats?: number;
  successUrl?: string;
  tier: Exclude<AmendPlanTier, "enterprise" | "free" | "open_source">;
};

export type JsonValue =
  | boolean
  | null
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

type RequestOptions = {
  body?: unknown;
  method?: "GET" | "POST";
  search?: Record<string, string | undefined>;
};

export class Amend {
  readonly apiBaseUrl: string;
  readonly project: string;

  private readonly fetchImpl: typeof fetch;
  private readonly token?: string;

  constructor(options: AmendClientOptions) {
    this.project = options.project;
    this.token = options.token;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.apiBaseUrl = normalizeApiBaseUrl(options.apiBaseUrl ?? "/api/v1");
  }

  async identify(identity: AmendIdentity) {
    return await this.request("identity", {
      method: "POST",
      body: { identity },
    });
  }

  async identifyAccount(accountId: string, traits?: Record<string, JsonValue>) {
    return await this.track({
      accountId,
      event: "account_identify",
      metadata: traits,
    });
  }

  async submitRequest(input: AmendFeedbackInput) {
    return await this.request("feedback", {
      method: "POST",
      body: input,
    });
  }

  async vote(requestKey: string, userId?: string) {
    return await this.request("interactions", {
      method: "POST",
      body: {
        feedbackKey: requestKey,
        kind: "vote",
        externalUserId: userId,
      },
    });
  }

  async comment(requestKey: string, body: string, userId?: string) {
    return await this.request("interactions", {
      method: "POST",
      body: {
        body,
        feedbackKey: requestKey,
        kind: "comment",
        externalUserId: userId,
      },
    });
  }

  async react(requestKey: string, reaction: string, userId?: string) {
    return await this.request("interactions", {
      method: "POST",
      body: {
        feedbackKey: requestKey,
        kind: "reaction",
        reaction,
        externalUserId: userId,
      },
    });
  }

  async roadmap(status?: string) {
    const portal = await this.portal(status ? { roadmapStatus: status } : undefined);
    return portal.roadmap;
  }

  async changelog() {
    const portal = await this.portal();
    return portal.changelog;
  }

  async updateStatus(updateKey: string) {
    const portal = await this.portal();
    return {
      changelog: portal.changelog.find((entry: any) => entry.stableKey === updateKey),
      roadmap: portal.roadmap.find((item: any) => item.stableKey === updateKey),
    };
  }

  async markUpdateSeen(updateKey: string, userId?: string) {
    return await this.track({
      event: "update_seen",
      updateKey,
      userId,
    });
  }

  async trackShippedFeature(
    updateKey: string,
    userId?: string,
    metadata?: Record<string, JsonValue>,
  ) {
    return await this.track({
      event: "shipped_feature_used",
      metadata,
      updateKey,
      userId,
    });
  }

  async updatesForUser(userId: string) {
    return await this.request("updates", {
      search: { externalUserId: userId },
    });
  }

  async updatesForContact(input: { email?: string; userId?: string }) {
    return await this.request("updates", {
      search: {
        email: input.email,
        externalUserId: input.userId,
      },
    });
  }

  async portal(search?: { roadmapStatus?: string }) {
    return await this.request("portal", {
      search,
    });
  }

  async settings() {
    return await this.request("settings");
  }

  async projects() {
    const response = await this.request("projects");
    return response.projects;
  }

  async githubApp() {
    return await this.request("github-app");
  }

  async createProject(input: AmendProjectInput) {
    return await this.request("projects", {
      method: "POST",
      body: input,
    });
  }

  async connectRepository(input: AmendRepositoryInput) {
    return await this.request("repositories", {
      method: "POST",
      body: input,
    });
  }

  async draftChangelog(input: AmendChangelogDraftInput) {
    return await this.request("drafts", {
      method: "POST",
      body: input,
    });
  }

  async upsertChangelog(input: AmendChangelogEntryInput) {
    return await this.request("changelog", {
      method: "POST",
      body: input,
    });
  }

  async upsertRoadmapItem(input: AmendRoadmapItemInput) {
    return await this.request("roadmap", {
      method: "POST",
      body: input,
    });
  }

  async plans() {
    return await this.request("plans");
  }

  async updatePlan(tier: AmendPlanTier, seats?: number) {
    return await this.request("plans", {
      method: "POST",
      body: { seats, tier },
    });
  }

  async createCheckoutSession(input: AmendCheckoutInput) {
    return await this.request("checkout", {
      method: "POST",
      body: input,
    });
  }

  async automationDecisions() {
    const response = await this.request("decisions");
    return response.decisions;
  }

  async deliveryOutbox() {
    const response = await this.request("deliveries");
    return response.deliveries;
  }

  async updateAutomationRules(input: AmendAutomationRulesInput) {
    return await this.request("rules", {
      method: "POST",
      body: input,
    });
  }

  async upsertWorkspaceMember(input: AmendWorkspaceMemberInput) {
    return await this.request("members", {
      method: "POST",
      body: input,
    });
  }

  async upsertIntegration(input: AmendIntegrationInput) {
    return await this.request("integrations", {
      method: "POST",
      body: input,
    });
  }

  async updatePortalSettings(input: AmendPortalSettingsInput) {
    return await this.request("portal-settings", {
      method: "POST",
      body: input,
    });
  }

  async setNotificationPreference(input: AmendNotificationPreferenceInput) {
    return await this.request("preferences", {
      method: "POST",
      body: input,
    });
  }

  async unsubscribe(input: { email?: string; userId?: string }) {
    return await this.setNotificationPreference({
      email: input.email,
      externalUserId: input.userId,
      mode: "muted",
      unsubscribed: true,
    });
  }

  async planDeliveries(input: AmendDeliveryPlanInput = {}) {
    return await this.request("deliveries", {
      method: "POST",
      body: input,
    });
  }

  async sendDeliveries(input: AmendDeliverySendInput = {}) {
    return await this.request("deliveries", {
      method: "POST",
      body: { ...input, action: "send" },
    });
  }

  async registerCustomDomain(domain: string, purpose: "api" | "embed" | "portal" = "portal") {
    return await this.request("domains", {
      method: "POST",
      body: { domain, purpose },
    });
  }

  async verifyCustomDomain(domain: string) {
    return await this.request("domains", {
      method: "POST",
      body: { action: "verify", domain },
    });
  }

  async resolveCustomDomain(domain: string, purpose?: "api" | "embed" | "portal") {
    const url = new URL(`${this.apiBaseUrl}/_/domains`, "http://amend.local");
    url.searchParams.set("domain", domain);
    if (purpose) {
      url.searchParams.set("purpose", purpose);
    }
    const response = await this.fetchImpl(stripLocalOrigin(url), {
      headers: {
        Accept: "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      method: "GET",
    });
    const payload = await parseJsonResponse(response);
    if (!response.ok) {
      throw new AmendApiError(response.status, payload);
    }
    return payload;
  }

  async track(event: AmendEventInput) {
    return await this.request("events", {
      method: "POST",
      body: event,
    });
  }

  private async request(path: string, options: RequestOptions = {}) {
    const method = options.method ?? "GET";
    const url = new URL(`${this.apiBaseUrl}/${this.project}/${path}`, "http://amend.local");

    for (const [key, value] of Object.entries(options.search ?? {})) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    const response = await this.fetchImpl(stripLocalOrigin(url), {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      method,
    });

    const payload = await parseJsonResponse(response);
    if (!response.ok) {
      throw new AmendApiError(response.status, payload);
    }
    return payload;
  }
}

export class AmendApiError extends Error {
  constructor(
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(`Amend API request failed with status ${status}`);
  }
}

function normalizeApiBaseUrl(apiBaseUrl: string) {
  return apiBaseUrl.replace(/\/+$/, "");
}

function stripLocalOrigin(url: URL) {
  if (url.origin === "http://amend.local") {
    return `${url.pathname}${url.search}`;
  }
  return url.toString();
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export { createAmendPanel } from "./embed";
