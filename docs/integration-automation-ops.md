# Automation Operations

These settings control how Amend turns source evidence into reviewable product updates.

## Automation Rules

Automation should default to Mostly Auto:

- safe, high-confidence status updates can apply automatically
- public copy, low-confidence matches, and high-impact notification changes should require review
- every decision should keep source evidence and confidence context

```ts
await amend.updateAutomationRules({
  mode: "mostly_auto",
  autoDraftChangelog: true,
  autoPublishChangelog: false,
  requireReviewBelowConfidence: 0.82,
});
```

## BYO AI Drafting

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in Convex to enable AI-backed changelog drafting.
Local dry-runs do not require credentials.

```ts
await amend.draftChangelog({
  title: "Webhook retry status",
  kind: "pull_request",
  dryRun: true,
});
```

## Proactive Agent Provider

The proactive agent runs server-side through `amend:runProactiveAgentForWorkspace`. It reads channel
events, source evidence, feedback, roadmap, changelog, notification state, and workspace rules, then
persists source-linked automation decisions. Public copy and risky actions should remain reviewable.

Set Crof/Kimi environment variables on the Convex deployment:

```bash
bunx convex env set CROF_API_KEY "replace-with-crof-key"
bunx convex env set CROF_MODEL "kimi-k2.6"
bunx convex env set CROF_BASE_URL "https://crof.ai/v1"
```

If the provider is not configured or returns invalid output, the backend records a local fallback
decision instead of inventing source links.

## Manual Roadmap And Changelog Edits

Teams can keep source-linked automation but still manually edit public records:

```ts
await amend.upsertChangelog({
  title: "Webhook retry status",
  summary: "Retry status is now visible in the update loop.",
  body: "Admins can see retry recovery status before publishing customer-facing copy.",
  status: "in_review",
});

await amend.upsertRoadmapItem({
  title: "Digest windows",
  description: "Let teams choose when shipped-user digests are sent.",
  status: "planned",
});
```

## Custom Domains

Customize the public portal before registering a domain:

```ts
await amend.updatePortalSettings({
  headline: "Launch notes",
  intro: "Product updates with source links and customer context.",
  feedbackMode: "authenticated",
  roadmapVisibility: "public",
  changelogVisibility: "public",
});
```

Register custom domains for portal, embed, or API surfaces:

```ts
const domain = await amend.registerCustomDomain("updates.example.com", "portal");
// Add a TXT record containing domain.verificationToken, then:
await amend.verifyCustomDomain("updates.example.com");

// Production host routing can resolve the verified domain before rendering:
await amend.resolveCustomDomain("updates.example.com", "portal");
```

## Plans

Read the public catalog and update the workspace's selected plan:

```ts
const catalog = await amend.plans();
await amend.updatePlan("pro", 5);
```

Create a hosted Stripe Checkout session for self-serve paid plans:

```ts
const checkout = await amend.createCheckoutSession({
  tier: "pro",
  seats: 5,
  customerEmail: "owner@example.com",
  dryRun: true,
});
```

Checkout uses Stripe-hosted Checkout Sessions in `subscription` mode. Local dry-runs do not require
Stripe credentials; production checkout requires `STRIPE_SECRET_KEY`.

Configure Stripe webhooks to send `checkout.session.completed` events to
`/api/v1/:workspace/stripe`. Amend verifies the raw request body with `STRIPE_WEBHOOK_SECRET` before
applying plan changes from Checkout metadata.

## Self-Hosting

For local self-hosting, run:

```bash
bunx convex dev --configure new --dev-deployment local --project amend --once --tail-logs disable
bunx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
bunx convex env set SITE_URL http://amend.localhost:1355
bunx convex env set AMEND_API_TOKEN "$(openssl rand -base64 32)"
bun dev
```

The normal web URL is `http://amend.localhost:1355`.

## Bring Your Own AI Key

BYO AI is part of the product posture. Store provider keys as deployment environment variables and
make automation decisions source-linked and reviewable. Do not let generated public copy publish
without workspace rules and confidence checks.
