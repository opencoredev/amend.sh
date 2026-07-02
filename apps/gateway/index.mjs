// Gateway boot: validates env, starts the enabled connector modules (Discord
// today, telegram/etc. later), and owns process lifecycle. Connectors normalize
// source events and hand them to the shared forwarder (lib/forwarder.mjs), which
// owns transport: dedupe, retry, timeout, and the concurrency cap.
//
// GATEWAY_DRY_RUN=1 boots everything except the network: env is validated,
// connectors are loaded and contract-checked, and the forwarder's dedupe /
// concurrency / retry behavior is exercised with an in-memory fetch — no Discord
// login, no HTTP. Prints "dry run ok" and exits 0.

import { discordConnector } from "./connectors/discord.mjs";
import { createForwarder } from "./lib/forwarder.mjs";

const INGEST_URL = process.env.AMEND_INGEST_URL;
const API_TOKEN = process.env.AMEND_API_TOKEN;
const DEBUG = process.env.GATEWAY_DEBUG !== "0"; // on by default while stabilizing
const DRY_RUN = process.env.GATEWAY_DRY_RUN === "1";

const ts = () => new Date().toISOString().slice(11, 19);
const log = (...args) => console.log(`[${ts()}]`, ...args);

// Every connector this worker knows how to run. GATEWAY_CONNECTORS (comma-
// separated ids) narrows the set; empty/unset = run them all.
const registry = [discordConnector];
const enabledIds = (process.env.GATEWAY_CONNECTORS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const unknownIds = enabledIds.filter((id) => !registry.some((c) => c.id === id));
if (unknownIds.length) {
  console.error(
    `Unknown connector id(s) in GATEWAY_CONNECTORS: ${unknownIds.join(", ")} — known: ${registry.map((c) => c.id).join(", ")}`,
  );
  process.exit(1);
}
const connectors = enabledIds.length ? registry.filter((c) => enabledIds.includes(c.id)) : registry;

const missing = [];
if (!INGEST_URL) missing.push("AMEND_INGEST_URL");
if (!API_TOKEN) missing.push("AMEND_API_TOKEN");
for (const connector of connectors) {
  for (const key of connector.requiredEnv ?? []) {
    if (!process.env[key]) missing.push(key);
  }
}
if (missing.length) {
  console.error(`Missing required env: ${missing.join(", ")}`);
  process.exit(1);
}

if (DRY_RUN) {
  try {
    await dryRun();
    process.exit(0);
  } catch (error) {
    log(`❌ ${error?.message}`);
    process.exit(1);
  }
}

const forwarder = createForwarder({
  ingestUrl: INGEST_URL,
  apiToken: API_TOKEN,
  debug: DEBUG,
  log,
});

const started = [];
for (const connector of connectors) {
  log(`starting connector: ${connector.id}`);
  try {
    await connector.start({ forward: forwarder.forward, debug: DEBUG, log });
    started.push(connector);
  } catch (error) {
    log(`❌ connector ${connector.id} failed to start: ${error?.message}`);
    process.exit(1);
  }
}

// Graceful shutdown: let connectors close their live connections (Discord shows
// the bot offline immediately instead of waiting for a gateway timeout).
// A second signal — or a stop() that hangs past 5s — force-exits so a wedged
// socket can never make the process unkillable short of SIGKILL.
let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) {
    log(`${signal} again — forcing exit`);
    process.exit(130);
  }
  shuttingDown = true;
  log(`${signal} — stopping ${started.length} connector(s)...`);
  setTimeout(() => {
    log("shutdown timed out — forcing exit");
    process.exit(130);
  }, 5_000).unref();
  Promise.allSettled(started.map((connector) => connector.stop())).then(() => {
    log("stopped cleanly");
    process.exit(0);
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

async function dryRun() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`dry run failed: ${message}`);
  };

  log(
    `dry run: ${connectors.length} connector(s) loaded: ${connectors.map((c) => c.id).join(", ")}`,
  );
  for (const connector of connectors) {
    assert(
      typeof connector.id === "string" &&
        typeof connector.start === "function" &&
        typeof connector.stop === "function",
      `connector ${connector.id ?? "<unnamed>"} does not satisfy the contract`,
    );
  }

  // Exercise the forwarder entirely in memory — no network, no Discord login.
  let calls = 0;
  let inFlight = 0;
  let maxInFlight = 0;
  const fakeFetch = async () => {
    calls += 1;
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await new Promise((resolve) => setTimeout(resolve, 10));
    inFlight -= 1;
    return new Response(JSON.stringify({ capture: false, react: false }), { status: 200 });
  };
  const { forward } = createForwarder({
    ingestUrl: INGEST_URL,
    apiToken: API_TOKEN,
    debug: DEBUG,
    log,
    fetchImpl: fakeFetch,
  });

  // Dedupe: the second forward with the same externalId never hits fetch.
  const first = await forward({ externalId: "dry:dupe", body: {} });
  const second = await forward({ externalId: "dry:dupe", body: {} });
  assert(first !== null && second === null && calls === 1, "dedupe should drop the second forward");

  // Concurrency: 32 distinct events all land, never more than 8 in flight.
  calls = 0;
  const verdicts = await Promise.all(
    Array.from({ length: 32 }, (_, i) => forward({ externalId: `dry:many:${i}`, body: {} })),
  );
  assert(verdicts.every(Boolean) && calls === 32, "all distinct events should forward");
  assert(maxInFlight <= 8, `in-flight cap exceeded (saw ${maxInFlight})`);
  assert(maxInFlight > 1, "forwards should overlap under the cap");

  // Retry: a 500 then a 200 → second attempt returns the verdict.
  let retryCalls = 0;
  const flaky = createForwarder({
    ingestUrl: INGEST_URL,
    apiToken: API_TOKEN,
    log,
    fetchImpl: async () => {
      retryCalls += 1;
      if (retryCalls === 1) return new Response("nope", { status: 500 });
      return new Response(JSON.stringify({ capture: true, react: true, title: "dry" }), {
        status: 200,
      });
    },
  });
  const retried = await flaky.forward({ externalId: "dry:retry", body: {} });
  assert(retried?.capture === true && retryCalls === 2, "5xx should retry and then succeed");

  // 4xx: rejected once, never retried.
  let rejectCalls = 0;
  const rejecting = createForwarder({
    ingestUrl: INGEST_URL,
    apiToken: API_TOKEN,
    log,
    fetchImpl: async () => {
      rejectCalls += 1;
      return new Response("bad", { status: 400 });
    },
  });
  const rejected = await rejecting.forward({ externalId: "dry:4xx", body: {} });
  assert(rejected === null && rejectCalls === 1, "4xx must not retry");

  log("dry run ok");
}
