import { useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "error" | "idle" | "saved" | "saving";

/** How long a field sits idle before its auto-save fires. Matches the changelog editor. */
const AUTOSAVE_DELAY_MS = 1200;

/** "just now" / "12s ago" / "3m ago" / "2h ago" — same shape as the changelog editor. */
export function formatSavedAgo(at: number, now: number): string {
  const diff = Math.max(0, now - at);
  if (diff < 10_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export type AutoSaveSlice = {
  isDirty: boolean;
  lastSavedAt: number | null;
  retry: () => void;
  status: AutoSaveStatus;
};

/**
 * Debounced auto-save for one slice of settings. Watches `signature` — a cheap
 * canonical string of the slice's values — and persists via `save` after the
 * user stops editing. Semantics mirror the changelog editor: skip while a save
 * is in flight, don't retry a signature that just failed (until `retry()` or a
 * fresh edit), and let the server round-trip be the source of truth for "saved".
 *
 * `identity` distinguishes a real edit from a re-seed: when it changes (a
 * different project opened, or the backing record first loaded) the signature
 * jumps without user intent, so we re-baseline instead of saving it back.
 */
export function useSettingsAutoSave({
  enabled,
  identity,
  save,
  signature,
}: {
  enabled: boolean;
  identity: string;
  save: () => Promise<void>;
  signature: string;
}): AutoSaveSlice {
  const [savedSignature, setSavedSignature] = useState(signature);
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const inFlight = useRef(false);
  const errorSignature = useRef<string | null>(null);
  const identityRef = useRef(identity);
  // `save`/`signature`/`savedSignature` are read from the latest render via refs
  // so `retry()` and the debounce never act on a stale closure.
  const saveRef = useRef(save);
  saveRef.current = save;
  const signatureRef = useRef(signature);
  signatureRef.current = signature;
  const savedSignatureRef = useRef(savedSignature);
  savedSignatureRef.current = savedSignature;

  async function run(sig: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("saving");
    try {
      await saveRef.current();
      errorSignature.current = null;
      setSavedSignature(sig);
      setLastSavedAt(Date.now());
      setStatus("saved");
    } catch {
      errorSignature.current = sig;
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }

  function retry() {
    const sig = signatureRef.current;
    if (!enabled || sig === savedSignatureRef.current) return;
    errorSignature.current = null;
    void run(sig);
  }

  useEffect(() => {
    // Re-seed (project switch / first record load): baseline, never save.
    if (identityRef.current !== identity) {
      identityRef.current = identity;
      setSavedSignature(signature);
      setStatus("idle");
      errorSignature.current = null;
      return;
    }
    if (!enabled || signature === savedSignature) return;
    if (inFlight.current || errorSignature.current === signature) return;
    const handle = window.setTimeout(() => void run(signature), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(handle);
    // run() reads the latest values via saveRef; excluding it keeps the debounce stable.
  }, [enabled, identity, savedSignature, signature]);

  return { isDirty: signature !== savedSignature, lastSavedAt, retry, status };
}

/** Fold several slice auto-savers into one page-level status for the indicator. */
export function combineAutoSaveStatus(parts: AutoSaveSlice[]): AutoSaveSlice {
  const isDirty = parts.some((part) => part.isDirty);
  const lastSavedAt = parts.reduce<number | null>(
    (max, part) =>
      part.lastSavedAt !== null && (max === null || part.lastSavedAt > max)
        ? part.lastSavedAt
        : max,
    null,
  );
  const retry = () => parts.forEach((part) => part.retry());
  if (parts.some((part) => part.status === "saving")) {
    return { isDirty, lastSavedAt, retry, status: "saving" };
  }
  if (parts.some((part) => part.status === "error")) {
    return { isDirty, lastSavedAt, retry, status: "error" };
  }
  if (parts.some((part) => part.status === "saved")) {
    return { isDirty, lastSavedAt, retry, status: "saved" };
  }
  return { isDirty, lastSavedAt, retry, status: "idle" };
}
