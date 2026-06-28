import { Client, Events, GatewayIntentBits, Partials } from "discord.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const INGEST_URL = process.env.AMEND_INGEST_URL;
const API_TOKEN = process.env.AMEND_API_TOKEN;
const CHANNEL_IDS = (process.env.DISCORD_LISTEN_CHANNEL_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const missing = [];
if (!TOKEN) missing.push("DISCORD_BOT_TOKEN");
if (!INGEST_URL) missing.push("AMEND_INGEST_URL");
if (!API_TOKEN) missing.push("AMEND_API_TOKEN");
if (missing.length) {
  console.error(`Missing required env: ${missing.join(", ")}`);
  process.exit(1);
}

// Channel allowlist — the primary cost control. Empty = listen everywhere.
const allowlist = new Set(CHANNEL_IDS);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once(Events.ClientReady, (ready) => {
  const scope = allowlist.size
    ? `${allowlist.size} allowlisted channel(s)`
    : "ALL channels (no allowlist set — recommended to set DISCORD_LISTEN_CHANNEL_IDS)";
  console.log(`amend gateway online as ${ready.user.tag} — listening to ${scope}`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    // Free, required hygiene before anything leaves the worker.
    if (message.author?.bot) return;
    const content = (message.content ?? "").trim();
    if (!content) return;
    if (allowlist.size && !allowlist.has(message.channelId)) return;

    const response = await fetch(INGEST_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${API_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        guildId: message.guildId,
        channelId: message.channelId,
        messageId: message.id,
        authorId: message.author.id,
        authorName: message.author.username,
        content,
      }),
    });
    if (!response.ok) {
      console.warn(`ingest returned ${response.status} for message ${message.id}`);
      return;
    }
    const result = await response.json();
    if (result?.react) {
      await message.react("👀").catch((error) => console.warn("react failed:", error?.message));
      console.log(`👀 captured: ${result.title || content.slice(0, 70)}`);
    }
  } catch (error) {
    console.warn("message handler error:", error?.message);
  }
});

client.on(Events.Error, (error) => console.warn("client error:", error?.message));
client.on(Events.Warn, (warning) => console.warn("client warning:", warning));

client.login(TOKEN);
