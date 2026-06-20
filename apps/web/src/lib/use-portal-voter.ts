import { useCallback, useState } from "react";

/**
 * Anonymous voting identity for the public portal.
 *
 * The public `getPublicPortal` query is the same for every visitor — it never
 * reports whether *you* voted. So we keep a per-browser voter id plus the set of
 * keys this browser has upvoted in localStorage, and feed that back into the
 * vote controls as their initial state. The vote count itself stays server-owned
 * and reactive; this only remembers intent so a refresh doesn't forget it.
 *
 * `recordFeedbackInteraction` accepts this `voterId` as `externalUserId`, which
 * is what lets logged-out visitors upvote feedback at all.
 */

const VOTER_ID_KEY = "amend.portal.voter";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode / quota — voting still works for the session, it just won't
    // be remembered across reloads. Not worth surfacing.
  }
}

function createVoterId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export type PortalVoter = {
  hasVoted: (key: string) => boolean;
  remember: (key: string, voted: boolean) => void;
  voterId: string;
};

export function usePortalVoter(workspaceSlug: string): PortalVoter {
  const votedStorageKey = `amend.portal.voted.${workspaceSlug}`;

  const [voterId] = useState(() => {
    const existing = readStorage(VOTER_ID_KEY);
    if (existing) {
      return existing;
    }
    const next = createVoterId();
    writeStorage(VOTER_ID_KEY, next);
    return next;
  });

  const [voted, setVoted] = useState<Set<string>>(() => {
    const raw = readStorage(votedStorageKey);
    if (!raw) {
      return new Set();
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return new Set(
        Array.isArray(parsed)
          ? parsed.filter((value): value is string => typeof value === "string")
          : [],
      );
    } catch {
      return new Set();
    }
  });

  const hasVoted = useCallback((key: string) => voted.has(key), [voted]);

  const remember = useCallback(
    (key: string, isVoted: boolean) => {
      setVoted((current) => {
        if (isVoted === current.has(key)) {
          return current;
        }
        const next = new Set(current);
        if (isVoted) {
          next.add(key);
        } else {
          next.delete(key);
        }
        writeStorage(votedStorageKey, JSON.stringify([...next]));
        return next;
      });
    },
    [votedStorageKey],
  );

  return { hasVoted, remember, voterId };
}
