import { deterministicNoise } from "./animated-hero-mark-particle-utils";

type ParticleRegister = (x: number, y: number, size?: number) => void;

export function addDitheredFilledRect(
  register: ParticleRegister,
  x: number,
  y: number,
  width: number,
  height: number,
  step: number,
) {
  for (let px = x + step / 2; px < x + width; px += step) {
    for (let py = y + step / 2; py < y + height; py += step) {
      const left = px - x;
      const right = x + width - px;
      const top = py - y;
      const bottom = y + height - py;
      const edgeDistance = Math.min(left, right, top, bottom);
      const centerDistance = Math.hypot(px - (x + width / 2), py - (y + height / 2));
      const edgeLift = edgeDistance < step * 1.5 ? 0.2 : 0;
      const centerLift = centerDistance < Math.min(width, height) * 0.18 ? 0.12 : 0;
      const threshold = 0.18 + edgeLift + centerLift;

      if (deterministicNoise(px + 53, py + 59) > threshold) {
        register(
          px + (deterministicNoise(px + 61, py + 67) - 0.5) * step * 0.42,
          py + (deterministicNoise(px + 71, py + 73) - 0.5) * step * 0.42,
          0.98,
        );
      }
    }
  }
}

export function addNodeDust(
  register: ParticleRegister,
  x: number,
  y: number,
  width: number,
  height: number,
  step: number,
) {
  const centerX = x + width * 0.46;
  const centerY = y + height * 0.48;

  for (let px = x + step * 0.8; px < x + width - step * 0.6; px += step) {
    for (let py = y + step * 0.8; py < y + height - step * 0.6; py += step) {
      const nx = (px - centerX) / width;
      const ny = (py - centerY) / height;
      const connectorBias = px > x + width * 0.54 && Math.abs(py - (y + height * 0.5)) < step * 2;
      const cornerCut = px < x + width * 0.3 && py > y + height * 0.65;
      const diagonalLift = Math.abs(nx - ny * 0.6) * 0.16;
      const threshold = (connectorBias ? 0.5 : 0.7) + diagonalLift + (cornerCut ? 0.22 : 0);

      if (deterministicNoise(px + 113, py + 127) > threshold) {
        register(
          px + (deterministicNoise(px + 131, py + 137) - 0.5) * step * 0.42,
          py + (deterministicNoise(px + 139, py + 149) - 0.5) * step * 0.42,
          0.72,
        );
      }
    }
  }
}

export function addStrokedRect(
  register: ParticleRegister,
  x: number,
  y: number,
  width: number,
  height: number,
  step: number,
) {
  addStrokedLine(register, x, y, x + width, y, step);
  addStrokedLine(register, x + width, y, x + width, y + height, step);
  addStrokedLine(register, x + width, y + height, x, y + height, step);
  addStrokedLine(register, x, y + height, x, y, step);
}

export function addStrokedLine(
  register: ParticleRegister,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  step: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const nx = length === 0 ? 0 : -dy / length;
  const ny = length === 0 ? 0 : dx / length;
  const samples = Math.max(1, Math.ceil(length / step));

  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const x = x1 + dx * t;
    const y = y1 + dy * t;

    if (deterministicNoise(x + 83, y + 89) < 0.08) {
      continue;
    }

    const jitterX = (deterministicNoise(x + 97, y + 101) - 0.5) * step * 0.22;
    const jitterY = (deterministicNoise(x + 103, y + 107) - 0.5) * step * 0.22;

    for (const offset of [-1.2, 0, 1.2]) {
      register(x + nx * offset + jitterX, y + ny * offset + jitterY, 0.9);
    }
  }
}
