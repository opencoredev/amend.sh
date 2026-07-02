# Amend Gateway

Always-on worker that holds live connections to signal sources — Discord today,
more connectors later. Each connector reads messages from **allowlisted**
channels, a shared forwarder POSTs them to the backend's cheap AI judge, and the
connector acks the ones that become needs (👀 reaction on Discord). Everything
else is ignored for free.

```
message in #feedback ──► connector (skip bots/empty, guild+channel allowlists)
                     ──► forwarder (dedupe · ≤8 in flight · 10s timeout · retry)
                     ──► POST /ingest/discordMessage ──► cheap-model AI judge
                          │ signal? no  ──► ignored (no cost beyond 1 cheap call)
                          │ signal? yes ──► need created  +  connector acks 👀
```

## Layout

- `index.mjs` — boot: env validation, starts enabled connectors, graceful
  shutdown on SIGINT/SIGTERM. `GATEWAY_CONNECTORS` (comma-separated ids) narrows
  which connectors run; empty = all.
- `lib/forwarder.mjs` — shared transport: in-memory LRU dedupe by `externalId`
  (per-process — lost on restart), concurrency cap of 8, 10s timeout per attempt,
  2 retries on network error/timeout/5xx, never on 4xx.
- `connectors/discord.mjs` — everything Discord-specific: intents, allowlists,
  payload normalization, 👀 ack. The connector contract for future sources
  (telegram, …) is documented at the top of this file.

## One-time Discord setup

1. **Message Content Intent** — Developer Portal → your app → **Bot** →
   _Privileged Gateway Intents_ → turn **Message Content Intent** ON.
2. **Invite the bot** to your server with `View Channels`, `Read Message History`,
   and `Add Reactions`.

## Run

```bash
cd apps/gateway
bun install                      # or npm install

DISCORD_BOT_TOKEN="<bot token>" \
AMEND_INGEST_URL="https://<deployment>.convex.site/ingest/discordMessage" \
AMEND_API_TOKEN="<AMEND_API_TOKEN from the Convex deployment>" \
DISCORD_LISTEN_CHANNEL_IDS="<channelId>,<channelId>" \
  bun index.mjs
```

No `--watch`/hot reload on purpose — live gateway connections hate being
restarted mid-session.

- `DISCORD_LISTEN_CHANNEL_IDS` is the **allowlist** — the main cost control. Get a
  channel ID by right-clicking a channel in Discord (Developer Mode on) →
  _Copy Channel ID_. Leave it empty to listen everywhere (not recommended).
- The AI judge uses `CROF_CLASSIFIER_MODEL` on the deployment (falls back to
  `CROF_MODEL`). Point it at a cheap model to minimize cost.
- `AMEND_INGEST_URL` points at `/ingest/discordMessage` today; it will later move
  to the generic `/ingest/signal` endpoint.

For production, run this on any always-on host (Railway / Fly / a small VPS) with
the same env.

## Smoke test (no network, no Discord login)

```bash
GATEWAY_DRY_RUN=1 DISCORD_BOT_TOKEN=x \
AMEND_INGEST_URL=http://localhost/ingest/discordMessage AMEND_API_TOKEN=x \
  bun index.mjs
```

Validates env, contract-checks the loaded connectors, and exercises the
forwarder's dedupe/concurrency/retry in memory. Prints `dry run ok` and exits 0.
