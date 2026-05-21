# Agent-Ready Domain Setup

Use this checklist after the local agent-ready work passes and before calling the public site ready.

## Current Blocker

`amend.sh` is not registered or delegated yet. The live gate currently fails before it can fetch any
public agent-ready files:

```bash
bun run agent-ready:live
```

Expected current failure until the domain is registered:

- `web apex is registered`
- `web apex is delegated`
- `web DNS resolves`
- `docs apex is registered`
- `docs apex is delegated`
- `docs DNS resolves`

## Required External Setup

1. Register `amend.sh` with a domain registrar.
2. Delegate `amend.sh` to the DNS provider that will manage production records.
3. Deploy the web app and attach `amend.sh` to that deployment.
4. Deploy the docs app and attach `docs.amend.sh` to that deployment.
5. Add the required A/AAAA or CNAME DNS records from the hosting provider:
   - `amend.sh` should point to the web deployment.
   - `docs.amend.sh` should point to the docs deployment.
   - If the apex uses a provider-specific ALIAS/ANAME/flattened CNAME, it should resolve as A/AAAA
     answers in the checks below.
6. Set production environment values for the deployments. The minimum app/domain values are:
   - `VITE_CONVEX_URL`
   - `VITE_CONVEX_SITE_URL`
   - `VITE_DOCS_URL=https://docs.amend.sh/docs`
   - `SITE_URL=https://amend.sh`
7. Load the remaining production provider secrets required by `bun run readiness:strict`:
   - `BETTER_AUTH_SECRET`
   - `GITHUB_WEBHOOK_SECRET`
   - `GITHUB_APP_ID`
   - `GITHUB_APP_SLUG`
   - `GITHUB_APP_CLIENT_ID`
   - `GITHUB_APP_CLIENT_SECRET`
   - `GITHUB_APP_PRIVATE_KEY`
   - `AMEND_API_TOKEN`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `CROF_API_KEY`
   - `CROF_MODEL`
   - `CROF_BASE_URL`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
8. Confirm DNS answers exist before rerunning the live gate:

```bash
dig +short NS amend.sh
dig +short A amend.sh
dig +short AAAA amend.sh
dig +short CNAME amend.sh
dig +short A docs.amend.sh
dig +short AAAA docs.amend.sh
dig +short CNAME docs.amend.sh
```

For a single no-secret summary of production env and DNS blockers, run:

```bash
bun run agent-ready:status
```

Use the JSON form when CI needs a durable no-secret preflight artifact:

```bash
bun --silent run agent-ready:status:json
```

```bash
bun --silent scripts/agent-ready-status.ts --json --json-file agent-ready-status.json
```

The status JSON includes the same high-level `blockers` shape used by the live gate plus
`nextGates`, but without printing secret values.
It also includes a `$schema` field documented in `docs/agent-ready-status-report.schema.json`;
validate a saved status artifact with
`bun run agent-ready:status:validate-report agent-ready-status.json`; add `--require-ok` when CI
should fail unless the no-secret status is blocker-free. 9. If DNS still looks empty, confirm registration and recursive resolver state:

```bash
whois -h whois.nic.sh amend.sh
curl -fsS 'https://cloudflare-dns.com/dns-query?name=amend.sh&type=A' \
  -H 'accept: application/dns-json'
curl -fsS 'https://cloudflare-dns.com/dns-query?name=docs.amend.sh&type=A' \
  -H 'accept: application/dns-json'
```

`Domain not found` from WHOIS or `Status: 3` from Cloudflare DNS-over-HTTPS means the public gate
is still blocked before it can fetch the agent-ready files.

10. After `bun run build`, run the complete production agent-ready gate:

```bash
bun run agent-ready:production
```

This command runs strict production readiness, built artifact validation, and the live public gate in
sequence.

11. To inspect the deploy artifact check separately, run:

```bash
bun run agent-ready:built
```

12. In the production environment with deployment secrets loaded, run strict readiness:

```bash
bun run readiness:strict
```

13. Run the live gate:

```bash
bun run agent-ready:live
```

Use the JSON form when a deploy system or launch checklist needs a durable machine-readable report:

```bash
bun --silent run agent-ready:live:json
```

Use `--json-file` when CI or a launch run needs an artifact file:

```bash
bun --silent scripts/agent-ready-live.ts --json --json-file agent-ready-live-report.json
```

The saved live report includes a `$schema` field documented in
`docs/agent-ready-live-report.schema.json`; validate it with:

```bash
bun run agent-ready:live:validate-report agent-ready-live-report.json
```

Use the stricter launch form when every live fetch/DNS check must be passing:

```bash
bun run agent-ready:live:validate-report agent-ready-live-report.json --require-ok
```

Use the full production JSON form when CI should emit one combined report for strict readiness, built
artifact validation, no-secret status blockers, and the live gate:

