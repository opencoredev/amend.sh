# Proactive Agent v2 — Refactor, Signal Bus, Loop Closing, Receipts

Status: planning doc (2026-07-01, rev 2 — adds the refactor phase from the three-agent audit).
This doc drives the multi-agent build waves. Companion: `packages/backend/convex/` (pipeline), `apps/gateway/`.

## 0. Audit verdict (evidence-backed, 2026-07-01)

**Keep — genuinely good, do not churn:** pipeline dedupe (`proactivePipelineEvents.dedupeKey` idempotency), `recomputeNeedProof`, `resolvePersonForEvidence` identity graph, `findCompatibleNeed` two-pass clustering, Ed25519/HMAC verification, auth pattern (`requireDashboardUser` → workspace check), changelog scheduler, motion system (`t-*` + `useDisclosureTransition`), `statusMeta` single source, icon wrapper (zero violations), `PageHeader` chrome, settings primitives, `amend-agent-shared.tsx` primitives.

**Slop — confirmed:** 2 live bugs (roadmap auto-ship ignores automation rules; deliveryOutbox never drains), 1 dead legacy ingest path, dead table (`needVectors`), 178-line fake-data legacy handler, 174 flat backend files w/ 3 naming conventions + barrel chains, hand-copied FE types (`amend-contract.ts`) while generated `_generated/api.d.ts` goes unused, data-layer misnomer (mock-named but fully live; renamed to `amend-data.ts`), 11-file type-barrel explosion, 3 competing auth-gating patterns, dead `analytics-workspace*` components, dead `gsap` dep, `#151518` hardcoded in 15 files, `.env.example` gaps, CI missing lint/test steps.

---

## Phase 0 — Fixes & de-slop (before any feature wave)

### 0A. Bug fixes (S each, do first)
1. **Roadmap auto-ship guard** — `amendSourceIngestRelations.ts:150` patches `status: "shipped"` unconditionally; mirror the feedback path: `canAutoUpdateRoadmap ? "shipped" : item.status`.
2. **deliveryOutbox cron drain** — add 1-minute cron; today queued emails (anything not published inline) sit forever.
3. **Delete `/ingest/discordWebhook` legacy path** (`http.ts:31`, `ingest.ts:28-46`) — routes to old public `createFeedback` instead of the pipeline; also defaults traffic into the demo workspace. Audit `ingestSourceEvent` public mutation for deadness at the same time.
4. **Channel enum forward-fix** — add `"slack"` (+ planned channels) to `proactiveSourceChannelValue`; replace hand-copied `isSourceChannel` in `pipeline.ts:218` with the validator-derived list (two sources of truth today).
5. **`memoryRules` index** — add `by_workspace_and_sourceNeedId` (restoreGhost currently collects all rules and JS-filters); bound the per-event `isSuppressedByMemory` collect.

### 0B. Dead code removal (S each)
6. Delete `needVectors` table (zero reads/writes; index overhead).
7. Delete `amendLegacyWorkspaceHandler.ts` + `amend.getWorkspace` (178 lines of fabricated data; confusable with `getWorkspaceSettings`).
8. Delete `analytics-workspace.tsx` + `analytics-workspace-panels.tsx` (superseded by `AmendInsightsScreen`, zero external importers).
9. Delete `MockOverride`/`setMockOverride` dead exports; remove `gsap` from `apps/web` deps (zero imports).
10. `ensureChannelPlaceholders` out of the hot path (6 queries per write mutation) → run once at workspace provisioning.

### 0C. Type safety spine (M — the one structural refactor worth doing before waves)
11. **Adopt generated Convex API types in web.** `@amend/backend` workspace dep is already declared and `_generated/api.d.ts` exists — replace every stringly `makeFunctionReference("module:fn")` in `amend-dashboard-data.tsx` (+ the inline one in `amend-connections-screen.tsx`) with `api.module.fn`. Backend renames then break the FE at compile time. Turbo order: backend codegen before web typecheck.
12. **Shrink `amend-contract.ts` to UI-only shapes** — stop hand-syncing backend shapes ("copied verbatim from the CONTRACT block" comment goes away); derive from generated types where possible.
13. **Rename the mock-named data layer → `lib/amend-data.ts`** (5 importers). It is the live data layer; the old name actively misrouted agents and humans.
14. **One auth-gating pattern** — extract `useAuthedQuery` to `lib/convex-utils.ts`; kill the `hasSession`-prop threading in `use-amend-dashboard-data.ts` and the ungated raw `useQuery` in the connections screen.

