# Amend.sh

> **Beta / work in progress:** Amend.sh is still early, changing quickly, and not production-stable
> yet. The hosted cloud launch is being wired up, public signup is closed for now, and the repo
> should be treated as an active beta implementation rather than finished software.

Amend.sh is an open-source product update automation platform. It connects GitHub,
customer signals, roadmap, changelog, and notifications into one mostly automatic loop:
when work ships, Amend updates the product story and closes the loop with the people
who asked for it.

The product is built as a TanStack Start web app with Convex and Better Auth, designed to
be self-hostable while still supporting a hosted cloud path.

## Product Scope

- GitHub-first source of truth for pull requests, issues, releases, labels, and milestones
- Source-linked changelog, roadmap, feedback/request statuses, and notifications
- Mostly Auto automation with workspace rules, confidence thresholds, and review lanes
- Public portal plus authenticated operations workspace
- TypeScript SDK and REST API for customer-owned interfaces, including votes, comments, reactions,
  identity, and shipped-update events
- Side panel/embed for in-app feedback, roadmap, and shipped updates
- Open-source/self-host posture with bring-your-own AI key and visible audit trails

See [docs/brand.md](docs/brand.md) for the brand system and asset inventory.
See [docs/integration.md](docs/integration.md) for the integration hub, with focused companion
guides for source imports, customer surfaces, and automation operations.
See [docs/completion-audit.md](docs/completion-audit.md) for the current prompt-to-artifact
coverage and remaining production blockers.
See [docs/agent-ready-audit.md](docs/agent-ready-audit.md) for the AI/agent visibility checklist.
See [docs/agent-ready-domain-setup.md](docs/agent-ready-domain-setup.md) for the `amend.sh` domain
handoff required before the live agent-ready gate can pass.
See [docs/production-readiness.md](docs/production-readiness.md) for the production env and provider
setup gate.
See [docs/launch-runbook.md](docs/launch-runbook.md) for the provider, DNS, and deployment checklist
needed before calling a hosted instance production-ready.

## Getting Started

First, install the dependencies:

```bash
bun install
```

Run the normal dev command locally:

```bash
bun run dev
```

The web app's normal dev script uses portless. The main checkout serves at
`http://amend.localhost:1355`; linked worktrees serve at
`http://$(basename "$PWD").localhost:1355` while Convex runs alongside them.

With `bun run dev` still running, run the product smoke gate:

```bash
bun run smoke
```

The smoke gate verifies the portless web URL, public portal, Convex REST portal API,
SDK portal/plans read path, brand artifacts, and integration docs.

For the full local quality gate, run:

```bash
bun run check
```

That runs lint, read-only formatting check, typecheck, and the Bun test suite.

To verify the local AI/agent-ready contract, run:

```bash
bun run agent-ready
```

After a production build, verify the generated web and docs artifacts:

```bash
bun run agent-ready:built
```

After `amend.sh` is registered/delegated and both production hosts are deployed, run the live gate:

```bash
bun run agent-ready:production
```

That command runs strict production readiness, built artifact validation, and the live public gate.
To summarize missing production env and DNS blockers without printing secret values, run:

```bash
bun run agent-ready:status
```

Use `bun --silent run agent-ready:status:json` or
`bun --silent scripts/agent-ready-status.ts --json --json-file agent-ready-status.json` when CI
needs a structured no-secret preflight report with machine-readable `blockers` and `nextGates`.
The artifact includes a `$schema` field documented in `docs/agent-ready-status-report.schema.json`;
validate a saved status artifact with
`bun run agent-ready:status:validate-report agent-ready-status.json`; add `--require-ok` when CI
should fail unless the no-secret status is blocker-free.
Use `bun run agent-ready:next-steps` when an operator needs the same no-secret env, deployment,
and DNS blockers as a short checklist. Use
`bun --silent scripts/agent-ready-next-steps.ts --json --json-file agent-ready-next-steps.json`
when CI needs that checklist as an artifact. The artifact keeps the flat env list, records safe
public production values, groups missing values into web deployment and Convex deployment steps, and includes deploy/host-attachment steps
before DNS wiring. It includes a `$schema` field documented in
`docs/agent-ready-next-steps-report.schema.json`; validate a saved checklist with
`bun run agent-ready:next-steps:validate-report agent-ready-next-steps.json`; add `--require-ok`
when CI should fail unless the checklist is blocker-free.

If you only need to recheck the already-deployed public hosts, run:

