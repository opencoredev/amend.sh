import { useEffect } from "react";

/**
 * Scroll-reveal orchestration for the landing page.
 *
 * SSR-safe by design: the hidden start-state for `[data-reveal]` elements is
 * gated behind the `amend-motion-ready` class, which is only added on the
 * client after mount. Without JS (or before hydration) every element renders
 * fully visible, so there is never invisible content.
 */
export function useLandingMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      return;
    }

    root.classList.add("amend-motion-ready");

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    targets.forEach((el) => observer.observe(el));

    // Safety net: reveal anything still hidden after a beat (e.g. tall viewports).
    const fallback = window.setTimeout(() => {
      targets.forEach((el) => el.classList.add("is-in"));
    }, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      root.classList.remove("amend-motion-ready");
    };
  }, []);
}
