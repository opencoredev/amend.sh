# Amend Design Consistency

Amend UI should feel like a premium source-linked product workspace: calm, modern, precise, and built for teams that live in GitHub, Linear, Slack, Discord, and support tools. Keep the landing, dashboard, docs, brand page, portal, and embed surfaces on the same visual system.

## Visual System

- Use the existing shadcn/Tailwind tokens from `packages/ui/src/styles/globals.css`.
- Default to readable sans-serif body text. Use mono only for code, counts, source IDs, and compact data.
- Keep Amend dark and developer-native, but closer to a premium app shell than terminal art: near-black page, raised surfaces, softened borders, compact type, and restrained controls.
- Stay mostly monochrome. Use small signal accents only for state, priority, focus, or a single important action.
- Prefer rounded app surfaces, anchored panels, command surfaces, rails, and editor layouts over generic card grids.
- Buttons should feel compact and expensive: `h-8` to `h-10`, rounded-lg, medium weight, color/background hover only.
- Keep motion short and useful with transitions-dev classes: `.t-resize`, `.t-dropdown`, `.t-modal`, `.t-icon-swap`, and reduced-motion support.

## Product Components

- Composer/editor surfaces should lead with the working area, not explanatory copy.
- Popovers should be anchored to the control that opened them and use `.t-dropdown` when possible.
- Primary actions use foreground-on-background inversion; secondary actions stay bordered and muted until hover.
- Modal surfaces should use `.t-modal`; cards or panels that resize due to state should use `.t-resize`.
- Avoid fake dashboards, decorative metrics, and filler cards unless they directly support a real workflow.
