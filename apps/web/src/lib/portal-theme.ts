import type { CSSProperties } from "react";

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

type Rgb = {
  b: number;
  g: number;
  r: number;
};

export type PortalTheme = {
  accent: string;
  accentForeground: string;
  background: string;
  border: string;
  card: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  ring: string;
};

const DEFAULT_ACCENT = "#f1f1f0";

export function normalizePortalAccent(value?: string) {
  if (!value || !HEX_COLOR_RE.test(value.trim())) {
    return DEFAULT_ACCENT;
  }

  const color = value.trim();
  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase();
  }

  return color.toLowerCase();
}

export function createPortalTheme(accentColor?: string): PortalTheme {
  const accent = normalizePortalAccent(accentColor);
  const accentRgb = hexToRgb(accent);
  const accentForeground = contrastColor(accentRgb);
  const background = "#0d0d0f";
  const card = "#111113";

  return {
    accent,
    accentForeground,
    background,
    border: mixHex(accentRgb, hexToRgb("#1f1f23"), 0.18),
    card,
    foreground: "#f1f1f0",
    muted: mixHex(accentRgb, hexToRgb("#17171a"), 0.1),
    mutedForeground: "#a7a7af",
    ring: accent,
  };
}

export function portalThemeStyle(theme: PortalTheme) {
  return {
    "--accent": theme.muted,
    "--accent-foreground": theme.foreground,
    "--border": theme.border,
    "--card": theme.card,
    "--input": theme.border,
    "--primary": theme.accent,
    "--primary-foreground": theme.accentForeground,
    "--ring": theme.ring,
  } as CSSProperties;
}

function hexToRgb(hex: string): Rgb {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function mixHex(a: Rgb, b: Rgb, amount: number) {
  const mix = (channel: keyof Rgb) => Math.round(a[channel] * amount + b[channel] * (1 - amount));
  return rgbToHex({ r: mix("r"), g: mix("g"), b: mix("b") });
}

function rgbToHex({ b, g, r }: Rgb) {
  const channel = (value: number) => value.toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function contrastColor(rgb: Rgb) {
  const luminance = relativeLuminance(rgb);
  return luminance > 0.55 ? "#111113" : "#ffffff";
}

function relativeLuminance({ b, g, r }: Rgb) {
  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}
