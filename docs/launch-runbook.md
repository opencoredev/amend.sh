# Production Launch Runbook

Use this runbook after local gates pass and before calling a hosted Amend instance production-ready.
It turns the remaining external blockers into a concrete launch checklist.

## Preflight

Run the local product gates first:

```bash
bun run check
bun run build
bun run smoke
bun run readiness
```

Run strict readiness in the same shell or deployment environment that has production values loaded:

```bash
bun run readiness:strict
```

Strict readiness should pass before launch. A local failure on production env checks means the
provider setup below is not finished yet.

## Provider Inputs

Collect these values from the production providers:

| Provider    | Required values                                                                     |
| ----------- | ----------------------------------------------------------------------------------- |
| App host    | `SITE_URL`, deployment URL, custom hostnames, TLS status                            |
| Convex      | production deployment, `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL`                    |
| Better Auth | generated `BETTER_AUTH_SECRET`, callback origin matching `SITE_URL`                 |
| GitHub App  | App ID, app slug, client ID, client secret, private key, webhook secret             |
| OpenAI      | `OPENAI_API_KEY`, chosen `OPENAI_MODEL`, workspace publishing/review policy         |
| Crof/Kimi   | `CROF_API_KEY`, `CROF_MODEL=kimi-k2.6`, `CROF_BASE_URL=https://crof.ai/v1`          |
| Resend      | `RESEND_API_KEY`, verified `EMAIL_FROM`, verified sending domain                    |
| Stripe      | secret key, checkout products/prices if used, signed checkout webhook secret        |
| DNS         | registered/delegated `amend.sh`, docs host, portal/embed/API hostnames, TXT records |

Copy `.env.production.example` and replace every placeholder before loading values into the web
host and Convex deployment.

## Convex Environment

Set production Convex environment variables with real values:

```bash
bunx convex env set SITE_URL "https://amend.sh"
bunx convex env set BETTER_AUTH_SECRET "replace-with-generated-secret"
bunx convex env set GITHUB_WEBHOOK_SECRET "replace-with-github-webhook-secret"
bunx convex env set GITHUB_APP_ID "replace-with-github-app-id"
bunx convex env set GITHUB_APP_SLUG "replace-with-github-app-slug"
bunx convex env set GITHUB_APP_CLIENT_ID "replace-with-github-client-id"
bunx convex env set GITHUB_APP_CLIENT_SECRET "replace-with-github-client-secret"
bunx convex env set GITHUB_APP_PRIVATE_KEY "replace-with-github-private-key"
bunx convex env set AMEND_API_TOKEN "replace-with-owner-api-token"
bunx convex env set POSTHOG_API_KEY "phc_BCb25jVTo59jtEMPysgGUvgt85bUYGwN8XBNA2oMNLY7"
bunx convex env set POSTHOG_HOST "https://us.i.posthog.com"
bunx convex env set OPENAI_API_KEY "replace-with-provider-key"
bunx convex env set OPENAI_MODEL "gpt-5.1-mini"
bunx convex env set CROF_API_KEY "replace-with-crof-key"
bunx convex env set CROF_MODEL "kimi-k2.6"
bunx convex env set CROF_BASE_URL "https://crof.ai/v1"
bunx convex env set RESEND_API_KEY "replace-with-resend-key"
bunx convex env set EMAIL_FROM "Amend <updates@amend.sh>"
bunx convex env set STRIPE_SECRET_KEY "replace-with-stripe-secret"
bunx convex env set STRIPE_WEBHOOK_SECRET "replace-with-stripe-webhook-secret"
```

Set the production web deployment values:

```bash
VITE_CONVEX_URL=https://<convex-deployment>.convex.cloud
VITE_CONVEX_SITE_URL=https://<convex-site>.convex.site
VITE_DOCS_URL=https://amend.sh/docs
VITE_POSTHOG_TOKEN=phc_BCb25jVTo59jtEMPysgGUvgt85bUYGwN8XBNA2oMNLY7
VITE_POSTHOG_HOST=https://us.i.posthog.com
VITE_POSTHOG_PROJECT_ID=441195
```

