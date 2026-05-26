import { useLayoutEffect, useRef } from "react";

import {
  createAmendPixelParticles,
  drawParticles,
  updateParticles,
} from "./animated-hero-mark-particles";

export function AnimatedHeroMark() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    if (!desktopQuery.matches) {
      return;
    }

    const field = fieldRef.current;
    const canvas = canvasRef.current;

    if (!field || !canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let particles = createAmendPixelParticles(0, 0);
    let width = 0;
    let height = 0;
    const startedAt = performance.now();
    let previousTime = startedAt;
    const hover = { strength: 0, targetStrength: 0, x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = field.getBoundingClientRect();
      hover.x = event.clientX - bounds.left;
      hover.y = event.clientY - bounds.top;
      hover.targetStrength = 1;
    };

    const handlePointerLeave = () => {
      hover.targetStrength = 0;
    };

    const resize = () => {
      const bounds = field.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = createAmendPixelParticles(width, height);
      drawParticles(context, particles, width, height, 0);
    };

    let lastDrawAt = 0;

    const animate = (time: number): void => {
      if (document.visibilityState === "hidden") {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      if (time - lastDrawAt < 42) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      lastDrawAt = time;
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      const seconds = (time - startedAt) / 1000;
      hover.strength += (hover.targetStrength - hover.strength) * Math.min(1, delta * 9);
      updateParticles(particles, delta, seconds, hover);
      drawParticles(context, particles, width, height, seconds);

      animationFrame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(resize);
    resize();
    resizeObserver.observe(field);
    field.addEventListener("pointermove", handlePointerMove, { passive: true });
    field.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      field.removeEventListener("pointermove", handlePointerMove);
      field.removeEventListener("pointerleave", handlePointerLeave);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      aria-hidden
      className="amend-hero-mark relative z-10 hidden h-[500px] min-h-[400px] translate-x-8 select-none overflow-visible xl:translate-x-12 lg:block"
    >
      <canvas ref={canvasRef} className="amend-hero-pixel-canvas absolute inset-0 size-full" />
    </div>
  );
}
