# Amend Discord Gateway

Always-on bot process. It holds the Discord Gateway connection (so the bot shows
**online**), reads messages in **allowlisted channels**, asks the backend's cheap
AI judge whether each message is real product signal, and adds a 👀 reaction to
the ones that become needs. Everything else is ignored for free.

```
message in #feedback ──► (worker: skip bots/empty, channel allowlist)
                     ──► POST /ingest/discordMessage ──► cheap-model AI judge
                          │ signal? no  ──► ignored (no cost beyond 1 cheap call)
                          │ signal? yes ──► need created  +  worker adds 👀
```

## One-time Discord setup

1. **Message Content Intent** — Developer Portal → your app → **Bot** →
   *Privileged Gateway Intents* → turn **Message Content Intent** ON.
2. **Invite the bot** to your server with `View Channels`, `Read Message History`,
   and `Add Reactions`.

## Run

```bash
cd apps/discord-gateway
bun install                      # or npm install

DISCORD_BOT_TOKEN="<bot token>" \
AMEND_INGEST_URL="https://<deployment>.convex.site/ingest/discordMessage" \
AMEND_API_TOKEN="<AMEND_API_TOKEN from the Convex deployment>" \
DISCORD_LISTEN_CHANNEL_IDS="<channelId>,<channelId>" \
  node index.mjs
```

- `DISCORD_LISTEN_CHANNEL_IDS` is the **allowlist** — the main cost control. Get a
  channel ID by right-clicking a channel in Discord (Developer Mode on) →
  *Copy Channel ID*. Leave it empty to listen everywhere (not recommended).
- The AI judge uses `CROF_CLASSIFIER_MODEL` on the deployment (falls back to
  `CROF_MODEL`). Point it at a cheap model to minimize cost.

For production, run this on any always-on host (Railway / Fly / a small VPS) with
the same env.