## GitHub App

Create a GitHub App with these permissions:

- metadata: read
- contents: read
- issues: read
- pull requests: read
- deployments/releases-equivalent source events as available
- labels and milestones through issue/repository metadata

Configure the webhook URL:

```text
https://<convex-site-domain>/api/v1/<workspace-slug>/github
```

Subscribe to pull request, issues, release, label, and milestone events. Use the same webhook secret
stored in `GITHUB_WEBHOOK_SECRET`.

## Email And Billing

Verify the Resend sender domain before enabling non-dry-run delivery. Keep `sendDeliveries` in
`dryRun` mode until sender verification and unsubscribe policy are confirmed.

Configure Stripe Checkout and send `checkout.session.completed` events to:

```text
https://<convex-site-domain>/api/v1/<workspace-slug>/stripe
```

Use the Stripe webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

## Custom Domains

Register each portal, embed, or API hostname through the SDK or REST API, publish the returned TXT
record, then verify it:

```ts
const domain = await amend.registerCustomDomain("updates.example.com", "portal");
await amend.verifyCustomDomain("updates.example.com");
```

After verification, configure the production host router to call:

```ts
await amend.resolveCustomDomain(hostname, "portal");
```

Route only verified domains to workspace content.

## Agent-Ready Live Gate

After `amend.sh` is registered, delegated, and both `amend.sh` and `docs.amend.sh` resolve to the
current deployment, verify the public AI/agent surfaces:

```bash
bun run agent-ready:production
```

That final gate runs strict production readiness, built artifact validation, and the live public
checks in sequence. To inspect the two agent-ready sub-gates independently, run:

```bash
bun run agent-ready:built
```

```bash
bun run agent-ready:status
```

```bash
bun --silent run agent-ready:status:json
```

```bash
bun --silent scripts/agent-ready-status.ts --json --json-file agent-ready-status.json
```

The status JSON includes no-secret `blockers` and `nextGates` so CI can show the remaining env and
DNS actions before the live and final gates are ready to run cleanly.
It also includes a `$schema` field documented in `docs/agent-ready-status-report.schema.json`;
validate a saved status artifact with
`bun run agent-ready:status:validate-report agent-ready-status.json`; add `--require-ok` when CI
should fail unless the no-secret status is blocker-free.

```bash
bun run agent-ready:live
```

Use `bun --silent run agent-ready:live:json` for a structured launch record with the same checks,
summary counts, and external blockers. Use `bun --silent run agent-ready:production:json` when CI
should emit one combined JSON report for strict production readiness, built artifact validation,
no-secret status blockers, and the live gate.
Use `bun --silent scripts/agent-ready-live.ts --json --json-file agent-ready-live-report.json` when
the launch record should be saved as an artifact file.
The saved live report includes a `$schema` field documented in
`docs/agent-ready-live-report.schema.json`; validate it with
`bun run agent-ready:live:validate-report agent-ready-live-report.json`, or add `--require-ok`
when CI should fail unless every live check passes.
Use
`bun --silent scripts/agent-ready-production.ts --json --json-file agent-ready-production-report.json`
when the combined production report should be saved as an artifact file. The report includes a
`$schema` field, and the artifact shape is documented in
`docs/agent-ready-production-report.schema.json` and exposed at the production report schema
endpoint. Validate a saved report with
`bun run agent-ready:production:validate-report agent-ready-production-report.json`; add
`--require-ok` when the launch gate should fail unless `ok` is `true` and `blockers` is empty.
Use `bun run agent-ready:refresh-report` when CI should refresh the saved report, sync the launch
audits, validate the artifact, run the completion audit in production-blocker-tolerant mode, and
still return the production gate status. Use `bun run agent-ready:final-gate` after production env
and DNS are ready to regenerate the saved reports, run the strict completion audit, require the
production, live, status, and completion audit reports to be green, refresh and validate the
no-secret status report, and verify synced audit evidence. Use
`bun run agent-ready:completion-audit` as the strict
prompt-to-artifact gate; it exits non-zero until strict readiness, production env, the live
validator, and the saved production report are all green. Use
`bun --silent scripts/agent-ready-completion-audit.ts --json --json-file agent-ready-completion-audit-report.json`
when CI needs the completion checklist as a JSON artifact. That report also includes a `$schema`
field, and its artifact shape is documented in
`docs/agent-ready-completion-audit-report.schema.json` and exposed at the completion audit report
schema endpoint. Validate it with
`bun run agent-ready:completion-audit:validate-report agent-ready-completion-audit-report.json`;
add `--require-ok` when CI should fail unless the completion audit is fully green.
Use `bun run agent-ready:sync-audit agent-ready-production-report.json` after saving a report to
sync the latest status/live timestamps into the launch audits, then
`bun run agent-ready:sync-audit:check agent-ready-production-report.json` to fail CI if the audit
evidence is stale. `bun run agent-ready:audit:check` runs saved production, live, status, and
completion audit report validation plus audit sync checking together, including a
check that the standalone live report matches the embedded production live report except for
`checkedAt`.

