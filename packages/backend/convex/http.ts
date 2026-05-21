import { httpRouter } from "convex/server";

import { api, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { authComponent, createAuth } from "./auth";
import { verifyGitHubWebhookSignature, verifyStripeWebhookSignature } from "./signatures";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

declare const process: {
  env: {
    AMEND_API_TOKEN?: string;
    EMAIL_FROM?: string;
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
    GITHUB_APP_CLIENT_ID?: string;
    GITHUB_APP_CLIENT_SECRET?: string;
    GITHUB_APP_ID?: string;
    GITHUB_APP_PRIVATE_KEY?: string;
    GITHUB_APP_SLUG?: string;
    GITHUB_WEBHOOK_SECRET?: string;
    RESEND_API_KEY?: string;
    SITE_URL?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
  };
};

const restGet = httpAction(async (ctx, request) => {
  const route = restRoute(request);
  if (!route) {
    return json({ error: "Not found" }, 404);
  }

  const { resource, workspaceSlug } = route;
  const search = new URL(request.url).searchParams;

  if (workspaceSlug === "_" && resource === "domains") {
    const domain = requiredString(search.get("domain"), "domain");
    const purpose = optionalString(search.get("purpose"));
    const data = await ctx.runQuery(api.amend.resolveCustomDomain, {
      domain,
      ...(purpose ? { purpose: domainPurpose(purpose) } : {}),
    });
    return json(data, data.resolved ? 200 : 404);
  }

  if (resource === "portal") {
    const roadmapStatus = normalizedRoadmapStatus(search.get("roadmapStatus"));
    const data = await ctx.runQuery(api.amend.getPublicPortal, {
      workspaceSlug,
      ...(roadmapStatus ? { roadmapStatus } : {}),
    });
    return json(data);
  }

  if (resource === "roadmap") {
    const roadmapStatus = normalizedRoadmapStatus(search.get("status"));
    const data = await ctx.runQuery(api.amend.getPublicPortal, {
      workspaceSlug,
      ...(roadmapStatus ? { roadmapStatus } : {}),
    });
    await ctx.runMutation(api.amend.trackEvent, {
      workspaceSlug,
      event: "roadmap_viewed",
      source: "rest",
    });
    return json({ roadmap: data.roadmap });
  }

  if (resource === "changelog") {
    const data = await ctx.runQuery(api.amend.getPublicPortal, { workspaceSlug });
    await ctx.runMutation(api.amend.trackEvent, {
      workspaceSlug,
      event: "changelog_viewed",
      source: "rest",
    });
    return json({ changelog: data.changelog });
  }

  if (resource === "updates") {
    const externalUserId =
      optionalString(search.get("externalUserId")) ?? optionalString(search.get("userId"));
    const email = optionalString(search.get("email"));
    const [portal, userUpdates] = await Promise.all([
      ctx.runQuery(api.amend.getPublicPortal, { workspaceSlug }),
      externalUserId || email
        ? ctx.runQuery(api.amend.getUserUpdates, {
            workspaceSlug,
            ...(externalUserId ? { externalUserId } : {}),
            ...(email ? { email } : {}),
          })
        : ctx
            .runQuery(api.amend.getNotificationCenter, { workspaceSlug })
            .then((notifications) => ({
              notifications,
              seenUpdateKeys: [],
              user: null,
            })),
    ]);
    return json({
      changelog: portal.changelog,
      notifications: userUpdates.notifications,
      roadmap: portal.roadmap,
      seenUpdateKeys: userUpdates.seenUpdateKeys,
      user: userUpdates.user,
    });
  }

  if (resource === "decisions") {
    const decisions = await ctx.runQuery(internal.amend.getAutomationDecisionsForApi, {
      workspaceSlug,
    });
    return json({ decisions });
  }

  if (resource === "deliveries") {
    const deliveries = await ctx.runQuery(internal.amend.getDeliveryOutboxForApi, {
      workspaceSlug,
    });
    return json({ deliveries });
  }

  if (resource === "settings") {
    const data = await ctx.runQuery(internal.amend.getWorkspaceSettingsForApi, { workspaceSlug });
    return json(data);
  }

  if (resource === "projects") {
    const projects = await ctx.runQuery(internal.amend.getProjectsForApi, { workspaceSlug });
    return json({ projects });
  }

  if (resource === "plans") {
    const plans = await ctx.runQuery(api.amend.getPlanCatalog, { workspaceSlug });
    return json(plans);
  }

  if (resource === "github-app") {
    return json(githubAppInstallInfo(workspaceSlug));
  }

  return json({ error: `Unknown resource '${resource}'` }, 404);
});

const restPost = httpAction(async (ctx, request) => {
  const route = restRoute(request);
  if (!route) {
    return json({ error: "Not found" }, 404);
  }

  const rawBody = await request.text();
  const body = readBody(rawBody);
  const { resource, workspaceSlug } = route;

  if (resource === "stripe") {
    const signature = await verifyStripeSignature(request, rawBody);
    if (!signature.ok) {
      return json({ error: signature.error }, 401);
    }

    const result = await handleStripeWebhook(ctx, workspaceSlug, body);
    return json(result);
  }

  if (requiresApiToken(resource, body)) {
    const auth = verifyApiToken(request);
    if (!auth.ok) {
      return json({ error: auth.error }, 401);
    }
  }

  if (resource === "feedback") {
    const result = await ctx.runMutation(api.amend.createFeedback, {
      workspaceSlug,
      authorEmail: optionalString(body.authorEmail),
      authorName: optionalString(body.authorName),
      body: requiredString(body.body, "body"),
      labels: stringArray(body.labels),
      sourceUrl: optionalString(body.sourceUrl),
      title: requiredString(body.title, "title"),
    });
    await ctx.runMutation(api.amend.trackEvent, {
      workspaceSlug,
      event: "feedback_submitted",
      metadata: { stableKey: result.stableKey },
      source: "rest",
    });
    return json(result, 201);
  }

  if (resource === "interactions") {
    const result = await ctx.runMutation(api.amend.recordFeedbackInteraction, {
      workspaceSlug,
      body: optionalString(body.body),
      email: optionalString(body.email),
      externalUserId: optionalString(body.externalUserId) ?? optionalString(body.userId),
      feedbackKey:
        optionalString(body.feedbackKey) ??
        optionalString(body.requestKey) ??
        requiredString(body.updateKey, "feedbackKey"),
      kind: feedbackInteractionKind(body.kind),
      reaction: optionalString(body.reaction),
      source: "rest",
    });
    return json(result, 201);
  }

  if (resource === "identity") {
    const identity = record(body.identity) ?? body;
    const result = await ctx.runMutation(api.amend.identifyExternalUser, {
      workspaceSlug,
      accountId: optionalString(identity.accountId),
      email: optionalString(identity.email),
      externalUserId: requiredString(identity.externalUserId, "externalUserId"),
      name: optionalString(identity.name),
      traits: identity.traits,
    });
    return json(result);
  }

  if (resource === "events") {
    const result = await ctx.runMutation(api.amend.trackEvent, {
      workspaceSlug,
      accountId: optionalString(body.accountId),
      event: eventName(body.event),
      externalUserId: optionalString(body.externalUserId) ?? optionalString(body.userId),
      metadata: body.metadata,
      source: "rest",
      updateKey: optionalString(body.updateKey),
    });
    return json(result, 201);
  }

  if (resource === "github") {
    const signature = await verifyGitHubSignature(request, rawBody);
    if (!signature.ok) {
      return json({ error: signature.error }, 401);
    }

    const result = await ctx.runMutation(api.amend.ingestSourceEvent, {
      workspaceSlug,
      ...githubSourceEvent(request, body),
    });
    return json(result, 202);
  }

  if (resource === "drafts") {
    const result = await draftChangelogCopy({
      body: optionalString(body.body),
      dryRun: optionalBoolean(body.dryRun) ?? false,
      kind: optionalString(body.kind) ?? "source",
      sourceLinks: Array.isArray(body.sourceLinks) ? body.sourceLinks : [],
      title: requiredString(body.title, "title"),
    });
    return json(result, 201);
  }

  if (resource === "rules") {
    const result = await ctx.runMutation(api.amend.updateAutomationRules, {
      workspaceSlug,
      autoDraftChangelog: optionalBoolean(body.autoDraftChangelog),
      autoNotifyUsers: optionalBoolean(body.autoNotifyUsers),
      autoPublishChangelog: optionalBoolean(body.autoPublishChangelog),
      autoUpdateFeedbackStatus: optionalBoolean(body.autoUpdateFeedbackStatus),
      autoUpdateRoadmapStatus: optionalBoolean(body.autoUpdateRoadmapStatus),
      byokConfigured: optionalBoolean(body.byokConfigured),
      byokProvider: optionalString(body.byokProvider),
      mode: automationMode(body.mode),
      requireReviewBelowConfidence: numberValue(body.requireReviewBelowConfidence),
      requireReviewForHighImpact: optionalBoolean(body.requireReviewForHighImpact),
      requireReviewForPublicCopy: optionalBoolean(body.requireReviewForPublicCopy),
    });
    return json(result);
  }

  if (resource === "members") {
    const result = await ctx.runMutation(api.amend.upsertWorkspaceMember, {
      workspaceSlug,
      email: requiredString(body.email, "email"),
      externalUserId: optionalString(body.externalUserId) ?? optionalString(body.userId),
      name: optionalString(body.name),
      permissions: stringArray(body.permissions),
      role: memberRole(body.role),
    });
    return json(result);
  }

  if (resource === "integrations") {
    const result = await ctx.runMutation(api.amend.upsertIntegrationConnection, {
      workspaceSlug,
      config: body.config,
      direction: integrationDirection(body.direction),
      displayName: optionalString(body.displayName),
      provider: integrationProvider(body.provider),
      state: integrationState(body.state),
    });
    return json(result);
  }

  if (resource === "portal-settings") {
    const result = await ctx.runMutation(api.amend.updatePortalSettings, {
      workspaceSlug,
      accentColor: optionalString(body.accentColor),
      changelogVisibility: portalVisibility(body.changelogVisibility),
      feedbackMode: portalFeedbackMode(body.feedbackMode),
      headline: optionalString(body.headline),
      intro: optionalString(body.intro),
      roadmapVisibility: portalVisibility(body.roadmapVisibility),
    });
    return json(result);
  }

  if (resource === "changelog") {
    const result = await ctx.runMutation(api.amend.upsertChangelogEntry, {
      workspaceSlug,
      body: requiredString(body.body, "body"),
      category: changelogCategory(body.category),
      publishedAt: numberValue(body.publishedAt),
      scheduledFor: numberValue(body.scheduledFor),
      stableKey: optionalString(body.stableKey),
      status: changelogStatus(body.status),
      summary: requiredString(body.summary, "summary"),
      tags: stringArray(body.tags),
      title: requiredString(body.title, "title"),
      version: optionalString(body.version),
    });
    return json(result, 201);
  }

  if (resource === "roadmap") {
    const result = await ctx.runMutation(api.amend.upsertRoadmapItem, {
      workspaceSlug,
      description: requiredString(body.description, "description"),
      impact: optionalString(body.impact),
      priority: roadmapPriority(body.priority),
      stableKey: optionalString(body.stableKey),
      status: normalizedRoadmapStatus(optionalString(body.status) ?? null),
      target: optionalString(body.target),
      title: requiredString(body.title, "title"),
    });
    return json(result, 201);
  }

  if (resource === "projects") {
    const result = await ctx.runMutation(api.amend.createProject, {
      workspaceSlug,
      description: optionalString(body.description),
      name: requiredString(body.name, "name"),
      slug: optionalString(body.slug),
      visibility: projectVisibility(body.visibility),
    });
    return json(result, 201);
  }

  if (resource === "checkout") {
    const tier = planTier(body.tier);
    const checkoutPlan = stripeCheckoutPlan(tier);
    if (!checkoutPlan) {
      return json({ error: "tier must be a paid self-serve Amend plan" }, 400);
    }

    const result = await createStripeCheckoutSession({
      cancelUrl: optionalString(body.cancelUrl),
      customerEmail: optionalString(body.customerEmail),
      dryRun: optionalBoolean(body.dryRun) ?? false,
      seats: numberValue(body.seats) ?? 1,
      successUrl: optionalString(body.successUrl),
      tier: checkoutPlan.tier,
      workspaceSlug,
    });
    return json(result, result.provider === "stripe" ? 201 : 200);
  }

  if (resource === "plans") {
    const result = await ctx.runMutation(api.amend.updatePlan, {
      workspaceSlug,
      seats: numberValue(body.seats),
      tier: planTier(body.tier),
    });
    return json(result);
  }

  if (resource === "repositories") {
    const result = await ctx.runMutation(api.amend.connectProjectRepository, {
      workspaceSlug,
      defaultBranch: optionalString(body.defaultBranch),
      owner: requiredString(body.owner, "owner"),
      projectKey: requiredString(body.projectKey, "projectKey"),
      repo: requiredString(body.repo, "repo"),
      repositoryUrl: optionalString(body.repositoryUrl),
    });
    return json(result, 201);
  }

  if (resource === "preferences") {
    const result = await ctx.runMutation(api.amend.upsertNotificationPreference, {
      workspaceSlug,
      accountId: optionalString(body.accountId),
      digestDay: optionalString(body.digestDay),
      digestHour: numberValue(body.digestHour),
      email: optionalString(body.email),
      externalUserId: optionalString(body.externalUserId) ?? optionalString(body.userId),
      mode: notificationMode(body.mode),
      unsubscribed: optionalBoolean(body.unsubscribed),
    });
    return json(result);
  }

  if (resource === "domains") {
    if (body.action === "verify") {
      const domain = requiredString(body.domain, "domain");
      const settings = await ctx.runQuery(internal.amend.getWorkspaceSettingsForApi, {
        workspaceSlug,
      });
      const customDomain = settings.customDomains.find((item: any) => item.domain === domain);
      if (!customDomain) {
        return json({ error: "Custom domain not found" }, 404);
      }
      const verified = await verifyDomainTxt(domain, customDomain.verificationToken);
      const result = await ctx.runMutation(api.amend.updateCustomDomainStatus, {
        domain,
        status: verified ? "verified" : "failed",
      });
      return json({
        ...result,
        expectedTxt: customDomain.verificationToken,
        verified,
      });
    }

    const result = await ctx.runMutation(api.amend.registerCustomDomain, {
      workspaceSlug,
      domain: requiredString(body.domain, "domain"),
      purpose: domainPurpose(body.purpose),
    });
    return json(result, 201);
  }

  if (resource === "deliveries") {
    if (body.action === "send") {
      const deliveries = await ctx.runQuery(internal.amend.getDeliveryOutboxForApi, {
        workspaceSlug,
      });
      const result = await sendQueuedDeliveries(
        deliveries,
        async (deliveryId, patch) =>
          await ctx.runMutation(api.amend.updateDeliveryStatus, {
            deliveryId,
            ...patch,
          }),
        {
          channel: deliveryChannel(body.channel),
          dryRun: optionalBoolean(body.dryRun) ?? false,
          limit: numberValue(body.limit) ?? 25,
        },
      );
      return json(result);
    }

    const result = await ctx.runMutation(api.amend.planNotificationDeliveries, {
      workspaceSlug,
      channel: deliveryChannel(body.channel),
      notificationKey: optionalString(body.notificationKey),
      provider: optionalString(body.provider),
    });
    return json(result, 201);
  }

  return json({ error: `Unknown resource '${resource}'` }, 404);
});

const restOptions = httpAction(async () => {
  return new Response(null, {
    headers: corsHeaders(),
    status: 204,
  });
});

http.route({ method: "GET", pathPrefix: "/api/v1/", handler: restGet });
http.route({ method: "POST", pathPrefix: "/api/v1/", handler: restPost });
http.route({ method: "OPTIONS", pathPrefix: "/api/v1/", handler: restOptions });

export default http;

type RestRoute = {
  resource: string;
  workspaceSlug: string;
};

const roadmapStatuses = new Set([
  "considering",
  "under_review",
  "planned",
  "in_progress",
  "shipped",
  "closed",
  "paused",
]);
const protectedPostResources = new Set([
  "changelog",
  "deliveries",
  "domains",
  "drafts",
  "checkout",
  "integrations",
  "members",
  "plans",
  "projects",
  "portal-settings",
  "repositories",
  "roadmap",
  "rules",
]);
const eventNames = new Set([
  "identify",
  "account_identify",
  "feedback_submitted",
  "vote_added",
  "comment_added",
  "reaction_added",
  "roadmap_viewed",
  "changelog_viewed",
  "update_seen",
  "shipped_feature_used",
]);

function restRoute(request: Request): RestRoute | null {
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "api" || parts[1] !== "v1" || !parts[2] || !parts[3]) {
    return null;
  }
  return {
    workspaceSlug: decodeURIComponent(parts[2]),
    resource: parts[3],
  };
}

