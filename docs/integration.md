# Amend.sh Integration Guide

This guide documents the integration surfaces that make Amend useful outside the hosted portal.

## GitHub Setup

GitHub is the source of truth for shipped work. A workspace should connect repositories and watch:

- pull requests
- issues
- releases
- labels
- milestones

Every automated roadmap, changelog, feedback, review, and notification decision should retain the
source links that caused it.

Set `GITHUB_WEBHOOK_SECRET` in Convex to verify `X-Hub-Signature-256` on webhook requests. For a
real GitHub App install flow, also set `GITHUB_APP_ID`, `GITHUB_APP_SLUG`,
`GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`, and `GITHUB_APP_PRIVATE_KEY`. Local development
can leave them unset for unsigned smoke tests and manually connected demo repositories.

```bash
bunx convex env set GITHUB_WEBHOOK_SECRET "replace-with-your-github-webhook-secret"
bunx convex env set GITHUB_APP_ID "replace-with-your-github-app-id"
bunx convex env set GITHUB_APP_SLUG "replace-with-your-github-app-slug"
bunx convex env set GITHUB_APP_CLIENT_ID "replace-with-your-github-app-client-id"
bunx convex env set GITHUB_APP_CLIENT_SECRET "replace-with-your-github-app-client-secret"
bunx convex env set GITHUB_APP_PRIVATE_KEY "replace-with-your-github-app-private-key"
```

The SDK exposes the install readiness endpoint so product UI can show the correct setup state:

```ts
const github = await amend.githubApp();
```

## Portal Setup

The public portal exposes changelog, roadmap, and customer signals for a workspace slug.

```ts
const amend = new Amend({ project: "amend-labs" });
const portal = await amend.portal();
```

The same data is available through REST:

```bash
curl http://127.0.0.1:3211/api/v1/amend-labs/portal
```

The hosted portal also includes a request form when `feedbackMode` is `open` or when an
authenticated portal visitor is allowed to submit. New portal requests enter the same feedback,
review, notification, and event pipeline as SDK and REST submissions.

## SDK Install

The local workspace SDK lives at `packages/sdk` and exports `@amend/sdk`.

```ts
import { Amend } from "@amend/sdk";

const amend = new Amend({
  project: "amend-labs",
  apiBaseUrl: "http://127.0.0.1:3211/api/v1",
  token: process.env.AMEND_API_TOKEN,
});
```

If `AMEND_API_TOKEN` is set in Convex, owner-level mutation endpoints require
`Authorization: Bearer <token>`. Public portal reads, feedback submission, identity mapping,
event tracking, and signed GitHub webhooks remain available for customer-facing integration flows.

## REST API

REST endpoints are served by Convex HTTP actions from `packages/backend/convex/http.ts`.

| Method | Endpoint                             | Purpose                                           |
| ------ | ------------------------------------ | ------------------------------------------------- |
| `GET`  | `/api/v1/:workspace/portal`          | Fetch public portal data                          |
| `GET`  | `/api/v1/:workspace/roadmap`         | Fetch roadmap data and track a view               |
| `GET`  | `/api/v1/:workspace/changelog`       | Fetch changelog data and track a view             |
| `GET`  | `/api/v1/:workspace/updates`         | Fetch changelog, roadmap, and notification data   |
| `GET`  | `/api/v1/:workspace/settings`        | Fetch rules, members, integrations, domains       |
| `GET`  | `/api/v1/:workspace/decisions`       | Fetch source-linked automation decisions          |
| `GET`  | `/api/v1/:workspace/deliveries`      | Fetch planned delivery outbox records             |
| `GET`  | `/api/v1/:workspace/github-app`      | Fetch GitHub App install URL and readiness        |
| `GET`  | `/api/v1/:workspace/projects`        | Fetch workspace projects and connected repos      |
| `GET`  | `/api/v1/:workspace/plans`           | Fetch plan catalog and current workspace plan     |
| `GET`  | `/api/v1/_/domains`                  | Resolve a verified custom domain to a workspace   |
| `POST` | `/api/v1/:workspace/identity`        | Map an external user/account into Amend           |
| `POST` | `/api/v1/:workspace/feedback`        | Submit feedback or a request                      |
| `POST` | `/api/v1/:workspace/interactions`    | Record feedback votes, comments, and reactions    |
| `POST` | `/api/v1/:workspace/events`          | Track event-lite product-loop events              |
| `POST` | `/api/v1/:workspace/github`          | Ingest GitHub webhooks into source records        |
| `POST` | `/api/v1/:workspace/drafts`          | Draft changelog copy with BYO AI or dry-run       |
| `POST` | `/api/v1/:workspace/changelog`       | Create or update a changelog entry                |
| `POST` | `/api/v1/:workspace/roadmap`         | Create or update a roadmap item                   |
| `POST` | `/api/v1/:workspace/projects`        | Create or update a workspace project              |
| `POST` | `/api/v1/:workspace/repositories`    | Connect a GitHub repository to a project          |
| `POST` | `/api/v1/:workspace/plans`           | Update the workspace plan selection               |
| `POST` | `/api/v1/:workspace/checkout`        | Create a Stripe Checkout session or dry-run       |
| `POST` | `/api/v1/:workspace/stripe`          | Receive signed Stripe billing webhooks            |
| `POST` | `/api/v1/:workspace/rules`           | Update Mostly Auto automation rules               |
| `POST` | `/api/v1/:workspace/members`         | Add or update workspace members and permissions   |
| `POST` | `/api/v1/:workspace/integrations`    | Add or update integration connection state        |
| `POST` | `/api/v1/:workspace/portal-settings` | Update portal copy, visibility, and feedback mode |
| `POST` | `/api/v1/:workspace/preferences`     | Save instant/digest/muted notification choice     |
| `POST` | `/api/v1/:workspace/domains`         | Register a custom portal/embed/API domain         |
| `POST` | `/api/v1/:workspace/deliveries`      | Plan queued notification delivery records         |