```bash
bun run agent-ready:live
```

Use `bun --silent run agent-ready:live:json` when CI or a deployment log should capture the same
checks as a structured report, or
`bun --silent scripts/agent-ready-live.ts --json --json-file agent-ready-live-report.json` when it
should be saved as an artifact. The artifact includes a `$schema` field documented in
`docs/agent-ready-live-report.schema.json`; validate it with
`bun run agent-ready:live:validate-report agent-ready-live-report.json`. Use
`bun --silent run agent-ready:production:json` when CI should
emit one combined JSON report for strict readiness, built artifact validation, status blockers, and
the live gate. Use
`bun --silent scripts/agent-ready-production.ts --json --json-file agent-ready-production-report.json`
when the deploy system needs that combined report saved as an artifact file. The report includes a
`$schema` field, and the artifact shape is documented in
`docs/agent-ready-production-report.schema.json` and exposed at the production report schema
endpoint. Validate a saved report with
`bun run agent-ready:production:validate-report agent-ready-production-report.json`; add
`--require-ok` when the launch gate should fail unless `ok` is `true` and `blockers` is empty.
Use `bun run agent-ready:refresh-report` when CI should refresh the saved report, sync the audit
timestamps, validate the artifact, run the completion audit in production-blocker-tolerant mode, and
still exit red while production blockers remain. Use `bun run agent-ready:final-gate` after
production env and DNS are ready to regenerate the saved reports, run the strict completion audit,
refresh and validate the no-secret status and next-steps reports, require the production, live,
status, completion audit, and next-steps reports to be green, and verify synced audit evidence. Use
`bun run agent-ready:completion-audit` as the
strict prompt-to-artifact gate; it exits non-zero until strict readiness, production env, the live
validator, and the saved production report are all green. Use
`bun --silent scripts/agent-ready-completion-audit.ts --json --json-file agent-ready-completion-audit-report.json`
when CI needs the completion checklist as a JSON artifact. That report also includes a `$schema`
field, and its artifact shape is documented in
`docs/agent-ready-completion-audit-report.schema.json` and exposed at the completion audit report
schema endpoint. Validate it with
`bun run agent-ready:completion-audit:validate-report agent-ready-completion-audit-report.json`;
add `--require-ok` when CI should fail unless the completion audit is fully green.
After saving a report, run `bun run agent-ready:sync-audit agent-ready-production-report.json` to
sync the launch audit timestamps, then `bun run agent-ready:audit:check` to validate the saved
production, live, status, completion audit, and next-steps reports and confirm the audits are
synced to the production report.

The live gate checks registration, DNS delegation, A/AAAA/CNAME DNS records, final response origin,
`robots.txt`, `sitemap.xml`, unique on-origin sitemap locs, `llms.txt` links aligned to the matching
sitemaps, docs `llms-full.txt`, expected content types, absence of `Disallow:` and
named AI crawler exceptions in robots files, absence of private app routes in the web sitemap,
AI/search/user-agent access for OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
ClaudeBot, PerplexityBot, Perplexity-User, Googlebot, Google-Extended, Bingbot, CCBot, and GPTBot
on public web and docs pages, absence of API routes in the docs sitemap, absence of `noindex` on
public HTML, absence of public `X-Robots-Tag: noindex`, homepage canonical/Open Graph/Twitter
metadata and
parseable JSON-LD, crawlable canonical/Open Graph HTML for every web sitemap page, private-route
`noindex`, docs root canonical/Open Graph/parseable WebSite JSON-LD HTML, and docs index
canonical/Open Graph/parseable TechArticle JSON-LD HTML plus the production, live, status,
completion audit, and next-steps report schema endpoints for `amend.sh` and `docs.amend.sh`.

## Convex Setup

This project uses Convex as a backend. The default setup path is agent/worktree-friendly:
each checkout gets its own cloud dev deployment named `dev/$USER/$(basename "$PWD")` under the
selected Convex project, auto-expiring in 3 days, and then copied into the web app env.

```bash
bun run dev:setup
```

The selected command is:

```bash
bunx convex deployment create --type dev --select dev/$USER/$(basename "$PWD") \
  --expiration "in 3 days"
```

Override the project prefix or worktree naming when needed:

```bash
CONVEX_DEV_PROJECT_REF=team-slug:project-slug bun run dev:setup
bun run dev:setup -- --expiration "in 2 days"
bun run dev:setup -- --worktree-name my-feature
```