```bash
bun --silent run agent-ready:production:json
```

Use the direct script form when the combined production report should be saved as an artifact file:

```bash
bun --silent scripts/agent-ready-production.ts --json --json-file agent-ready-production-report.json
```

Use the refresh wrapper when CI should save the report, sync the launch audits, validate the
artifact, and still return the production gate status:

```bash
bun run agent-ready:refresh-report
```

After production env and DNS are ready, use the strict final gate to regenerate the saved reports,
run the strict completion audit, refresh and validate the no-secret status report, require the
production, live, status, and completion audit reports to be green, and verify synced audit
evidence:

```bash
bun run agent-ready:final-gate
```

Run the completion audit when you need one prompt-to-artifact gate that checks the source artifacts,
saved production report, strict readiness status, live result, and documented handoff together:

```bash
bun run agent-ready:completion-audit
```

This audit intentionally exits non-zero until strict readiness, production env, live DNS/fetch
checks, and the saved production report are all passing.

Use JSON output when CI needs to archive the prompt-to-artifact checklist:

```bash
bun --silent scripts/agent-ready-completion-audit.ts --json --json-file agent-ready-completion-audit-report.json
```

The refresh wrapper runs the same audit with `--allow-production-blockers`, so source/artifact
regressions still fail while the command keeps returning the production gate status during the
domain/env setup period.

The report includes a `$schema` field, and the artifact shape is documented in
`docs/agent-ready-production-report.schema.json` and exposed at the production report schema
endpoint. The no-secret status artifact is documented in
`docs/agent-ready-status-report.schema.json` and exposed at the status report schema endpoint. The
completion audit JSON artifact also includes a `$schema` field documented in
`docs/agent-ready-completion-audit-report.schema.json` and exposed at the completion audit report
schema endpoint. Validate it with
`bun run agent-ready:completion-audit:validate-report agent-ready-completion-audit-report.json`;
add `--require-ok` when the handoff should fail unless the completion audit is fully green.
Validate the status artifact with
`bun run agent-ready:status:validate-report agent-ready-status.json --require-ok` when the handoff
should fail unless production env and DNS are both ready.
Validate a saved report with:

```bash
bun run agent-ready:production:validate-report agent-ready-production-report.json
```

The normal validator checks the report schema plus internal consistency: step `ok` values must
match their exit codes, live `passed`/`total` counts must match its checks, and top-level `ok` must
match the step results.

Sync and verify the launch audits from the saved report:

```bash
bun run agent-ready:sync-audit agent-ready-production-report.json
bun run agent-ready:audit:check
```

`bun run agent-ready:audit:check` validates the saved production, live, status, and completion audit
reports before checking that launch audit evidence is synced to the production report and that the
standalone live report matches the embedded production live report except for
`checkedAt`.

Use the stricter launch form when the report must be passing:

```bash
bun run agent-ready:production:validate-report agent-ready-production-report.json --require-ok
```

Treat the combined production JSON report as passing only when:

- `ok` is `true`.
- `blockers` is empty.
- Every entry in `steps` has `ok: true`.

For the nested live report, `passed` must equal `total` and every entry in `checks` must have
`ok: true`.

The live gate must pass before the public `amend.sh` and `docs.amend.sh` surfaces are considered
agent-ready.

## Preview Validation

Use alternate origins to validate preview deployments before the real domain is attached:

```bash
AMEND_WEB_ORIGIN=https://your-web-preview.example.com \
AMEND_DOCS_ORIGIN=https://your-docs-preview.example.com \
bun run agent-ready:live
```

This is a preview-only check, not a substitute for the required `amend.sh` / `docs.amend.sh`
production pass. The preview hosts still need DNS and must serve artifacts whose absolute URLs match
the supplied preview origins, including final response origins, `robots.txt`,
`sitemap.xml`, unique on-origin sitemap locs, `llms.txt` links aligned to the matching sitemaps,
docs `llms-full.txt`, expected content types, absence of `Disallow:` and
named AI crawler exceptions in robots files, absence of private app routes in the web sitemap,
AI/search/user-agent access for OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
ClaudeBot, PerplexityBot, Perplexity-User, Googlebot, Google-Extended, Bingbot, CCBot, and GPTBot
on public web and docs pages, absence of API routes in the docs sitemap, absence of `noindex` on
public HTML, absence of public `X-Robots-Tag: noindex`, homepage canonical/Open Graph/Twitter
metadata, parseable JSON-LD, crawlable canonical/Open Graph HTML for every web sitemap page,
private-route `noindex`, docs root canonical/Open Graph/parseable WebSite JSON-LD HTML, docs index
canonical/Open Graph/parseable TechArticle JSON-LD HTML, and the production/live/status/completion
audit report schema endpoint surfaces.
