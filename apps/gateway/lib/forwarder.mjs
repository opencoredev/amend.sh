// Shared forwarder: every connector POSTs its normalized events to the backend
// through this. It owns the transport concerns so connectors stay simple:
//   - dedupe: in-memory LRU keyed by externalId (cap 2048, drop-oldest). This is
//     per-process memory only — it is LOST ON RESTART — so the backend must
//     tolerate the occasional redelivery. A final send failure un-marks the id,
//     letting a later redelivery of the same event try again.
//   - concurrency: at most 8 requests in flight (tiny semaphore, no deps).
//     Retries run INSIDE the held slot, so one event can hold a slot for up to
//     ~46s worst-case (3 × 15s + backoffs) — deliberate: slots bound backend
//     pressure, not per-event latency.
//   - timeout: 15s AbortController per attempt, covering headers AND body.
//     Must stay ABOVE the backend classifier budget (12s in
//     convexDiscordMessages.ts) or every slow classification gets aborted,
//     retried, and re-billed.
//   - retry: 2 retries (250ms, then 1s) on network error / timeout / 5xx.
//     4xx is the backend saying "no" — never retried.
// forward() resolves to the parsed JSON verdict, or null when the event was a
// duplicate or every attempt failed (logged; it never throws).

const DEDUPE_CAP = 2048;
const MAX_IN_FLIGHT = 8;
// > backend classify budget (12s) + mutation + network headroom. See header.
const ATTEMPT_TIMEOUT_MS = 15_000;
const RETRY_DELAYS_MS = [250, 1000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// fetchImpl is injectable so GATEWAY_DRY_RUN can exercise dedupe/retry/concurrency
// entirely in memory. Production callers never pass it.
export function createForwarder({
  ingestUrl,
  apiToken,
  debug = false,
  log = console.log,
  fetchImpl = fetch,
}) {
  // LRU dedupe — a Map keeps insertion order; delete + re-set refreshes recency.
  const seen = new Map();
  const markSeen = (externalId) => {
    seen.delete(externalId);
    seen.set(externalId, true);
    if (seen.size > DEDUPE_CAP) seen.delete(seen.keys().next().value);
  };

  // Tiny semaphore. Handing the slot straight to the next waiter keeps the
  // in-flight count constant, so it can never overshoot MAX_IN_FLIGHT.
  let inFlight = 0;
  const waiters = [];
  const acquire = () =>
    new Promise((resolve) => {
      if (inFlight < MAX_IN_FLIGHT) {
        inFlight += 1;
        resolve();
      } else {
        waiters.push(resolve);
      }
    });
  const release = () => {
    const next = waiters.shift();
    if (next) next();
    else inFlight -= 1;
  };

  // Reads the FULL body inside the abort window: a response whose body stalls
  // must trip the same timer as one whose headers stall, or it would pin a
  // semaphore slot indefinitely. Also drains the connection on error statuses.
  const attempt = async (url, body) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
    try {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const text = typeof response.text === "function" ? await response.text() : "";
      return { ok: response.ok, status: response.status, text };
    } finally {
      clearTimeout(timer);
    }
  };

  // forward({ externalId, body, path? }):
  //   externalId — globally unique per source event ("discord:message:<id>");
  //     drives dedupe, so two connectors must never collide on the same id.
  //   path — optional re-target relative to the ingest URL origin (e.g.
  //     "/ingest/signal" once the backend grows the generic endpoint). Omitted =
  //     AMEND_INGEST_URL exactly as configured (today's /ingest/discordMessage).
  const forward = async ({ externalId, body, path }) => {
    // Resolve the target BEFORE marking seen — a bad path must not throw (the
    // never-throws contract) nor leave the event falsely marked as delivered.
    let url = ingestUrl;
    if (path) {
      try {
        url = new URL(path, ingestUrl).toString();
      } catch (error) {
        log(`   ↳ ⚠️ invalid ingest path "${path}" for ${externalId}: ${error?.message}`);
        return null;
      }
    }

    if (seen.has(externalId)) {
      if (debug) log(`   ↳ skipped duplicate ${externalId}`);
      markSeen(externalId); // refresh recency
      return null;
    }
    // Marked before sending so concurrent duplicates are dropped while the
    // original is still in flight. Best-effort, not a delivery guarantee.
    markSeen(externalId);

    await acquire();
    try {
      for (let i = 0; i <= RETRY_DELAYS_MS.length; i += 1) {
        try {
          const response = await attempt(url, body);
          if (response.ok) {
            try {
              return JSON.parse(response.text);
            } catch {
              // Backend accepted the event but sent a non-JSON body — retrying
              // would double-process it, so treat as "no verdict".
              log(
                `   ↳ ⚠️ ingest returned ${response.status} with a non-JSON body for ${externalId}`,
              );
              return null;
            }
          }
          if (response.status >= 500) {
            log(`   ↳ ⚠️ ingest returned ${response.status} for ${externalId} (attempt ${i + 1})`);
          } else {
            // 4xx: our payload or auth is wrong — retrying won't change the
            // answer. Surface the body: it carries the actionable reason (e.g.
            // "No workspace has claimed the discord route ...").
            const reason = (response.text ?? "").slice(0, 200);
            log(
              `   ↳ ⚠️ ingest rejected ${externalId} with ${response.status}${reason ? `: ${reason}` : ""} (not retrying)`,
            );
            return null;
          }
        } catch (error) {
          const reason =
            error?.name === "AbortError"
              ? `timed out after ${ATTEMPT_TIMEOUT_MS}ms`
              : error?.message;
          log(`   ↳ ⚠️ ingest attempt ${i + 1} failed for ${externalId}: ${reason}`);
        }
        if (i < RETRY_DELAYS_MS.length) await sleep(RETRY_DELAYS_MS[i]);
      }
      // Every attempt failed. Un-mark the id so a future redelivery of the same
      // event gets another chance instead of being deduped into the void.
      seen.delete(externalId);
      log(`   ↳ ❌ giving up on ${externalId} after ${RETRY_DELAYS_MS.length + 1} attempts`);
      return null;
    } finally {
      release();
    }
  };

  return { forward };
}
