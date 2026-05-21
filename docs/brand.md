# Amend.sh Brand System

Amend.sh should feel like a source-native product for teams that ship in public:
black, sharp, compact, evidence-led, and calm. The visual language is closer to a
developer infrastructure console than a SaaS marketing page.

## Brand Idea

**Source to shipped story.** GitHub is the shipping record, customer feedback explains
why the work matters, and Amend closes the loop with reviewable changelog, roadmap,
portal, and notification updates.

The product should always make that loop visible:

- a customer asks, reacts, or subscribes
- source work ships in GitHub
- Amend links the shipped work back to the request
- the team reviews or auto-publishes the update
- the right users get notified with source evidence attached

## Visual Direction

The permanent Amend system is monochrome, hard-edged, and source-linked.

- Default to black backgrounds, white foregrounds, muted gray supporting text, and 1px rules.
- Use zero-radius controls and panels through the shared shadcn tokens.
- Use `GeistPixelLine` for landing/display headlines and `Geist Mono` for UI.
- Prefer compact button proportions: `px-6 py-3 text-sm` for landing CTAs and `h-8 text-xs`
  for nav and product controls.
- Use hard hover inversions: foreground background, background text.
- Keep animations restrained: hero reveal, ticker motion, and hover translation only where useful.
- Avoid generic gradients, soft shadows, rounded bento cards, oversized hero badges, and decorative
  blobs.

## Implementation Sources

- Global tokens and font faces: `packages/ui/src/styles/globals.css`
- Landing page pattern: `apps/web/src/routes/index.tsx`
- Local display font: `apps/web/public/fonts/geist-pixel-line.woff2`
- Shared controls: `packages/ui/src/components/button.tsx`
- Brand board asset: `apps/web/public/brand/amend-brand-board.svg`

## Product Surfaces

Use the same design language across the full product:

- **Landing:** pixel-line hero, compact nav, source activity ticker, and black/white CTAs.
- **Dashboard:** dense operational tables, review queues, and rule panels with 1px separators.
- **Portal:** public updates that feel readable but still tied to source evidence.
- **SDK/embed:** compact developer setup surfaces with mono labels, hashes, and status rows.

Copy should be precise and practical. Prefer "source-linked", "reviewable", "close the loop",
"shipped work", and "workspace rules". Avoid vague AI magic, generic feedback-board language,
or claiming automation without explaining the review path.
