export function deterministicNoise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43_758.5453;

  return value - Math.floor(value);
}