Then it runs `convex dev --once --tail-logs disable`, seeds safe default Convex env vars for the
worktree-local URL, and writes `apps/web/.env` from the generated `packages/backend/.env.local`
`CONVEX_URL` and `CONVEX_SITE_URL`.

For local anonymous deployments instead of cloud dev deployments, run:

```bash
bun run dev:setup:local
```

Convex CLI can also auto-create a local anonymous deployment in non-interactive terminals with
`bunx convex dev --once`; `bun run dev:setup:local` keeps Amend's web env sync on top of that.
PostHog browser analytics defaults to the Amend US Cloud project token in code and can be
overridden with `VITE_POSTHOG_TOKEN`, `VITE_POSTHOG_HOST`, and `VITE_POSTHOG_PROJECT_ID`.
Browser exception autocapture and the root React error boundary also report to PostHog error
tracking. Production and preview builds emit Vite sourcemaps, inject PostHog release metadata into
the deployed Vercel assets, and upload sourcemaps when `POSTHOG_CLI_API_KEY` is set in CI.
The web app emits explicit lifecycle events such as `user signed up`, `user signed in`,
`user signed out`, `project created`, and `project source connected` so PostHog workflows can
trigger on semantic product activity instead of autocaptured clicks.
Backend product-loop events are stored in Convex `eventRecords`, forwarded through the Convex
PostHog component, and surfaced in the in-house Analytics dashboard. New product-loop features
should record an analytics event with `recordAnalyticsEvent` and add the event to
`packages/backend/convex/amendAnalyticsEvents.ts` so dashboard categories and PostHog metadata stay
aligned.

Set local Convex auth environment variables:

```bash
bunx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
bunx convex env set SITE_URL http://$(basename "$PWD").localhost:1355
bunx convex env set GITHUB_WEBHOOK_SECRET "replace-with-your-github-webhook-secret"
bunx convex env set AMEND_API_TOKEN "$(openssl rand -base64 32)"
bunx convex env set POSTHOG_API_KEY "phc_BCb25jVTo59jtEMPysgGUvgt85bUYGwN8XBNA2oMNLY7"
bunx convex env set POSTHOG_HOST "https://us.i.posthog.com"
```

Then, run the development server:

```bash
bun run dev
```

Open `http://$(basename "$PWD").localhost:1355` in your browser to see the web application.
Open `http://docs.$(basename "$PWD").localhost:1355` for the Fumadocs site.
Your app will connect to the configured Convex deployment automatically.

The normal `bun run dev`, `bun run dev:web`, and `bun run dev:docs` commands set
`WORKTREE_NAME=${WORKTREE_NAME:-$(basename "$PWD")}` and use portless. The web app reads
`VITE_DOCS_URL` for docs links. Local development defaults to the matching
`http://docs.$WORKTREE_NAME.localhost:1355/docs`; this launch uses `https://docs.amend.sh/docs` in
production.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

Prefer `bunx` for one-off tooling in this repo.

Import shared components like this:

```tsx
import { Button } from "@amend/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Git Hooks and Formatting

- Full read-only gate: `bun run check`
- Format and lint fix: `bun run fix`

## Open Source And Self-Hosting

Amend.sh is MIT licensed. The local/self-host posture is source-linked and no-trust by default:
GitHub events, customer signals, AI decisions, roadmap changes, changelog drafts, and delivery
records stay in your Convex deployment. External providers only receive the data needed for the
feature you enable, such as GitHub webhook payloads, BYO AI drafting input, Resend email delivery
payloads, or Stripe checkout/webhook records. Keep provider keys unset to use local dry-run paths.

## Project Structure

```
amend/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── backend/     # Convex backend functions and schema
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run dev:web`: Start the web app at `http://$(basename "$PWD").localhost:1355`
- `bun run build`: Build all applications
- `bun run build:size`: Check the largest built client chunk stays under the local size budget
- `bun run smoke`: Verify the portless web app, portal, Convex REST API, SDK, and docs while `bun run dev` is running
- `bun run readiness`: Report local wiring and missing production provider/env setup
- `bun run readiness:strict`: Fail when production-required env vars are missing from the current process
- `bun run check`: Run lint, formatting check, typecheck, and tests
- `bun run dev:setup`: Setup and configure your Convex project
- `bun run check-types`: Check TypeScript types across all apps
- `bun run fix`: Apply Oxlint fixes and Oxfmt formatting
