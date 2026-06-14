# Agent Guidelines — Docs (`apps/fumadocs`)

This is the canonical public documentation for Amend. When a feature changes, the docs change with it — see **Documentation Sync** in the repo-root `AGENTS.md` for the core rule. This file tells you _which page_ to update and _when_.

## Scope

- Edit **content** only: `content/docs/*.mdx` and `content/docs/meta.json`.
- Do **not** change the Fumadocs framework, `source.config.ts`, app routing, layouts, search, or build config as part of feature work. A docs migration is a separate, explicit task.
- New pages must be registered in `content/docs/meta.json` (the `pages` array is the sidebar order).

## When a docs edit is required

Update docs in the same change when your work alters anything a user or integrating agent can **observe**:

- A customer-facing surface (portal, feedback board, voting/comments/reactions, update feeds, embed panel)
- A REST route (`/api/v1/*`) or SDK method (`packages/sdk`, the `Amend` class)
- A CLI command or flag (`packages/cli`)
- An automation rule, AI drafting behavior, proactive-agent behavior, or delivery/safety gate
- A config value, env var, provider key, auth scope/token tier, or default
- A setup, onboarding, deploy, domain, or launch step
- The observable behavior or wording of any documented workflow

You do **not** need a docs edit for a pure internal refactor, rename, or perf change with no observable difference.

## Feature → doc-page map

The docs are organized by **job in the loop** (intake → evidence → review → publish), not by UI screen. Find the surface you touched and update the page(s) that own it.

| Feature / code area | Owning page(s) |
| --- | --- |
| Feedback inbox, posts board, post composer, voting, comments, reactions | `feedback/triaging.mdx`, `feedback/collecting.mdx` (+ `api-reference.mdx`) |
| Feedback intake — portal form + `feedbackMode`, SDK `submitRequest`, imports | `feedback/collecting.mdx` (+ `customer-surfaces.mdx`) |
| Embed panel — `createAmendPanel`, `packages/sdk` `embed.ts` | `customer-surfaces.mdx` |
| Roadmap board, drag/drop, priorities, item detail; status values + API mapping | `roadmap/managing.mdx`, `roadmap/index.mdx` (+ `source-trace.mdx`) |
| Public roadmap visibility (`roadmapVisibility`), voting, `GET /roadmap` | `roadmap/public.mdx` |
| Changelog editor, statuses, categories, versions, publish + email toggles | `changelog/writing.mdx` |
| AI changelog drafting (`draftChangelog`, `POST /drafts`, CLI `changelog draft`) | `changelog/ai-drafting.mdx` (+ `automation.mdx` for provider keys) |
| Source events — GitHub / Slack / Discord / Linear / CSV imports, event kinds, idempotency | `source-events.mdx` |
| Automation rules, proactive agent, build briefs, decisions, delivery safety | `automation.mdx` |
| SDK surface (`Amend` class methods) | `api-reference.mdx` (+ `customer-surfaces.mdx` for client read/write methods) |
| REST HTTP actions (Convex `/api/v1`), webhooks, auth tiers | `api-reference.mdx`, `integration.mdx` |
| CLI commands (`packages/cli`) | `source-events.mdx` (imports) — no dedicated CLI page yet; see Gaps |
| Settings UI (general, services, portal, automation, accounts) | `integration.mdx` (portal/services), `self-hosting.mdx` (env) |
| Onboarding / project-setup wizard | `quickstart.mdx` |
| Env vars, provider keys, model policy, deployment pieces | `self-hosting.mdx` |
| Domains, Vercel proxy, `amend.sh/docs` routing, `llms.txt`, schemas | `production-routing.mdx` |
| Auth scopes / token tiers (public / webhook / owner) | `integration.mdx`, `api-reference.mdx` |
| Pre-launch gates (typecheck, smoke, DNS, billing, email) | `launch.mdx` |
| Local dev loop (`bun run dev:setup`, prove one full loop) | `quickstart.mdx` |

## Gaps — built but undocumented

These features ship in the app but have no owning page. If you touch one, add a page (and register it in `meta.json`) rather than wedging it into an unrelated page:

- **Analytics workspace** (`analytics-workspace*.tsx`) — no public page
- **Full CLI reference** — every `packages/cli` subcommand; only import-related usage is covered today
- **Full SDK method reference** — the `Amend` class has ~25+ methods; only a subset is documented
- **Settings UI walkthrough** — services, portal settings, automation rules as configured in the dashboard

Internal-only surfaces (brand guidelines page, brand menu, admin sidebar) are **not** public docs — do not document them here.

## Style

- Match the existing voice: terse, source-linked, written for a maintainer or coding agent verifying what actually runs.
- Keep the loop framing (intake / evidence / review / publish) — don't reorganize docs around UI screens.
- Use relative links between pages (e.g. `[Source events](source-events.mdx)`), Fumadocs `<Cards>`/`<Card>` for hubs, and tables for surface/route/auth maps, as existing pages do.
- Don't hardcode the docs origin in product code — that's `VITE_DOCS_URL`.
