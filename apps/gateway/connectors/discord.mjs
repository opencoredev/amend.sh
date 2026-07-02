// Connector contract — copy this shape for future connectors (telegram, slack, ...):
//
//   export const fooConnector = {
//     id: "foo",               // stable id, used in logs and GATEWAY_CONNECTORS
//     requiredEnv: ["FOO_X"],  // vars index.mjs verifies before start() is called
//     async start(ctx) {...},  // open the source connection and begin forwarding
//     async stop() {...},      // close the connection; called on SIGINT/SIGTERM
//   };
//
// ctx = { forward, debug, log }:
//   - forward({ externalId, body, path? }) POSTs the normalized event to the
//     backend and resolves to the verdict JSON, or null (duplicate / failure —
//     already logged). externalId must be globally unique per source event
//     ("discord:message:<id>") — it drives the forwarder's dedupe.
//   - debug: gateway-wide verbose flag; a connector may layer its own env flag
//     on top (Discord uses DISCORD_DEBUG).
//   - log: timestamped logger shared with the rest of the gateway.
//
// A connector owns EVERYTHING source-specific: the SDK client, intents/scopes,
// allowlists, payload normalization, and acking verdicts back to the source.

import { Client, Events, GatewayIntentBits, Partials } from "discord.js";

let client = null;

export const discordConnector = {
  id: "discord",
  requiredEnv: ["DISCORD_BOT_TOKEN"],

  async start({ forward, debug, log }) {
    const TOKEN = process.env.DISCORD_BOT_TOKEN;
    // DISCORD_DEBUG overrides the gateway-wide flag; both default to on.
    const DEBUG = process.env.DISCORD_DEBUG ? process.env.DISCORD_DEBUG !== "0" : debug;
    const CHANNEL_IDS = (process.env.DISCORD_LISTEN_CHANNEL_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const GUILD_IDS = (process.env.DISCORD_LISTEN_GUILD_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    // Allowlists — the primary cost control. Empty = listen everywhere.
    // Guild allowlist scopes which servers we watch (e.g. ignore your real server);
    // channel allowlist narrows further to specific channels.
    const allowlist = new Set(CHANNEL_IDS);
    const guildAllowlist = new Set(GUILD_IDS);

    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel, Partials.Message],
    });

    client.once(Events.ClientReady, (ready) => {
      const scope = allowlist.size
        ? `${allowlist.size} allowlisted channel(s): ${[...allowlist].join(", ")}`
        : "ALL channels (no allowlist set)";
      const guilds = ready.guilds.cache.map((g) => `${g.name} (${g.id})`).join(", ") || "NONE";
      const guildScope = guildAllowlist.size
        ? `${guildAllowlist.size} allowlisted server(s)`
        : "ALL servers";
      log(`✅ online as ${ready.user.tag} — watching ${guildScope}, ${scope}`);
      log(`   member of ${ready.guilds.cache.size} guild(s): ${guilds}`);
      log(`   intents: Guilds + GuildMessages + MessageContent`);
    });

    client.on(Events.MessageCreate, async (message) => {
      // Log EVERY raw message before any filtering, so we can see exactly what the
      // gateway is (or isn't) delivering — including whether MessageContent works.
      if (DEBUG) {
        const len = (message.content ?? "").length;
        log(
          `[msg] #${message.channel?.name ?? message.channelId} by ${message.author?.username}` +
            ` bot=${message.author?.bot ? 1 : 0} len=${len} "${(message.content ?? "").slice(0, 60)}"`,
        );
        if (len === 0 && !message.author?.bot) {
          log(`   ⚠️ EMPTY content from a human — MessageContent intent is NOT delivering text.`);
        }
      }

      try {
        if (message.author?.bot) return;
        const content = (message.content ?? "").trim();
        if (!content) return;
        if (guildAllowlist.size && !guildAllowlist.has(message.guildId)) {
          if (DEBUG) log(`   ↳ skipped (server not in allowlist)`);
          return;
        }
        if (allowlist.size && !allowlist.has(message.channelId)) {
          if (DEBUG) log(`   ↳ skipped (channel not in allowlist)`);
          return;
        }

        // No `path` override: the payload and endpoint must stay byte-compatible
        // with the backend's /ingest/discordMessage handler.
        const verdict = await forward({
          externalId: `discord:message:${message.id}`,
          body: {
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author.id,
            authorName:
              message.member?.displayName || message.author.globalName || message.author.username,
            authorHandle: message.author.username,
            authorAvatarUrl: message.author.displayAvatarURL({ extension: "png", size: 128 }),
            content,
          },
        });
        if (!verdict) return; // duplicate or failed — the forwarder already logged it
        if (DEBUG) log(`   ↳ ingest ok: capture=${verdict?.capture} react=${verdict?.react}`);
        // Verdict ack protocol: { capture, react, title } today. A future { reply }
        // field slots in right here — post verdict.reply to message.channel (before
        // the reaction) once the backend starts sending it.
        if (verdict?.react) {
          await message
            .react("👀")
            .catch((error) => log(`   ↳ ⚠️ react failed: ${error?.message}`));
          log(`   👀 captured: ${verdict.title || content.slice(0, 70)}`);
        }
      } catch (error) {
        log(`   ↳ ⚠️ handler error: ${error?.message}`);
      }
    });

    client.on(Events.Error, (error) => log(`client error: ${error?.message}`));
    client.on(Events.Warn, (warning) => log(`client warning: ${warning}`));
    client.on(Events.ShardDisconnect, (event) => log(`shard disconnected: code ${event?.code}`));
    client.on(Events.ShardReconnecting, () => log(`shard reconnecting...`));

    log("logging in...");
    try {
      await client.login(TOKEN);
    } catch (error) {
      log(`❌ LOGIN FAILED: ${error?.message}`);
      log(
        `   → If this says "disallowed intents", enable Message Content Intent in the Discord portal.`,
      );
      throw error;
    }
  },

  async stop() {
    if (!client) return;
    await client.destroy();
    client = null;
  },
};
