import { authClient } from "@/lib/auth-client";

/**
 * Landing call-to-action styles — one shared system so every CTA matches.
 *
 * A clean white solid primary (matching the footer CTA and how premium dark
 * dev-tools ship it — FLORA, Neon, Dovetail, Superpower's white button on a warm
 * background) with crisp dark text. No color fill, no glow, no translucent tint.
 * The secondary is a quiet ghost. Brand orange stays for accents only, not buttons.
 *
 * Sizing/display are intentionally omitted — append `inline-flex h-11 px-6` (hero)
 * / `inline-flex h-9 px-4` (header) at the call site.
 */
export const ctaPrimary =
  "group items-center justify-center gap-2 rounded-lg bg-foreground font-semibold text-background shadow-sm transition-[transform,background-color] duration-150 ease-out hover:bg-foreground/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const ctaGhost =
  "group items-center justify-center gap-1.5 rounded-lg font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground";

/**
 * True once a better-auth session has resolved on the client. During SSR and
 * the first paint this is false (the session is still pending), so CTAs render
 * their signed-out state and then upgrade to "Go to dashboard" after hydration —
 * server and client agree on the initial render, so there's no mismatch.
 */
export function useSignedIn() {
  return Boolean(authClient.useSession().data?.user);
}
