import type { Id } from "@amend/backend/convex/_generated/dataModel";
import type { DashboardChangelog } from "@/components/amend-dashboard-types";

export type ChangelogEditorSavePayload = {
  body: string;
  category: string;
  coverImageStorageId?: Id<"_storage"> | null;
  metaDescription?: string;
  stableKey?: string;
  status: string;
  summary: string;
  tags: string[];
  title: string;
  version?: string;
};

/** Lifecycle of the editor's background auto-save, surfaced in the header status. */
export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Mint a fresh UUID for a brand-new changelog draft. This becomes the entry's
 * permanent `stableKey` on the first save (the backend honors a client-provided
 * key), so the URL key stays the same opaque id from creation through every later
 * edit — it never re-derives from the title and so never drifts out of sync.
 */
export function createNewChangelogKey() {
  return crypto.randomUUID();
}

/** Stable blank entry rendered when composing a brand-new changelog. */
export const BLANK_CHANGELOG: DashboardChangelog = {
  authorName: "",
  body: "",
  category: "added",
  coverImageStorageId: null,
  coverImageUrl: null,
  metaDescription: null,
  recordId: null,
  sourceLinks: [],
  stableKey: "",
  status: "draft",
  summary: "",
  tags: [],
  title: "",
  updatedAt: 0,
  version: "",
};

export function isBlankChangelog(entry: DashboardChangelog) {
  return entry.stableKey === "" && entry.recordId === null;
}
