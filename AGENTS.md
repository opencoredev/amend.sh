# Agent Guidelines — Amend

## UI Interaction Animations

**No scale transforms on interactive elements.** Do not use `active:scale-[0.96]`, `hover:scale-*`, or any geometry-changing transform on buttons, links, sidebar items, or nav elements. They feel jittery and distracting.

**Use instead:**

- Pressed/active state: `active:opacity-75`
- Hover transitions: `transition-colors duration-150 ease-linear`
- Hover should change color or background only — never size or position

**Tooltips:** reveal with opacity only — `group-hover:opacity-100`. No `scale-95 → scale-100` bounce.

**Layout-level animations are fine.** The existing `.t-panel-slide`, `.t-dropdown`, `.t-modal` CSS classes in `packages/ui/src/styles/motion.css` are acceptable — those animate whole panels/modals, not individual interactive elements.

## Charting

Do not install `recharts` — it has CJS/ESM interop issues with this Vite + TanStack Start setup (causes `require_isUnsafeProperty is not a function` at runtime). Use pure CSS/SVG bar charts instead (see `proactivation-analytics-panel.tsx` for the pattern: flex columns with `height: pct%` + `bg-foreground`).