### 0D. Backend directory reorg (M, mechanical, safe)
15. Reorganize ~140 handler/helper/schema files into folders (`pipeline/`, `ingest/`, `workspace/`, `content/`, `delivery/`, `agent/`, `demo/`, `lib/`, `schema/`) per the audit's target tree. **Hub modules stay at root unchanged** (`amend.ts`, `needs.ts`, `memory.ts`, `drafts.ts`, `digest.ts`, `sources.ts`, `tags.ts`, `projects.ts`, `changelog.ts`, `http.ts`, `crons.ts`) so every public Convex api path is stable — zero client breakage. Kill the barrel chains (`amendWorkspace.ts`, `amendFeedbackMutationHandlers.ts`, `amendNotificationMutationHandlers.ts`, `amendDemoData.ts`); 7 demo files → 2. 174 files → ~60-70.
16. Collapse the web type-barrel explosion: 11 `amend-dashboard-*` type files → 3 (`amend-types.ts`, `amend-content-types.ts`, `amend-contract.ts`); one home for `fallbackWorkspace`.

### 0E. Hygiene (S each, batchable)
17. CI: add `bun run lint` (oxlint) + `bun test` steps to preview/production workflows; add fumadocs build check to preview.
18. `.env.example` gaps: backend (`POSTHOG_PERSONAL_API_KEY`, preview-auth vars, build/version vars as documented-optional), discord-gateway (`DISCORD_LISTEN_GUILD_IDS`, `DISCORD_DEBUG`), web (`VITE_DISCORD_INSTALL_URL`, version vars — and route them through `@amend/env` instead of raw `import.meta.env`).
19. Backend tsconfig: `noUnusedLocals` + `noUnusedParameters` (only workspace missing them).
20. Design token for the inset-control surface: `--amend-inset: #151518` + Tailwind alias; replace 15 hardcoded uses. (Memory note: this hex is ALSO the inset-control color — never warm the surface token alone.)
21. Dep dedupe: `sonner`/`@hugeicons/*` declared in both web and `@amend/ui` (keep one), fumadocs `zod` → catalog, align nitro beta pins.
22. Refresh `docs/brand.md` (still describes the old zero-radius mono system; actively misleading).

---

## 1. Architecture: the Signal Bus (build once)

The pipeline is already channel-agnostic (`trustedIngestSourceEvent` → `pipeline.processEvent` → `commitProcessedEvent`: dedupe → classify → memory suppression → person resolution → need clustering → proof recompute; single seam `channelFromProvider()`). Channel-specific by design: transport + auth + ack.

### 1.1 Canonical `InboundSignal` contract

```ts
type InboundSignal = {
  provider: SourceProvider            // "discord" | "slack" | "email" | "x" | ...
  externalId: string                  // provider-unique, drives dedupe
  routingKey: string                  // guildId, team_id, "owner/repo", inbound address…
  author: { id?: string; name: string; handle?: string; avatarUrl?: string; email?: string }
  content: { title?: string; body: string; url?: string; labels: string[] }
  thread?: { id: string; parentId?: string }
  kind: SourceEventKind
  occurredAt: number
  capabilities: { canAck: boolean; canReply: boolean }
}
```

One `/ingest/signal` endpoint (bearer, timing-safe) for workers; signed webhooks (GitHub HMAC, Slack signing secret, Resend) normalize into the same internal mutation.

### 1.2 `channelRoutes` table (kills `DISCORD_DEFAULT_WORKSPACE_SLUG`)

`{ workspaceId, provider, routingKey, config }`, index `by_provider_and_routingKey`. Written during connect flows (Discord install → guildId; Slack → team_id; email → inbound alias). Per-route config: `{ ackReaction: boolean, listenChannels?: string[] }` — the consent/reaction toggle, surfaced in Connections.

### 1.3 Connector = 4 functions, 3 runtimes

`verify(request)` | `connect()`, `normalize(raw) → InboundSignal`, `route(raw) → routingKey`, `ack(signal, verdict)`.