function readBody(rawBody: string): Record<string, any> {
  try {
    const payload = JSON.parse(rawBody);
    return record(payload) ?? {};
  } catch {
    return {};
  }
}

function githubAppInstallInfo(workspaceSlug: string) {
  const appId = optionalString(process.env.GITHUB_APP_ID);
  const appSlug = optionalString(process.env.GITHUB_APP_SLUG);
  const clientId = optionalString(process.env.GITHUB_APP_CLIENT_ID);
  const state = encodeURIComponent(JSON.stringify({ source: "amend", workspaceSlug }));

  return {
    appId,
    clientId,
    configured: Boolean(
      appId &&
      appSlug &&
      clientId &&
      process.env.GITHUB_APP_CLIENT_SECRET &&
      process.env.GITHUB_APP_PRIVATE_KEY &&
      process.env.GITHUB_WEBHOOK_SECRET,
    ),
    installUrl: appSlug
      ? `https://github.com/apps/${encodeURIComponent(appSlug)}/installations/new?state=${state}`
      : undefined,
    missing: [
      appId ? undefined : "GITHUB_APP_ID",
      appSlug ? undefined : "GITHUB_APP_SLUG",
      clientId ? undefined : "GITHUB_APP_CLIENT_ID",
      process.env.GITHUB_APP_CLIENT_SECRET ? undefined : "GITHUB_APP_CLIENT_SECRET",
      process.env.GITHUB_APP_PRIVATE_KEY ? undefined : "GITHUB_APP_PRIVATE_KEY",
      process.env.GITHUB_WEBHOOK_SECRET ? undefined : "GITHUB_WEBHOOK_SECRET",
    ].filter((item): item is string => Boolean(item)),
    workspaceSlug,
  };
}

