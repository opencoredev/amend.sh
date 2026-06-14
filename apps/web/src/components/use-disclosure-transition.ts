import { useEffect, useRef, useState } from "react";

type DropdownOrigin =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type DisclosureTransition = {
  /** Whether the element should be in the DOM (stays mounted through the exit animation). */
  mounted: boolean;
  /** `t-dropdown` lifecycle class to spread onto the animated element. */
  className: string;
  /** Maps to the `data-origin` attribute consumed by the `t-dropdown` styles. */
  "data-origin": DropdownOrigin;
};

const CLOSE_FALLBACK_MS = 180;

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Drives the shared `t-dropdown` enter/exit motion system (see styles/motion.css).
 *
 * Mount with the closed pre-state, flip to `is-open` on the next frame so the
 * entrance transition actually plays, then hold the node through `is-closing`
 * before unmounting. Respects `prefers-reduced-motion` by skipping the delays.
 */
export function useDisclosureTransition(
  open: boolean,
  origin: DropdownOrigin = "top-left",
): DisclosureTransition {
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<"pre" | "open" | "closing">(open ? "open" : "closing");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousOpen = useRef(open);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;

    // Replay the entrance only on a real closed→open transition. When the
    // element is already open on mount (e.g. pre-opened from URL state) the
    // first render is already in the open phase; replaying would flash through
    // the pre-state for two frames.
    const justOpened = open && !previousOpen.current;
    previousOpen.current = open;

    if (open) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setMounted(true);
      if (justOpened && !prefersReducedMotion()) {
        setPhase("pre");
        raf1 = requestAnimationFrame(() => {
          raf2 = requestAnimationFrame(() => setPhase("open"));
        });
      } else {
        setPhase("open");
      }
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    setPhase("closing");
    const delay = prefersReducedMotion() ? 0 : CLOSE_FALLBACK_MS;
    closeTimer.current = setTimeout(() => setMounted(false), delay);
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
    // `mounted` intentionally omitted: this effect reacts to `open` changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const className =
    phase === "open"
      ? "t-dropdown is-open"
      : phase === "closing"
        ? "t-dropdown is-closing"
        : "t-dropdown";

  return { mounted, className, "data-origin": origin };
}