The gate checks apex registration, delegation, A/AAAA/CNAME DNS records, final response origin,
`robots.txt`, `sitemap.xml`, unique on-origin sitemap locs, `llms.txt` links aligned to the matching
sitemaps, docs `llms-full.txt`, expected content types, absence of `Disallow:` and
named AI crawler exceptions in robots files, absence of private app routes in the web sitemap,
AI/search/user-agent access for OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
ClaudeBot, PerplexityBot, Perplexity-User, Googlebot, Google-Extended, Bingbot, CCBot, and GPTBot
on public web and docs pages, absence of API routes in the docs sitemap, absence of `noindex` on
public HTML, absence of public `X-Robots-Tag: noindex`, homepage canonical/Open Graph/Twitter
metadata and parseable JSON-LD, crawlable canonical/Open Graph HTML for every web sitemap page,
private-route `noindex`, docs root canonical/Open Graph/parseable WebSite JSON-LD HTML, docs index
canonical/Open Graph/parseable TechArticle JSON-LD HTML, and the production/live/status/completion
audit report schema endpoints for both production hosts. A registration, delegation, or
DNS failure means the code build can be
ready, but the public site is not yet agent-ready.

Use `docs/agent-ready-domain-setup.md` as the domain setup handoff when the gate fails before
fetching public files.

Alternate-origin live checks are allowed for previews, but they do not replace the production gate.
Preview artifacts must use the supplied preview origins for absolute sitemap, `llms.txt`, canonical,
and final-response URLs; otherwise the live validator should fail.

## Launch Gate

The launch is ready only when:

- `bun run agent-ready:production` passes in the production environment
- `bun run agent-ready:completion-audit` passes against the saved production report
- `bun --silent run agent-ready:production:json` emits a passing combined JSON report for CI/deploy
  records
- `bun run agent-ready:production:validate-report agent-ready-production-report.json --require-ok`
  accepts the saved report
- `bun run readiness:strict` passes in the production environment
- `bun run agent-ready:built` passes after the production build
- `bun run agent-ready:live` passes against `https://amend.sh` and `https://docs.amend.sh`
- GitHub delivers a signed webhook and Amend records a source event
- AI drafting returns `provider: "openai"` for a non-dry-run draft
- a Resend dry-run replacement has been removed and a test email sends successfully
- Stripe sends a signed checkout webhook and plan state updates
- custom domains resolve to the intended workspace
- `bun run smoke` passes against the deployed web/API URLs using `AMEND_WEB_URL` and
  `AMEND_API_BASE_URL`
