# Production Readiness

Amend is locally runnable through `bun run dev` and `http://amend.localhost:1355`. Production
requires external providers and deployment credentials that are intentionally not committed to the
repo.

Use `.env.production.example` as the single handoff checklist for web deployment variables and
Convex deployment environment variables.

## Readiness Commands

Run the non-strict report locally:

```bash
bun run readiness
```

Run the strict gate before deploy:

```bash
bun run readiness:strict
```

Strict mode fails when required production environment variables are not present in the current
process. It does not print secret values.

## Required Production Variables

Set these in the production Convex deployment or deployment platform:

| Variable                   | Purpose                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `VITE_CONVEX_URL`          | Production web Convex client URL                               |
| `VITE_CONVEX_SITE_URL`     | Production web Convex HTTP actions URL                         |
| `VITE_DOCS_URL`            | Public docs root, `https://docs.amend.sh/docs` for this launch |
| `VITE_POSTHOG_TOKEN`       | Browser PostHog project token                                  |
| `VITE_POSTHOG_HOST`        | Browser PostHog ingestion host                                 |
| `VITE_POSTHOG_PROJECT_ID`  | Browser PostHog project ID                                     |
| `POSTHOG_CLI_API_KEY`      | PostHog API key with error tracking write scope for sourcemaps |
| `POSTHOG_CLI_HOST`         | PostHog app host for the CLI, e.g. `https://us.posthog.com`    |
| `POSTHOG_CLI_PROJECT_ID`   | PostHog project ID for sourcemap uploads                       |
| `POSTHOG_RELEASE_NAME`     | PostHog release name for web sourcemaps, defaults to amend-web |
| `SITE_URL`                 | Hosted app origin and auth callbacks                           |
| `BETTER_AUTH_SECRET`       | Better Auth session security                                   |
| `GITHUB_WEBHOOK_SECRET`    | Signed GitHub webhook ingestion                                |
| `GITHUB_APP_ID`            | GitHub App installation identity                               |
| `GITHUB_APP_SLUG`          | GitHub App public install URL                                  |
| `GITHUB_APP_CLIENT_ID`     | GitHub App install/OAuth entrypoint                            |
| `GITHUB_APP_CLIENT_SECRET` | GitHub App OAuth callback exchange                             |
| `GITHUB_APP_PRIVATE_KEY`   | GitHub App installation token signing                          |
| `AMEND_API_TOKEN`          | Owner-level REST mutation protection                           |
| `POSTHOG_API_KEY`          | Convex backend analytics event capture                         |
| `POSTHOG_HOST`             | PostHog ingestion host, e.g. `https://us.i.posthog.com`        |
| `OPENAI_API_KEY`           | Provider-backed changelog drafting                             |
| `OPENAI_MODEL`             | Model used for changelog drafting                              |
| `CROF_API_KEY`             | Crof/Kimi proactive agent provider key                         |
| `CROF_MODEL`               | Proactive agent model, e.g. `kimi-k2.6`                        |
| `CROF_BASE_URL`            | Crof OpenAI-compatible API base URL                            |
| `RESEND_API_KEY`           | Real email delivery                                            |
| `EMAIL_FROM`               | Verified sender identity                                       |
| `STRIPE_SECRET_KEY`        | Billing checkout and plan changes                              |
| `STRIPE_WEBHOOK_SECRET`    | Billing webhook verification                                   |

## External Setup

- Create a GitHub App or OAuth app, install it on the repositories Amend should watch, and configure
  its webhook URL to `https://<your-domain>/api/v1/<workspace>/github`.
  Give it read access to metadata, contents, issues, pull requests, releases, labels, and milestones.
  Set the App ID, public app slug, client ID/secret, private key, and webhook secret in production
  before calling it a real repo/org connection.
- Set up an AI provider key for BYO AI drafting and the proactive agent. Keep public publishing
  gated by workspace rules.
- Verify an email sender/domain before enabling real delivery.
- Configure Stripe Checkout and a signed `checkout.session.completed` webhook before exposing paid
  plan changes.
- Add DNS records for custom portal, embed, and API domains, verify the TXT records in Amend, and
  configure the production web/API hosts to route verified domains to the matching workspace.
- Deploy Convex production functions and set the production web app's `VITE_CONVEX_URL` and
  `VITE_CONVEX_SITE_URL`.

## Local Gates

Before deploying a build, run:

```bash
bun run check
bun run build
bun run build:size
```

With `bun run dev` still running, run:

```bash
bun run smoke
```

## Agent-Ready Live Gate

After `amend.sh` is registered, delegated, and both `amend.sh` and `docs.amend.sh` serve the current
build, verify the public AI/agent surfaces:

```bash
bun run agent-ready:built
```

```bash
bun run agent-ready:live
```

Use `bun run agent-ready:status` for a no-secret summary of missing production env values,
registration, delegation, and DNS records before rerunning the full production gate.
Use `bun --silent run agent-ready:status:json` for structured output, or
`bun --silent scripts/agent-ready-status.ts --json --json-file agent-ready-status.json` when CI needs
a saved preflight artifact with machine-readable `blockers` and `nextGates`.
The artifact includes a `$schema` field documented in `docs/agent-ready-status-report.schema.json`;
validate a saved status artifact with
`bun run agent-ready:status:validate-report agent-ready-status.json`; add `--require-ok` when CI
should fail unless the no-secret status is blocker-free.
Use `bun --silent run agent-ready:live:json` to emit the same live gate as structured JSON for
deployment evidence or CI artifacts. Use `bun --silent run agent-ready:production:json` when CI
should emit one combined JSON report for strict readiness, built artifact validation, no-secret
status blockers, and the live gate.
Use `bun --silent scripts/agent-ready-live.ts --json --json-file agent-ready-live-report.json` when
the deploy system needs a saved JSON artifact.
The saved live report includes a `$schema` field documented in
`docs/agent-ready-live-report.schema.json`; validate it with
`bun run agent-ready:live:validate-report agent-ready-live-report.json`, or add `--require-ok`
when CI should fail unless every live check passes.
Use
`bun --silent scripts/agent-ready-production.ts --json --json-file agent-ready-production-report.json`
when the deploy system needs the combined production report saved as a JSON artifact. The report
includes a `$schema` field, and the artifact shape is documented in
`docs/agent-ready-production-report.schema.json` and exposed at the production report schema
endpoint. Validate a saved report with
`bun run agent-ready:production:validate-report agent-ready-production-report.json`; add
`--require-ok` when CI should fail unless `ok` is `true` and `blockers` is empty.
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

The command checks apex registration, delegation, A/AAAA/CNAME DNS records, final response origin,
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
audit report schema endpoints for the production origins. Override the
hosts when validating a preview or alternate deployment:

```bash
AMEND_WEB_ORIGIN=https://preview.example.com \
AMEND_DOCS_ORIGIN=https://docs-preview.example.com \
bun run agent-ready:live
```

Alternate origins are useful for preview deployments only. The production launch still requires the
same gate to pass on `https://amend.sh` and `https://docs.amend.sh`, and preview artifacts must use
the supplied preview origins in their absolute sitemap, `llms.txt`, canonical, and final-response
URLs.

See `docs/agent-ready-audit.md` for the current prompt-to-artifact checklist and
`docs/agent-ready-domain-setup.md` for the domain setup handoff.
