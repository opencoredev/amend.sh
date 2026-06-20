# Agent Guidelines — Amend

## Vocab

Shorthand for dashboard UI regions (React DevTools component → the name the user says):

- **Page content** — `DashboardWorkspaceSurface` (`dashboard-workspace-surface.tsx`): the rounded, scrollable main content region rendered inside every dashboard view. It's on every page — when the user says "page content," this is it.
- **Toolbar** — `ToolbarBar` (`dashboard-toolbar.tsx`) and its per-view wrappers (`RoadmapToolbar` / `FeedbackToolbar` / `ChangelogToolbar`): the full-width sub-nav/filter bar directly under the dashboard header.

## UI Interaction Animations

**No scale transforms on interactive elements.** Do not use `active:scale-[0.96]`, `hover:scale-*`, or any geometry-changing transform on buttons, links, sidebar items, or nav elements. They feel jittery and distracting.

**Use instead:**

- Pressed/active state: `active:opacity-75`
- Hover transitions: `transition-colors duration-150 ease-linear`
- Hover should change color or background only — never size or position

**Tooltips:** reveal with opacity only — `group-hover:opacity-100`. No `scale-95 → scale-100` bounce.

**Layout-level animations are encouraged when they clarify state.** Use the transitions-dev classes in `packages/ui/src/styles/motion.css`: `.t-resize` for cards/panels that change size, `.t-dropdown` for anchored menus, `.t-modal` for modal surfaces, `.t-panel-slide` for workspace reveals, and `.t-icon-swap` for icon state changes. Keep reduced-motion guards intact.

**Premium shell direction:** Amend should keep its own source-linked identity, but use a Tripwire-like level of refinement: near-black background, raised rounded app surfaces, soft borders, compact sans-serif body text, mono only for data/code, and small high-signal accents. Do not copy Tripwire one-for-one.

## Icons

We use **Hugeicons only** — never import `lucide-react` (it is not a dependency). Import icons from the lucide-compatible wrapper: `@/lib/icons` in `apps/web`, `@amend/ui/components/icons` in `packages/ui`. Add a new glyph by mapping a Hugeicons `*Icon` export to a lucide-style name inside the wrapper.

## Charting

Do not install `recharts` — it has CJS/ESM interop issues with this Vite + TanStack Start setup (causes `require_isUnsafeProperty is not a function` at runtime). Use pure CSS/SVG bar charts instead (see `proactivation-analytics-panel.tsx` for the pattern: flex columns with `height: pct%` + `bg-foreground`).

## Documentation Sync

**When you change a feature, update its docs in the same change.** The public docs live in `apps/fumadocs/content/docs/`. If your work changes what a user or integrating agent can observe — a customer-facing surface, an API route or SDK method, a CLI command, an automation rule, a config/env var, an auth scope, a setup or deploy step, or a workflow's behavior — the matching MDX page must be updated before the work is considered done.

This applies to **content only**. Do not touch the Fumadocs framework, routing, or build config as part of feature work.

- A pure internal refactor with no observable change does **not** require a docs edit.
- If a feature has **no** owning doc page yet, add a page (and register it in `content/docs/meta.json`) or flag the gap in your summary — do not silently leave it undocumented.
- The feature → doc-page map and detailed triggers live in `apps/fumadocs/AGENTS.md`. Read it before editing docs.

## SirPaul PR Workflow

SirPaul story work must go through a pull request. Do not treat "ship it" or similar language as permission to bypass a PR for SirPaul work unless the user explicitly says not to make a PR in the current turn.

After opening or updating the PR, wait until CodeRabbit is actually finished. A pending CodeRabbit status, an in-progress summary comment, or missing review state means the story is not done yet. Once CodeRabbit completes, review every finding, apply real fixes, rerun the narrow validation, and push the follow-up before considering the story ready.
