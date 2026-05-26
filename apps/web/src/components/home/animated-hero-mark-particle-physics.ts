import type { ParticleHover, PixelParticle } from "./animated-hero-mark-particle-types";

export function updateParticles(
  particles: PixelParticle[],
  delta: number,
  seconds: number,
  hover: ParticleHover,
) {
  const pace = 0.52 + Math.sin(seconds * 0.32) * 0.12 + Math.sin(seconds * 0.12 + 1.7) * 0.08;
  const spring = 0.115 + pace * 0.012;
  const friction = Math.pow(0.7, delta * 60);

  for (const particle of particles) {
    const orbitPulse = Math.sin(seconds * (0.46 + pace * 0.18) + particle.phase) * particle.depth;
    const radialPulse =
      Math.cos(seconds * (0.58 + pace * 0.2) + particle.phase * 0.7) * particle.depth;
    const jitterX = Math.cos(seconds * (0.72 + pace * 0.18) + particle.phase) * particle.depth;
    const jitterY =
      Math.sin(seconds * (0.64 + pace * 0.16) + particle.phase * 1.13) * particle.depth;
    const pointerDx = particle.homeX - hover.x;
    const pointerDy = particle.homeY - hover.y;
    const pointerDistance = Math.max(1, Math.hypot(pointerDx, pointerDy));
    const pointerFalloff = Math.max(0, 1 - pointerDistance / 108) ** 2 * hover.strength;
    const pointerPush = pointerFalloff * (1.7 + particle.depth * 0.8);
    const pointerSwirl = pointerFalloff * 0.34;
    const idleX =
      jitterX * 0.9 * particle.restless +
      particle.orbitX * orbitPulse * (1.05 + pace * 0.42) +
      particle.radialX * radialPulse * (1.25 + pace * 0.44) +
      (pointerDx / pointerDistance) * pointerPush +
      (-pointerDy / pointerDistance) * pointerSwirl;
    const idleY =
      jitterY * 0.9 * particle.restless +
      particle.orbitY * orbitPulse * (1.05 + pace * 0.42) +
      particle.radialY * radialPulse * (1.25 + pace * 0.44) +
      (pointerDy / pointerDistance) * pointerPush +
      (pointerDx / pointerDistance) * pointerSwirl;
    const driftLength = Math.hypot(idleX, idleY);
    const maxDrift = 2.2 + particle.depth * 1.32 + hover.strength * 1.35;
    const driftScale = driftLength > maxDrift ? maxDrift / driftLength : 1;
    const targetX = particle.homeX + idleX * driftScale;
    const targetY = particle.homeY + idleY * driftScale;

    particle.vx += (targetX - particle.x) * spring;
    particle.vy += (targetY - particle.y) * spring;
    particle.vx *= friction;
    particle.vy *= friction;
    particle.x += particle.vx * delta * 60;
    particle.y += particle.vy * delta * 60;
  }
}
