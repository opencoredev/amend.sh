# Amend Design Consistency

Amend UI should feel like a source-linked product workspace: monochrome, precise, quiet, and editor-first. Keep the landing, dashboard, docs, brand page, portal, and embed surfaces on the same visual system.

## Visual System

- Use the existing shadcn/Tailwind tokens from `packages/ui/src/styles/globals.css`.
- Default to `Geist Mono` for interface text and `amend-display` only for large editorial headings.
- Stay monochrome first. Use small signal accents only for state, priority, or focus.
- Prefer sharp dividers, anchored panels, command surfaces, rails, and editor layouts over generic rounded card grids.
- Keep motion short and useful: scale/fade opens, subtle hover inversion, and reduced-motion support.

## Product Components

- Composer/editor surfaces should lead with the working area, not explanatory copy.
- Popovers should be anchored to the control that opened them and share the same border, background, text, and hover behavior.
- Primary actions use foreground-on-background inversion; secondary actions stay bordered and muted until hover.
- Avoid fake dashboards, decorative metrics, and filler cards unless they directly support a real workflow.
