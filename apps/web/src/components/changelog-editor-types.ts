import type { DashboardChangelog } from "@/components/amend-dashboard-types";

export type ChangelogEditorSavePayload = {
  body: string;
  category: string;
  stableKey?: string;
  status: string;
  summary: string;
  tags: string[];
  title: string;
  version?: string;
};

/** Sentinel selection key that opens the editor on a fresh, unsaved draft. */
export const NEW_CHANGELOG_KEY = "new-changelog-draft";

/** Stable blank entry rendered when composing a brand-new changelog. */
export const BLANK_CHANGELOG: DashboardChangelog = {
  authorName: "",
  body: "",
  category: "added",
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
