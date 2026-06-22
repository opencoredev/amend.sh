// ─────────────────────────────────────────────────────────────────────────────
// Tag palette — the single source of truth for tag colors.
//
// Tags themselves are now persistent, workspace-scoped records (Convex
// `workspaceTags`, served by `tags:list` / `tags:create` / `tags:update` /
// `tags:remove`). Each record stores a COLOR KEY from TAG_COLOR_KEYS below; this
// file maps that key to its Tailwind classes. The full class strings are spelled
// out so Tailwind's scanner keeps them. Keep TAG_COLOR_KEYS in sync with the
// backend list in packages/backend/convex/tags.ts.
// ─────────────────────────────────────────────────────────────────────────────

/** A persisted, workspace-scoped tag definition (from `tags:list`). */
export type WorkspaceTag = { id: string; name: string; color: string };

export type TagColor = {
  /** Solid swatch — the dot in pickers/chips and the swatch in settings. */
  dot: string;
  /** Tinted surface (background + text + ring) for a selected-tag chip. */
  chip: string;
};

export const TAG_COLOR_KEYS = [
  "emerald",
  "sky",
  "violet",
  "amber",
  "rose",
  "teal",
  "fuchsia",
  "orange",
] as const;

export type TagColorKey = (typeof TAG_COLOR_KEYS)[number];

export const TAG_COLORS: Record<TagColorKey, TagColor> = {
  emerald: {
    dot: "bg-emerald-400",
    chip: "bg-emerald-500/12 text-emerald-200 ring-emerald-400/25",
  },
  sky: { dot: "bg-sky-400", chip: "bg-sky-500/12 text-sky-200 ring-sky-400/25" },
  violet: { dot: "bg-violet-400", chip: "bg-violet-500/12 text-violet-200 ring-violet-400/25" },
  amber: { dot: "bg-amber-400", chip: "bg-amber-500/12 text-amber-200 ring-amber-400/25" },
  rose: { dot: "bg-rose-400", chip: "bg-rose-500/12 text-rose-200 ring-rose-400/25" },
  teal: { dot: "bg-teal-400", chip: "bg-teal-500/12 text-teal-200 ring-teal-400/25" },
  fuchsia: {
    dot: "bg-fuchsia-400",
    chip: "bg-fuchsia-500/12 text-fuchsia-200 ring-fuchsia-400/25",
  },
  orange: { dot: "bg-orange-400", chip: "bg-orange-500/12 text-orange-200 ring-orange-400/25" },
};

// Quick-add suggestions shown only when a workspace has no tags yet; picking one
// persists it (with the previewed color) so the list is never empty on day one.
export const STARTER_TAGS = [
  "API",
  "UI",
  "Performance",
  "Security",
  "Mobile",
  "Web",
  "Integrations",
  "Docs",
] as const;

function hashKey(name: string): TagColorKey {
  const key = name.trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return TAG_COLOR_KEYS[hash % TAG_COLOR_KEYS.length];
}

/** Resolve a stored color key to its classes (falls back to the first color). */
export function tagColorByKey(key: string | undefined): TagColor {
  if (key && key in TAG_COLORS) return TAG_COLORS[key as TagColorKey];
  return TAG_COLORS[TAG_COLOR_KEYS[0]];
}

/** Stable color KEY for a tag that has no definition yet (used as a preview). */
export function tagColorKeyByName(name: string): TagColorKey {
  return hashKey(name);
}

/** Stable color CLASSES for a tag with no definition yet. */
export function tagColorByName(name: string): TagColor {
  return TAG_COLORS[hashKey(name)];
}