| Runtime | For | Where |
| --- | --- | --- |
| Webhook | GitHub ✅, Slack Events, inbound email (Resend), Intercom, Zendesk, Linear, Sentry, Stripe, widget | Convex `http.ts`, ~80 lines each |
| Socket | Discord (today), Telegram | `apps/gateway` (generalized discord-gateway): shared forwarder (10s abort, 2× retry, LRU dedupe by externalId, concurrency cap ~8) + connector modules |
| Poll | X mentions, Reddit/HN watch, app-store reviews, G2 | Convex crons → executor `POST /executions` (one tool-catalog call instead of N API clients) |

### 1.4 Shared triage

`classifyMessage` moves out of `convexDiscordMessages.ts` → `signalTriage.ts`: one LLM action for all conversational providers (provider hint is a parameter, not a fork); keyword fast-path stays for structured events. OpenRouter option next to crof; fail-closed; 12s abort. The `processEvent` action wrapper (currently pass-through) is where triage lives — that's why it stays.

## 2. Channel menu

Wave 1: GitHub ✅ · Discord ✅ (restructure) · **Slack** · **inbound email** · **embed widget**.
Wave 2: X/Twitter (poll) · Intercom · Reddit+HN watch · Telegram · app-store reviews · Zendesk/Crisp/Plain.
Wave 3: call transcripts (Gong/Grain/Fireflies) · G2/Capterra · Stripe cancellation reasons · PostHog surveys/replays · YouTube/Product Hunt · Canny/CSV import (migration wedge).

## 3. Inbox rethink: ghosts live in Feedback

- **Ghost posts** at the top of Posts ("Surfacing" band): dashed ring, low opacity, gold pulse, "Found by Amend · 2h ago", proof chips; inline Accept (materializes post, carries evidence/people, optional roadmap item) / Dismiss (memory rule, existing `killGhost`). `t-*` motion for ghost → solid.
- **Proof column** on every row: channel glyphs + counts, people count, avatar stack (`authorAvatarUrl`), paying badge, 7-day growth tick. Detail keeps person-first evidence + proof rail. New `ProofChip` slots into `amend-agent-shared.tsx`.
- **Drafts relocate**: changelog drafts → Changelog view; notify drafts → post/need detail ("12 people to notify — review").
- **Sidebar**: Posts inherits the review badge; `inbox` aliases to `posts`; digest content lives in Insights.
- **Portal**: proof on rows (privacy toggle per workspace), **receipts** on shipped ("requested Jun 2 → shipped Jun 28"), changelog cross-links, per-entry changelog URLs with real SEO/OG.
- Fix while here: ghost drafts are literal template strings today (`needs.ts:82` "Draft a customer-safe update for: …") — replace with real generation (see §5).

## 4. Close the loop

