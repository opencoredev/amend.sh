import type { PixelParticle } from "./animated-hero-mark-particle-types";

export function drawParticles(
  context: CanvasRenderingContext2D,
  particles: PixelParticle[],
  width: number,
  height: number,
  seconds: number,
) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "rgb(255 255 255)";

  for (const particle of particles) {
    const anchorSize = particle.size * 0.28;

    context.globalAlpha = 0.055;
    context.fillRect(
      particle.homeX - anchorSize / 2,
      particle.homeY - anchorSize / 2,
      anchorSize,
      anchorSize,
    );
  }

  for (const particle of particles) {
    const dx = particle.x - particle.homeX;
    const dy = particle.y - particle.homeY;
    const distanceFromHome = Math.hypot(dx, dy);
    const alpha = Math.min(1, 0.68 + particle.depth * 0.2 + distanceFromHome / 220);
    const twinkle = 0.9 + Math.sin(seconds * 1.45 + particle.phase) * 0.1;
    const size = particle.size * twinkle;

    context.globalAlpha = alpha;
    context.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
  }

  context.globalAlpha = 1;
}
