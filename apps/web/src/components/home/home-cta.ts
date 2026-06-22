/**
 * Landing call-to-action styles — one shared system so every CTA matches.
 *
 * Grounded in how premium dark dev-tools ship their hero CTA (Linear, Neon,
 * FLORA, Dovetail, Resend): a flat, SOLID primary in the brand color with crisp
 * dark text — no glow, no shadow, no translucent tint. Those all read as cheap on
 * a dark page. The secondary is a quiet ghost.
 *
 * Sizing/display are intentionally omitted — append `inline-flex h-11 px-6` (hero)
 * / `inline-flex h-9 px-4` (header) at the call site.
 */
export const ctaPrimary =
  "group items-center justify-center gap-2 rounded-lg bg-amend-warm font-semibold text-amend-warm-foreground transition-[transform,filter] duration-150 ease-out hover:brightness-[1.06] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amend-warm/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const ctaGhost =
  "group items-center justify-center gap-1.5 rounded-lg font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground";