- **Stage 0 (MVP)**: accepted need → `buildBriefs` (exists) written by the agent (problem, top quotes, acceptance criteria, suggested files). Actions: copy brief · **create GitHub issue** (App installed) · `cursor://` deep link · send to Linear (executor).
- **Stage 1**: ship `.github/workflows/amend.yml` template (claude-code-action) via the App; "Build this" = issue + `amend-build` label → CI agent opens PR referencing the need key → existing merged-PR ingest closes the loop (need → shipped → changelog → notify).
- **Stage 2**: hosted runners (Cursor Background Agents / Claude Code SDK / Devin) behind the same brief contract. (executor is NOT this — it's a tool gateway.)
- **Ack upgrade**: 👀 on capture → **✅ + thread reply with changelog link on ship** (approval-gated, per-route toggle).
- Data prerequisite (fold into this lane): `findRelatedFeedback/Roadmap` `.take(100)` scans → proper link model; pick ONE owner for feedback↔roadmap links (join table `itemLinks` or single-side array — today both sides exist and neither is maintained by mutations).

## 5. Changelog: auto-gen for real

1. **Body**: shipped event → LLM action reads PR title/body/commits + linked issue + need evidence + workspace voice profile → writes title/body/summary/tags into the draft (replaces placeholder in `upsertChangelogDraft`; add the missing `autoDraftChangelog` rule check). Review gate stays.
2. **Cover**: `ChangelogCover` Satori layout (brand colors/logo via context.dev, title, category) auto-attached; `/api/og/changelog/:slug`; per-entry SEO route.
3. **Delivery**: outbox cron (Phase 0A) + real template (cover, body, portal deep link, working unsubscribe) + audiences: subscribers / **the people who asked** (evidence → persons.verifiedEmail + channel pings) / everyone. Type `deliveryOutbox.payload` (currently `v.any()` blind-cast by the email runtime — silent-failure risk).
4. **Roadmap**: accept-ghost can create linked roadmap item with **priority from proof** (thresholds in `automationRules`, customizable — "50 users ⇒ P0"). Linear bi-sync via executor (export first).
5. Wire `useInsights()` live (static zeros today) — same lane, same data.

## 6. External services

### executor (key verified 2026-07-01)
MCP tool gateway (NOT a coding-agent runner): `execute` tool over a QuickJS sandbox + tool catalog (MCP/OpenAPI/GraphQL) + per-tool policies/approvals. Product-side surface is plain REST: `POST /executions` with `autoApprove: true` from Convex actions — powers outbound integrations (Linear/Jira export, long-tail sends) + poll connectors. Two deployments available:
- **Cloud**: org `leo-s-organization` — key in `packages/backend/.env.local` (`EXECUTOR_API_TOKEN`) + root `.mcp.json` (both gitignored). Free 10k executions/mo.
- **Self-hosted (CF Worker)**: `executor-cloudflare.leoisadev.workers.dev` (`EXECUTOR_SELF_HOSTED_MCP_URL`) — pending Zero Trust Access app + AUD redeploy; headless auth via `CF-Access-Client-Id/Secret` service-token headers once set. Same API surface; prefer it when Access is live, cloud as fallback.
- Multi-tenant later: per-workspace connections via `POST /connections`.

### context.dev (no key yet — free tier 500 credits)
Brand intelligence + web extraction (ex-brand.dev): domain → logos/colors/description/socials (10cr); `GET /web/styleguide` → typography/spacing/component CSS (10cr); scrape-to-markdown (1cr); schema extraction (10cr). `Authorization: Bearer ctxt_secret_…`; MCP `https://context-dev.stlmcp.com`.
Uses: onboarding magic (domain → themed portal + prefilled workspace + agent brand context — replaces/enriches `suggestProject`), changelog voice profile (cached per workspace), signal URL enrichment, waitlist/signup prefill by work email.

## 7. Build waves — Fable subagent lanes

Every lane = builder + adversarial reviewer (max thinking, async). Wave gate: `bun run check-types && bun run lint && bun run build` + convex codegen clean. UI lanes carry the design brief + anti-slop constraints; screenshot review when a browser is allowed.

**Wave 0 — Refactor (parallel-safe split)**
- R1: 0A bugs + 0B dead code (backend)
- R2: 0C type spine (typed api adoption + contract shrink + `amend-data.ts` rename + useAuthedQuery)
- R3: 0D reorg (backend folders; web type-file collapse) — starts after R1/R2 land
- R4: 0E hygiene batch (CI, env examples, tokens, deps, tsconfig)

**Wave 1 — Contract**
- L1 backend: `InboundSignal` + `/ingest/signal` + `channelRoutes` + `signalTriage.ts` + OpenRouter option
- L2 gateway: `apps/gateway` restructure (forwarder + discord connector module + routing handshake)

**Wave 2 — Channels + UI (parallel)**
- L3 Slack Events connector + connect flow · L4 inbound email + widget ingest
- L5 feedback board: ghost band + proof chips + drafts relocation + inbox fold-in (+ status-union types, dnd-cast comments)
- L6 portal: proof rows, receipts, per-entry changelog SEO/OG (+ drop dead SSR guard in hash routing)
- L7 changelog autogen: body LLM + `ChangelogCover` + email template/audiences + typed outbox payload + live `useInsights` (+ extract `useChangelogEditorAutoSave` before editing)

**Wave 3 — Loop + integrations (parallel)**
- L8 briefs UI + GitHub issue dispatch + `amend.yml` template + link-model fix (`findRelated*` scans → owned links)
- L9 Linear export via executor + Connections settings (routes/toggles; move inline function ref to the registry)
- L10 context.dev onboarding (domain → theme + voice profile; type the `suggestProject` cast)

**MVP cut** (collect well → auto-prioritize → land in their board): Wave 0 + Wave 1 + L3 + L5 + L7-lite (outbox/template/notify-who-asked) + L9 one-way export. Everything else fast-follows.

## 8. Positioning

Canny/Featurebase are passive boards — they wait. Notra went content-wide. Amend: **the agent that turns community noise into a build queue with receipts** — finds demand (people × paying × growth), briefs the fix, watches it ship, personally tells everyone who asked. Public receipts ("requested by 23 → shipped in 26 days") make the changelog a trust asset.
