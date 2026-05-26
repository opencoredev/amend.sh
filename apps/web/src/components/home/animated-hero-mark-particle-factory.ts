import {
  addDitheredFilledRect,
  addNodeDust,
  addStrokedLine,
  addStrokedRect,
} from "./animated-hero-mark-particle-shapes";
import type { PixelParticle } from "./animated-hero-mark-particle-types";
import { deterministicNoise } from "./animated-hero-mark-particle-utils";

export function createAmendPixelParticles(width: number, height: number) {
  const particles: PixelParticle[] = [];
  const scale = (Math.min(width, height) * 0.72) / 64;
  const centerX = width * 0.62;
  const centerY = height * 0.5;
  const originX = width * 0.62 - 32 * scale;
  const originY = height * 0.5 - 32 * scale;
  const register = (x: number, y: number, size = 1) => {
    const noiseA = deterministicNoise(x + 3, y + 7);
    const noiseB = deterministicNoise(x + 11, y + 5);
    const structuralJitter = scale * 0.08;
    const homeX = originX + x * scale + (noiseA - 0.5) * structuralJitter;
    const homeY = originY + y * scale + (noiseB - 0.5) * structuralJitter;
    const centerDistance = Math.max(1, Math.hypot(homeX - centerX, homeY - centerY));
    const radialX = (homeX - centerX) / centerDistance;
    const radialY = (homeY - centerY) / centerDistance;
    const restless = 0.78 + deterministicNoise(x + 41, y + 43) * 0.48;

    particles.push({
      depth: 0.55 + deterministicNoise(x, y) * 0.8,
      homeX,
      homeY,
      orbitX: -radialY,
      orbitY: radialX,
      phase: deterministicNoise(y + 17, x + 29) * Math.PI * 2,
      radialX,
      radialY,
      restless,
      size: Math.max(2, scale * 0.34 * size * (0.9 + deterministicNoise(x + 31, y + 37) * 0.2)),
      vx: 0,
      vy: 0,
      x: homeX + (noiseA - 0.5) * 2.5,
      y: homeY + (noiseB - 0.5) * 2.5,
    });
  };

  addStrokedRect(register, 8, 8, 16, 16, 1.72);
  addNodeDust(register, 8, 8, 16, 16, 1.9);
  addDitheredFilledRect(register, 24, 24, 16, 16, 1.9);
  addStrokedRect(register, 40, 8, 16, 16, 1.7);
  addStrokedRect(register, 8, 40, 16, 16, 1.7);
  addStrokedLine(register, 22, 16, 42, 16, 1.6);
  addStrokedLine(register, 48, 22, 48, 31, 1.6);
  addStrokedLine(register, 48, 31, 39, 31, 1.6);
  addStrokedLine(register, 25, 33, 16, 33, 1.6);
  addStrokedLine(register, 16, 33, 16, 42, 1.6);

  return particles;
}