function requiresApiToken(resource: string, body: Record<string, any>) {
  if (!process.env.AMEND_API_TOKEN) {
    return false;
  }
  if (protectedPostResources.has(resource)) {
    return true;
  }
  if (resource === "preferences" && body.unsubscribed !== true) {
    return true;
  }
  return false;
}

function verifyApiToken(request: Request) {
  const expected = process.env.AMEND_API_TOKEN;
  if (!expected) {
    return { ok: true as const };
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return { error: "Missing Amend API token", ok: false as const };
  }

  const actual = header.slice("Bearer ".length);
  return timingSafeEqualText(actual, expected)
    ? { ok: true as const }
    : { error: "Invalid Amend API token", ok: false as const };
}

async function verifyGitHubSignature(request: Request, rawBody: string) {
  return await verifyGitHubWebhookSignature(
    rawBody,
    request.headers.get("x-hub-signature-256"),
    process.env.GITHUB_WEBHOOK_SECRET,
  );
}

async function draftChangelogCopy(input: {
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
      error: String(record(payload)?.error?.message ?? `OpenAI returned ${response.status}`),
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

type StripeCheckoutTier = "pro" | "scale" | "starter" | "team";

const stripeCheckoutPlans: Record<
  StripeCheckoutTier,
  {
    name: string;
    priceMonthly: number;
    tier: StripeCheckoutTier;
  }
> = {
  pro: {
    name: "Amend Pro",
    priceMonthly: 49,
    tier: "pro",
  },
  scale: {
    name: "Amend Scale",
    priceMonthly: 249,
    tier: "scale",
  },
  starter: {
    name: "Amend Starter",
    priceMonthly: 19,
    tier: "starter",
  },
  team: {
    name: "Amend Team",
    priceMonthly: 99,
    tier: "team",
  },
};

function stripeCheckoutPlan(tier: ReturnType<typeof planTier>) {
  return tier === "starter" || tier === "pro" || tier === "team" || tier === "scale"
    ? stripeCheckoutPlans[tier]
    : undefined;
}

function stripeCheckoutPlanFromValue(value: unknown) {
  return value === "starter" || value === "pro" || value === "team" || value === "scale"
    ? stripeCheckoutPlans[value]
    : undefined;
}

async function createStripeCheckoutSession(input: {
  cancelUrl?: string;
  customerEmail?: string;
  dryRun: boolean;
  seats: number;
  successUrl?: string;
  tier: StripeCheckoutTier;
  workspaceSlug: string;
}) {
  const plan = stripeCheckoutPlans[input.tier];
  const siteUrl = process.env.SITE_URL ?? "http://amend.localhost:1355";
  const successUrl =
    input.successUrl ??
    `${siteUrl.replace(/\/+$/, "")}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = input.cancelUrl ?? `${siteUrl.replace(/\/+$/, "")}/dashboard?checkout=cancel`;
  const seats = Math.max(1, Math.min(Math.trunc(input.seats), 1_000));

  if (input.dryRun || !process.env.STRIPE_SECRET_KEY) {
    return {
      checkoutUrl: successUrl.replace("{CHECKOUT_SESSION_ID}", "dry_run"),
      mode: "subscription",
      plan,
      provider: "dry-run",
      seats,
      workspaceSlug: input.workspaceSlug,
    };
  }

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("success_url", successUrl);
  body.set("cancel_url", cancelUrl);
  body.set("client_reference_id", input.workspaceSlug);
  body.set("allow_promotion_codes", "true");
  body.set("metadata[workspaceSlug]", input.workspaceSlug);
  body.set("metadata[tier]", input.tier);
  body.set("metadata[seats]", String(seats));
  body.set("subscription_data[metadata][workspaceSlug]", input.workspaceSlug);
  body.set("subscription_data[metadata][tier]", input.tier);
  body.set("subscription_data[metadata][seats]", String(seats));
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(plan.priceMonthly * 100));
  body.set("line_items[0][price_data][recurring][interval]", "month");
  body.set("line_items[0][price_data][product_data][name]", plan.name);
  body.set("line_items[0][quantity]", String(seats));
  if (input.customerEmail) {
    body.set("customer_email", input.customerEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    body,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));
  const payloadRecord = record(payload);
  if (!response.ok) {
    return {
      error: String(
        optionalString(record(payloadRecord?.error)?.message) ??
          `Stripe returned ${response.status}`,
      ),
      mode: "subscription",
      plan,
      provider: "stripe",
      seats,
      workspaceSlug: input.workspaceSlug,
    };
  }

  return {
    checkoutSessionId: optionalString(payloadRecord?.id),
    checkoutUrl: optionalString(payloadRecord?.url),
    mode: "subscription",
    plan,
    provider: "stripe",
    seats,
    workspaceSlug: input.workspaceSlug,
  };
}

async function verifyStripeSignature(request: Request, rawBody: string) {
  return await verifyStripeWebhookSignature(
    rawBody,
    request.headers.get("stripe-signature"),
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}

async function handleStripeWebhook(
  ctx: ActionCtx,
  routeWorkspaceSlug: string,
  event: Record<string, any>,
) {
  const eventType = optionalString(event.type);
  if (eventType !== "checkout.session.completed") {
    return {
      ignored: true,
      received: true,
      type: eventType ?? "unknown",
    };
  }

  const session = record(record(event.data)?.object);
  const metadata = record(session?.metadata);
  const workspaceSlug = optionalString(metadata?.workspaceSlug) ?? routeWorkspaceSlug;
  const tier = stripeCheckoutPlanFromValue(metadata?.tier);
  if (!tier) {
    return {
      error: "Stripe checkout session is missing a paid Amend tier",
      received: true,
      type: eventType,
    };
  }

  const seats = numberValue(Number(metadata?.seats)) ?? 1;
  const plan = await ctx.runMutation(api.amend.updatePlan, {
    seats,
    tier: tier.tier,
    workspaceSlug,
  });

  return {
    checkoutSessionId: optionalString(session?.id),
    plan,
    received: true,
    type: eventType,
    workspaceSlug,
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

function timingSafeEqualText(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

type DeliveryRecord = {
  channel: "email" | "in_app" | "slack" | "webhook";
  payload: Record<string, any>;
  recipient: string;
  recordId: Id<"deliveryOutbox">;
  status: "failed" | "queued" | "sent" | "skipped";
};

type DeliveryStatusPatch = {
  lastError?: string;
  provider?: string;
  providerMessageId?: string;
  status: "failed" | "queued" | "sent" | "skipped";
};

type DeliverySendResult = {
  error?: string;
  provider: string;
  providerMessageId?: string;
  status: "failed" | "sent" | "skipped";
};

async function sendQueuedDeliveries(
  deliveries: DeliveryRecord[],
  updateDelivery: (
    deliveryId: Id<"deliveryOutbox">,
    patch: DeliveryStatusPatch,
  ) => Promise<unknown>,
  options: {
    channel?: "email" | "in_app" | "slack" | "webhook";
    dryRun: boolean;
    limit: number;
  },
) {
  const queued = deliveries
    .filter((delivery) => delivery.status === "queued")
    .filter((delivery) => !options.channel || delivery.channel === options.channel)
    .slice(0, Math.max(1, Math.min(options.limit, 100)));
  const results: Array<{
    channel: string;
    error?: string;
    provider?: string;
    recipient: string;
    status: string;
  }> = [];

  for (const delivery of queued) {
    const result = await sendDelivery(delivery, options.dryRun);
    await updateDelivery(delivery.recordId, {
      lastError: result.error,
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      status: result.status,
    });
    results.push({
      channel: delivery.channel,
      error: result.error,
      provider: result.provider,
      recipient: delivery.recipient,
      status: result.status,
    });
  }

  return {
    failed: results.filter((result) => result.status === "failed").length,
    processed: results.length,
    queuedRemaining: Math.max(
      0,
      deliveries.filter((delivery) => delivery.status === "queued").length - results.length,
    ),
    results,
    sent: results.filter((result) => result.status === "sent").length,
    skipped: results.filter((result) => result.status === "skipped").length,
  };
}

async function sendDelivery(
  delivery: DeliveryRecord,
  dryRun: boolean,
): Promise<DeliverySendResult> {
  if (delivery.channel === "in_app") {
    return {
      provider: dryRun ? "dry-run" : "amend",
      providerMessageId: `in-app:${delivery.recordId}`,
      status: "sent" as const,
    };
  }

  if (delivery.channel === "email") {
    return await sendEmailDelivery(delivery, dryRun);
  }

  if (delivery.channel === "webhook") {
    return {
      error: "Webhook delivery endpoint is not configured for this workspace",
      provider: dryRun ? "dry-run" : "webhook",
      status: dryRun ? ("skipped" as const) : ("failed" as const),
    };
  }

  return {
    error: "Slack delivery endpoint is not configured for this workspace",
    provider: dryRun ? "dry-run" : "slack",
    status: dryRun ? ("skipped" as const) : ("failed" as const),
  };
}

async function sendEmailDelivery(delivery: DeliveryRecord, dryRun: boolean) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (dryRun || !resendApiKey || !from) {
    return {
      error: dryRun ? undefined : "Missing RESEND_API_KEY or EMAIL_FROM",
      provider: "dry-run",
      providerMessageId: `dry-run:${delivery.recordId}`,
      status: dryRun ? ("sent" as const) : ("failed" as const),
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: emailHtml(delivery),
      subject: String(delivery.payload.title ?? "Amend update"),
      text: emailText(delivery),
      to: delivery.recipient,
    }),
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      error: String(record(payload)?.message ?? `Resend returned ${response.status}`),
      provider: "resend",
      status: "failed" as const,
    };
  }
  return {
    provider: "resend",
    providerMessageId: optionalString(record(payload)?.id),
    status: "sent" as const,
  };
}

function emailText(delivery: DeliveryRecord) {
  const title = String(delivery.payload.title ?? "Amend update");
  const body = String(delivery.payload.body ?? "");
  const sourceCount = Array.isArray(delivery.payload.sourceLinks)
    ? delivery.payload.sourceLinks.length
    : 0;
  return `${title}\n\n${body}\n\nSource links: ${sourceCount}\n${process.env.SITE_URL ?? "https://amend.sh"}`;
}

function emailHtml(delivery: DeliveryRecord) {
  const title = escapeHtml(String(delivery.payload.title ?? "Amend update"));
  const body = escapeHtml(String(delivery.payload.body ?? ""));
  const url = escapeHtml(process.env.SITE_URL ?? "https://amend.sh");
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1f1f29"><h1>${title}</h1><p>${body}</p><p><a href="${url}">View source-linked update</a></p></div>`;
}

async function verifyDomainTxt(domain: string, expectedTxt: string) {
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`,
    {
      headers: {
        Accept: "application/dns-json",
      },
    },
  );
  const payload = await response.json().catch(() => ({}));
  const answers = Array.isArray(record(payload)?.Answer) ? record(payload)?.Answer : [];
  return answers.some((answer: unknown) => {
    const data = optionalString(record(answer)?.data);
    return data?.replaceAll('"', "").includes(expectedTxt);
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
    status,
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-GitHub-Event, X-Hub-Signature-256",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Origin": "*",
  };
}

function normalizedRoadmapStatus(status: string | null) {
  if (status && roadmapStatuses.has(status)) {
    return status as
      | "closed"
      | "considering"
      | "in_progress"
      | "paused"
      | "planned"
      | "shipped"
      | "under_review";
  }
  return undefined;
}

function portalVisibility(value: unknown) {
  if (value === "public" || value === "private") {
    return value;
  }
  return undefined;
}

function portalFeedbackMode(value: unknown) {
  if (value === "open" || value === "authenticated" || value === "closed") {
    return value;
  }
  return undefined;
}

function feedbackInteractionKind(value: unknown) {
  if (value === "vote" || value === "comment" || value === "reaction") {
    return value;
  }
  throw new Error("kind must be vote, comment, or reaction");
}

function eventName(value: unknown) {
  if (typeof value === "string" && eventNames.has(value)) {
    return value as
      | "account_identify"
      | "changelog_viewed"
      | "comment_added"
      | "feedback_submitted"
      | "identify"
      | "reaction_added"
      | "roadmap_viewed"
      | "shipped_feature_used"
      | "update_seen"
      | "vote_added";
  }
  throw new Error("event must be a supported Amend event name");
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function optionalBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined;
}

function record(value: unknown): Record<string, any> | undefined {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return undefined;
}

function githubSourceEvent(request: Request, payload: Record<string, any>) {
  const event = request.headers.get("x-github-event") ?? optionalString(payload.event) ?? "unknown";
  const repository = record(payload.repository);
  const owner =
    optionalString(record(repository?.owner)?.login) ?? optionalString(repository?.owner);
  const repo = optionalString(repository?.name);
  const sender = optionalString(record(payload.sender)?.login);
  const receivedAt = Date.now();

  if (event === "pull_request") {
    const pullRequest = record(payload.pull_request) ?? {};
    const number = numberValue(pullRequest.number ?? payload.number);
    return {
      author: optionalString(record(pullRequest.user)?.login) ?? sender,
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:pull_request:${
        number ?? optionalString(pullRequest.node_id) ?? receivedAt
      }`,
      kind: "pull_request" as const,
      labels: labels(pullRequest.labels),
      number,
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: dateValue(pullRequest.created_at) ?? receivedAt,
      sourceUpdatedAt: dateValue(pullRequest.updated_at) ?? receivedAt,
      state: pullRequest.merged
        ? ("merged" as const)
        : pullRequest.state === "closed"
          ? ("closed" as const)
          : ("open" as const),
      title: requiredString(pullRequest.title, "pull_request.title"),
      url:
        optionalString(pullRequest.html_url) ??
        optionalString(pullRequest.url) ??
        repositoryUrl(owner, repo),
    };
  }

  if (event === "issues") {
    const issue = record(payload.issue) ?? {};
    const number = numberValue(issue.number ?? payload.number);
    return {
      author: optionalString(record(issue.user)?.login) ?? sender,
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:issue:${
        number ?? optionalString(issue.node_id) ?? receivedAt
      }`,
      kind: "issue" as const,
      labels: labels(issue.labels),
      number,
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: dateValue(issue.created_at) ?? receivedAt,
      sourceUpdatedAt: dateValue(issue.updated_at) ?? receivedAt,
      state: issue.state === "closed" ? ("closed" as const) : ("open" as const),
      title: requiredString(issue.title, "issue.title"),
      url:
        optionalString(issue.html_url) ?? optionalString(issue.url) ?? repositoryUrl(owner, repo),
    };
  }

  if (event === "release") {
    const release = record(payload.release) ?? {};
    const tagName =
      optionalString(release.tag_name) ?? optionalString(release.name) ?? String(receivedAt);
    return {
      author: optionalString(record(release.author)?.login) ?? sender,
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:release:${tagName}`,
      kind: "release" as const,
      labels: ["release"],
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: dateValue(release.created_at) ?? receivedAt,
      sourceUpdatedAt: dateValue(release.published_at) ?? receivedAt,
      state: release.draft ? ("draft" as const) : ("published" as const),
      title: optionalString(release.name) ?? tagName,
      url: optionalString(release.html_url) ?? repositoryUrl(owner, repo),
    };
  }

  if (event === "label") {
    const label = record(payload.label) ?? {};
    const name = requiredString(label.name, "label.name");
    return {
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:label:${name}`,
      kind: "label" as const,
      labels: [name],
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: receivedAt,
      sourceUpdatedAt: receivedAt,
      title: name,
      url: repositoryUrl(owner, repo),
    };
  }

  if (event === "milestone") {
    const milestone = record(payload.milestone) ?? {};
    const number = numberValue(milestone.number);
    return {
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:milestone:${
        number ?? optionalString(milestone.title) ?? receivedAt
      }`,
      kind: "milestone" as const,
      labels: ["milestone"],
      milestone: optionalString(milestone.title),
      number,
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: dateValue(milestone.created_at) ?? receivedAt,
      sourceUpdatedAt: dateValue(milestone.updated_at) ?? receivedAt,
      state: milestone.state === "closed" ? ("closed" as const) : ("open" as const),
      title: requiredString(milestone.title, "milestone.title"),
      url: optionalString(milestone.html_url) ?? repositoryUrl(owner, repo),
    };
  }

  throw new Error(`Unsupported GitHub event '${event}'`);
}

