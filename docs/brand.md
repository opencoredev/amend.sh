# Amend Brand System

Amend should feel like a warm, calm operations console for teams that ship in public:
dark, evidence-led, and quietly confident. Closer to a well-lit workshop than a SaaS
marketing page — the warmth is the point, the proof is the decoration.

## Brand Idea

**Noise in, receipts out.** Customers ask everywhere (Discord, GitHub, Slack, email),
Amend's agent turns that noise into proven needs, the team ships, and everyone who
asked gets told — personally. The loop should always be visible:

- someone asks, complains, or reacts in a connected channel
- the agent captures it, clusters it, and builds proof (people × paying × growth)
- the team accepts it, ships it, and the merge is detected automatically
- a changelog goes out; the exact people who asked are notified
- the public portal shows the receipt: requested → shipped, with dates

## Visual Direction

The current system is **warm dark**: ember→gold light over deep neutral surfaces,
rounded geometry, thin rings instead of borders.

- Canvas is deep warm-dark neutral; surfaces are rounded (`rounded-*`) with `ring-1`
  hairlines. The old zero-radius/hard-border system is legacy — do not reintroduce it.
- The signal accent is the warm gold glow (`--amend-glow: 239 152 54`), used for
  demand, capture, votes, and the brand splice. **Gold = demand, green = shipped.**
- The mark is a solid capital **A** lettermark with a warm gold splice crossbar
  (`fill-amend-warm`). Light/dark variants exist as SVG strings in
  `apps/web/src/lib/brand-assets.ts`.
- Home page uses warm ember→gold gradient bookends (top + bottom). Dashboard warmth
  comes from the ambient glow classes (`.amend-workspace-surface`, `.amend-sidebar-warm`).
- `#151518` is the inset-control surface color — it is intentionally *not* warmed;
  never retint it together with the ambient surface tokens.
- Typography: UI cascade resolves real SF Pro on Apple hardware with self-hosted
  Inter as the metric fallback elsewhere; console base size is 13px (`text-13`).
  Geist and Geist Mono are self-hosted; mono is for hashes, SHAs, and source chips.
  Text hierarchy uses `text-strong` / `text-default` / `text-subtle`.
- Motion is the `t-*` class system driven by `useDisclosureTransition` —
  no animation libraries. Respect reduced motion.
- Scrollbars are CSS-themed native: slim, transparent track, thumb warms to the
  glow on drag (`--amend-scrollbar-*` tokens). Never replace with a JS scrollbar.
  Keep native overscroll rubber-banding.

**Anti-slop rules (hard):** no hero badges, no button glows, no gradient text,
no decorative rings/blobs, no bento card grids, no icon-title-paragraph feature
grids, no oversized display type in dense surfaces, no fake metrics.

## Implementation Sources

- Tokens, font faces, scrollbars, warm field: `apps/web/src/index.css`
- Brand mark component: `apps/web/src/components/brand-mark.tsx`
- SVG brand assets: `apps/web/public/brand/amend-mark.svg`, `amend-lockup.svg`,
  `amend-brand-board.svg`, plus `apps/web/public/favicon.svg`
- Brand asset strings for embedding: `apps/web/src/lib/brand-assets.ts`
- Guidelines data (in-app brand page): `apps/web/src/components/brand-guidelines-data.ts`
- Icons: Hugeicons via the `@/lib/icons` wrapper — never import `lucide-react` in app code
- Shared primitives: `packages/ui` (`@amend/ui`), toasts via sonner re-export

## Product Surfaces

- **Landing:** warm gradient bookends, auth-aware CTAs ("Go to dashboard" when
  signed in), inline waitlist capture. Restrained — the warmth carries it.
- **Console:** static 3-zone sidebar (action · calm middle · utility), per-view
  sub-nav in a top toolbar (never the sidebar), one shared `PageHeader`, dense
  real data (tables, queues, proof chips) over decorative summary cards.
- **Portal:** dark, shares the console theme tokens (`--workspace-surface-*`),
  full-width with a slim top bar, gold vote buttons, proof and receipts on rows.
- **Emails/OG:** Satori-rendered, workspace-branded, cover-image led.

Copy is precise and practical. Prefer "proof", "receipts", "shipped", "who asked",
"source-linked", "close the loop". Avoid vague AI magic, generic feedback-board
language, and automation claims that skip the review path.
