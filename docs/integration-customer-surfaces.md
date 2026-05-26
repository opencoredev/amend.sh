# Customer Surfaces

These surfaces let customer-owned apps connect their own identity, UI, teams, and notification
preferences to Amend.

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