function labels(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item : optionalString(record(item)?.name)))
    .filter((item): item is string => Boolean(item));
}

function dateValue(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function repositoryUrl(owner: string | undefined, repo: string | undefined) {
  return owner && repo ? `https://github.com/${owner}/${repo}` : "https://github.com";
}

function automationMode(value: unknown) {
  if (value === "review_first" || value === "manual" || value === "mostly_auto") {
    return value;
  }
  return undefined;
}

function notificationMode(value: unknown) {
  if (value === "digest" || value === "muted" || value === "instant") {
    return value;
  }
  return "instant";
}

function memberRole(value: unknown) {
  if (
    value === "owner" ||
    value === "admin" ||
    value === "reviewer" ||
    value === "member" ||
    value === "viewer"
  ) {
    return value;
  }
  return "member";
}

function integrationProvider(value: unknown) {
  if (
    value === "github" ||
    value === "linear" ||
    value === "slack" ||
    value === "discord" ||
    value === "x" ||
    value === "posthog" ||
    value === "databuddy" ||
    value === "support"
  ) {
    return value;
  }
  return "support";
}

function integrationDirection(value: unknown) {
  if (value === "inbound" || value === "outbound" || value === "bidirectional") {
    return value;
  }
  return "inbound";
}

function integrationState(value: unknown) {
  if (
    value === "planned" ||
    value === "connected" ||
    value === "attention" ||
    value === "disabled"
  ) {
    return value;
  }
  return "planned";
}

function changelogStatus(value: unknown) {
  if (
    value === "draft" ||
    value === "in_review" ||
    value === "scheduled" ||
    value === "published" ||
    value === "archived"
  ) {
    return value;
  }
  return undefined;
}

function changelogCategory(value: unknown) {
  if (
    value === "added" ||
    value === "changed" ||
    value === "fixed" ||
    value === "removed" ||
    value === "security"
  ) {
    return value;
  }
  return undefined;
}

function roadmapPriority(value: unknown) {
  if (value === "P0" || value === "P1" || value === "P2" || value === "P3") {
    return value;
  }
  return undefined;
}

function domainPurpose(value: unknown) {
  if (value === "api" || value === "embed" || value === "portal") {
    return value;
  }
  return "portal";
}

function projectVisibility(value: unknown) {
  if (value === "private" || value === "public") {
    return value;
  }
  return undefined;
}

function planTier(value: unknown) {
  if (
    value === "free" ||
    value === "starter" ||
    value === "pro" ||
    value === "team" ||
    value === "scale" ||
    value === "enterprise" ||
    value === "open_source"
  ) {
    return value;
  }
  throw new Error("tier must be a supported Amend plan tier");
}

function deliveryChannel(value: unknown) {
  if (value === "email" || value === "in_app" || value === "slack" || value === "webhook") {
    return value;
  }
  return undefined;
}
