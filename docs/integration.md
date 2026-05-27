# Amend.sh Integration Guide

This guide is the integration hub for the surfaces that make Amend useful outside the hosted portal.
Keep it open when wiring a product for the first time, then use the companion guides when you need
deeper operational details:

- [Source event imports](integration-source-events.md)
- [Customer surfaces](integration-customer-surfaces.md)
- [Automation operations](integration-automation-ops.md)

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

## Analytics Contract

Amend stores every product-loop analytics event in Convex `eventRecords` and also forwards it to
PostHog through the Convex PostHog component. The in-house Analytics dashboard reads the Convex
records so operators do not need to learn PostHog first; PostHog remains the raw event warehouse.

Tracked events are grouped by `packages/backend/convex/amendAnalyticsEvents.ts` into these
dashboard categories:

| Category   | What belongs here                                           |
| ---------- | ----------------------------------------------------------- |
| `identity` | User/account identify calls, signup, signin, and signout    |
| `feedback` | Feedback submissions, comments, reactions, and votes        |
| `source`   | GitHub/support/Slack/Discord/import source evidence         |
| `agent`    | Proactive agent runs, reviews, and automation decisions     |
| `project`  | Project creation and first-source connection                |
| `roadmap`  | Roadmap creation, views, and roadmap votes                  |
| `update`   | Changelog views, shipped feature usage, and seen updates    |
| `delivery` | Planned or status-updated notification/delivery outbox work |

The hosted web app also sends browser PostHog events for `sign up submitted`, `user signed up`,
`sign in submitted`, `user signed in`, `user signed out`, `project created`, and
`project source connected`. Use `user signed up` for welcome/onboarding workflows.

When adding a feature that changes customer-visible product state, add or reuse a `loopEvent`
literal, record it with `recordAnalyticsEvent`, and place it in `analyticsEventCategories`. That
keeps the REST/SDK event contract, Convex dashboard, and PostHog metadata aligned.

Generate a development owner token locally with:

```bash
bun packages/cli/src/index.ts token generate --limit 32
```

Then set the emitted `AMEND_API_TOKEN=...` value in Convex or your hosting environment.

## REST API

REST endpoints are served by Convex HTTP actions from `packages/backend/convex/http.ts`.
The beta OpenAPI contract lives at `packages/api-spec/openapi.yaml`; generate SDK-facing types with:

```bash
bun run --cwd packages/api-spec generate:types
```

| Method | Endpoint                             | Purpose                                           |
| ------ | ------------------------------------ | ------------------------------------------------- |
| `GET`  | `/api/v1/version`                    | Fetch deployed version and commit metadata        |
| `GET`  | `/api/v1/:workspace/portal`          | Fetch public portal data                          |
| `GET`  | `/api/v1/:workspace/roadmap`         | Fetch roadmap data and track a view               |
| `GET`  | `/api/v1/:workspace/changelog`       | Fetch changelog data and track a view             |
| `GET`  | `/api/v1/:workspace/updates`         | Fetch changelog, roadmap, and notification data   |
| `GET`  | `/api/v1/:workspace/settings`        | Fetch rules, members, integrations, domains       |
| `GET`  | `/api/v1/:workspace/decisions`       | Fetch source-linked automation decisions          |
| `GET`  | `/api/v1/:workspace/source-events`   | Fetch source evidence from all channels           |
| `GET`  | `/api/v1/:workspace/build-briefs`    | Fetch agent-readable build briefs                 |
| `GET`  | `/api/v1/:workspace/agent-runs`      | Fetch proactive agent run history                 |
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
| `POST` | `/api/v1/:workspace/source-events`   | Import Slack, Discord, email, CLI, or SDK signals |
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

## CLI

The local CLI lives in `packages/cli` and is designed for developers and coding agents. It is
read-only by default and has deterministic demo mode so the product loop can be checked without
real provider keys.

```bash
bun packages/cli/src/index.ts init --endpoint "http://127.0.0.1:3211/api/v1" --project amend-labs
bun packages/cli/src/index.ts config show
bun packages/cli/src/index.ts permissions inspect
bun packages/cli/src/index.ts status --demo
bun packages/cli/src/index.ts feedback list --demo
bun packages/cli/src/index.ts requests search --demo --query "github"
bun packages/cli/src/index.ts agent run --demo
bun packages/cli/src/index.ts agent runs --demo
bun packages/cli/src/index.ts briefs list --demo --status in_review
bun packages/cli/src/index.ts source list --demo --provider slack
bun packages/cli/src/index.ts source import --demo --provider slack --kind customer_signal --external-id slack:feedback:123 --title "Request from #feedback"
bun packages/cli/src/index.ts changelog draft --demo --title "Source-linked update"
bun packages/cli/src/index.ts openapi export
bun packages/cli/src/index.ts doctor
bun packages/cli/src/index.ts version --server --check
bun packages/cli/src/index.ts token create --limit 32
bun packages/cli/src/index.ts token create --plain
```

Configure live workspaces with:

```bash
export AMEND_API_BASE_URL="http://127.0.0.1:3211/api/v1"
export AMEND_PROJECT="amend-labs"
export AMEND_API_TOKEN="replace-with-owner-token"
```

`amend init` writes `.amend/config.json` with the endpoint and project so developers and coding
agents do not need to repeat flags. Tokens are not stored by default; prefer `AMEND_API_TOKEN` for
shared repos and only pass `--token` to `amend init` when you explicitly want a local config file to
hold that credential. Flags override env, env overrides `.amend/config.json`, and config overrides
the built-in localhost defaults.

Use `amend config show` for machine-readable effective configuration. It reports the selected
endpoint, project/workspace, config file path, config existence, token presence, and token source
without printing the token value. Use `amend permissions inspect` before handing the CLI to coding
agents; it reports safe read scopes, confirms `readOnlyDefault: true`, and only surfaces write scopes
from explicit `AMEND_WRITE_SCOPES`, `--write-scopes`, or `.amend/config.json` scope configuration.

`amend doctor` does not contact release metadata unless `--check` is passed. `token generate`
remains as a compatibility alias for `token create`; both commands generate local development tokens
that must be stored in the self-host environment or explicitly added to local CLI config.