## Identity Mapping

Customer apps keep their own users. Amend maps those users into a workspace:

```ts
await amend.identify({
  externalUserId: user.id,
  email: user.email,
  name: user.name,
  accountId: workspace.id,
  traits: { plan: "pro" },
});

await amend.identifyAccount(workspace.id, {
  plan: "pro",
  seats: 12,
});
```

## Side Panel / Embed

Use the lightweight embed helper when teams want a tasteful in-app side panel instead of building
their own UI immediately.

```ts
import { createAmendPanel } from "@amend/sdk/embed";

createAmendPanel({
  project: "amend-labs",
  apiBaseUrl: "http://127.0.0.1:3211/api/v1",
});
```

The panel shows shipped updates, roadmap items, and a feedback form. Teams can still use the SDK
or REST API to build a fully custom surface.

Run the browser demo at `http://amend.localhost:1355/embed-demo` while `bun run dev` is running.
It mounts the same `createAmendPanel` helper against the local portal API.

## Projects And Repositories

Projects group product surfaces inside a workspace. Each project can connect one or more GitHub
repositories.

```ts
const project = await amend.createProject({
  name: "Web App",
  slug: "web-app",
  visibility: "public",
});

await amend.connectRepository({
  projectKey: project.stableKey,
  owner: "acme",
  repo: "web",
});
```

## Team Permissions

Workspace members have explicit roles and permissions for review, changelog publishing, and rules
management:

```ts
await amend.upsertWorkspaceMember({
  email: "reviewer@example.com",
  name: "Release reviewer",
  role: "reviewer",
  permissions: ["review:approve", "changelog:edit"],
});
```

## Integration Connections

Channels are the input surfaces Amend watches: GitHub, feedback board, SDK events, Discord, Slack,
support, Linear, and usage signals. Integrations are the saved provider connections that let those
channels ingest context or send updates back out. GitHub is deepest; other connections can be
represented before their OAuth/webhook credentials are live:

```ts
await amend.upsertIntegration({
  provider: "slack",
  direction: "outbound",
  state: "planned",
  displayName: "Slack release updates",
  config: { channel: "#product-updates" },
});
```

The authenticated dashboard uses these records for the proactive agent's channel map, so a
`planned`, `connected`, `attention`, or `disabled` state should reflect what the agent can safely
trust.

## Notification Rules

Use `markUpdateSeen`, `updatesForUser`, and event tracking to keep notification behavior tied to
what a user asked for, voted on, commented on, reacted to, subscribed to, or used.
`updatesForUser` calls the REST updates endpoint with the external user id and returns the user's
filtered notification feed, seen update keys, roadmap, and changelog data.
Use `updatesForContact` when a customer app has both an external user id and the same email a user
may use in the hosted portal.

```ts
await amend.vote("feedback-show-shipping-pr", user.id);
await amend.comment("feedback-show-shipping-pr", "This would help our admins.", user.id);
await amend.react("feedback-show-shipping-pr", "heart", user.id);

await amend.markUpdateSeen("changelog-reviewable-publishing", user.id);
await amend.trackShippedFeature("roadmap-source-linked-portal", user.id);
await amend.updatesForContact({ userId: user.id, email: user.email });
await amend.setNotificationPreference({
  externalUserId: user.id,
  email: user.email,
  mode: "digest",
  digestDay: "friday",
  digestHour: 16,
});

await amend.unsubscribe({ email: user.email });

await amend.planDeliveries({
  channel: "email",
  notificationKey: "notification-changelog-review-ready",
});

await amend.sendDeliveries({
  channel: "email",
  dryRun: true,
  limit: 10,
});
```

Email delivery uses the delivery outbox. Configure `RESEND_API_KEY` and `EMAIL_FROM` in Convex for
real email sends; keep `dryRun: true` for local verification.

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
