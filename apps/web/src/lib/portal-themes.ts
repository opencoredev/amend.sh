import type { CSSProperties } from "react";

export type PortalThemeAppearance = "dark" | "light";
export type PortalThemeVars = Record<string, string>;

export type PortalThemePreset = {
  dark: PortalThemeVars;
  defaultAppearance: PortalThemeAppearance;
  description: string;
  id: string;
  label: string;
  light: PortalThemeVars;
};

/** The shadcn tokens we apply to the portal subtree. Fonts/shadows/charts are intentionally excluded. */
const APPLIED_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "radius",
] as const;

// "Amend" carries no overrides — it inherits the app's own dashboard theme tokens.
const AMEND: PortalThemePreset = {
  id: "amend",
  label: "Amend",
  description: "The default Amend dark theme — matches your dashboard.",
  defaultAppearance: "dark",
  light: {},
  dark: {},
};

const COBALT: PortalThemePreset = {
  id: "cobalt",
  label: "Cobalt",
  description: "Crisp neutral surfaces with an electric blue accent.",
  defaultAppearance: "dark",
  light: {
    background: "oklch(0.9911 0 0)",
    foreground: "oklch(0.2046 0 0)",
    card: "oklch(0.9911 0 0)",
    "card-foreground": "oklch(0.2046 0 0)",
    popover: "oklch(0.9911 0 0)",
    "popover-foreground": "oklch(0.4386 0 0)",
    primary: "oklch(0.6231 0.188 259.8145)",
    "primary-foreground": "oklch(1 0 0)",
    secondary: "oklch(0.994 0 0)",
    "secondary-foreground": "oklch(0.2046 0 0)",
    muted: "oklch(0.9461 0 0)",
    "muted-foreground": "oklch(0.2435 0 0)",
    accent: "oklch(0.9461 0 0)",
    "accent-foreground": "oklch(0.2435 0 0)",
    destructive: "oklch(0.5523 0.1927 32.7272)",
    "destructive-foreground": "oklch(0.9934 0.0032 17.2118)",
    border: "oklch(0.9037 0 0)",
    input: "oklch(0.9731 0 0)",
    ring: "oklch(0.6231 0.188 259.8145)",
    radius: "0.5rem",
  },
  dark: {
    background: "oklch(0.1822 0 0)",
    foreground: "oklch(0.9288 0.0126 255.5078)",
    card: "oklch(0.2046 0 0)",
    "card-foreground": "oklch(0.9288 0.0126 255.5078)",
    popover: "oklch(0.2603 0 0)",
    "popover-foreground": "oklch(0.7348 0 0)",
    primary: "oklch(0.6231 0.188 259.8145)",
    "primary-foreground": "oklch(0.9851 0 0)",
    secondary: "oklch(0.2603 0 0)",
    "secondary-foreground": "oklch(0.9851 0 0)",
    muted: "oklch(0.2393 0 0)",
    "muted-foreground": "oklch(0.7122 0 0)",
    accent: "oklch(0.3132 0 0)",
    "accent-foreground": "oklch(0.9851 0 0)",
    destructive: "oklch(0.3123 0.0852 29.7877)",
    "destructive-foreground": "oklch(0.9368 0.0045 34.3092)",
    border: "oklch(0.2809 0 0)",
    input: "oklch(0.2603 0 0)",
    ring: "oklch(0.7137 0.1434 254.624)",
    radius: "0.5rem",
  },
};

const T3_CHAT: PortalThemePreset = {
  id: "t3-chat",
  label: "T3 Chat",
  description: "Soft rose surfaces with a warm magenta accent.",
  defaultAppearance: "light",
  light: {
    background: "oklch(0.9754 0.0084 325.6414)",
    foreground: "oklch(0.3257 0.1161 325.0372)",
    card: "oklch(0.9754 0.0084 325.6414)",
    "card-foreground": "oklch(0.3257 0.1161 325.0372)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.3257 0.1161 325.0372)",
    primary: "oklch(0.5316 0.1409 355.1999)",
    "primary-foreground": "oklch(1 0 0)",
    secondary: "oklch(0.8696 0.0675 334.8991)",
    "secondary-foreground": "oklch(0.4448 0.1341 324.7991)",
    muted: "oklch(0.9395 0.026 331.5454)",
    "muted-foreground": "oklch(0.4924 0.1244 324.4523)",
    accent: "oklch(0.8696 0.0675 334.8991)",
    "accent-foreground": "oklch(0.4448 0.1341 324.7991)",
    destructive: "oklch(0.5248 0.1368 20.8317)",
    "destructive-foreground": "oklch(1 0 0)",
    border: "oklch(0.8568 0.0829 328.911)",
    input: "oklch(0.8517 0.0558 336.6002)",
    ring: "oklch(0.5916 0.218 0.5844)",
    radius: "0.5rem",
  },
  dark: {
    background: "oklch(0.2409 0.0201 307.5346)",
    foreground: "oklch(0.8398 0.0387 309.5391)",
    card: "oklch(0.2803 0.0232 307.5413)",
    "card-foreground": "oklch(0.8456 0.0302 341.4597)",
    popover: "oklch(0.1548 0.0132 338.9015)",
    "popover-foreground": "oklch(0.9647 0.0091 341.8035)",
    primary: "oklch(0.4607 0.1853 4.0994)",
    "primary-foreground": "oklch(0.856 0.0618 346.3684)",
    secondary: "oklch(0.3137 0.0306 310.061)",
    "secondary-foreground": "oklch(0.8483 0.0382 307.9613)",
    muted: "oklch(0.2634 0.0219 309.4748)",
    "muted-foreground": "oklch(0.794 0.0372 307.1032)",
    accent: "oklch(0.3649 0.0508 308.4911)",
    "accent-foreground": "oklch(0.9647 0.0091 341.8035)",
    destructive: "oklch(0.2258 0.0524 12.6119)",
    "destructive-foreground": "oklch(1 0 0)",
    border: "oklch(0.3286 0.0154 343.4461)",
    input: "oklch(0.3387 0.0195 332.8347)",
    ring: "oklch(0.5916 0.218 0.5844)",
    radius: "0.5rem",
  },
};

const AMBER: PortalThemePreset = {
  id: "amber",
  label: "Amber",
  description: "Warm paper background with a caramel accent.",
  defaultAppearance: "light",
  light: {
    background: "oklch(0.9818 0.0054 95.0986)",
    foreground: "oklch(0.3438 0.0269 95.7226)",
    card: "oklch(0.9818 0.0054 95.0986)",
    "card-foreground": "oklch(0.1908 0.002 106.5859)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.2671 0.0196 98.939)",
    primary: "oklch(0.6171 0.1375 39.0427)",
    "primary-foreground": "oklch(1 0 0)",
    secondary: "oklch(0.9245 0.0138 92.9892)",
    "secondary-foreground": "oklch(0.4334 0.0177 98.6048)",
    muted: "oklch(0.9341 0.0153 90.239)",
    "muted-foreground": "oklch(0.6059 0.0075 97.4233)",
    accent: "oklch(0.9245 0.0138 92.9892)",
    "accent-foreground": "oklch(0.2671 0.0196 98.939)",
    destructive: "oklch(0.1908 0.002 106.5859)",
    "destructive-foreground": "oklch(1 0 0)",
    border: "oklch(0.8847 0.0069 97.3627)",
    input: "oklch(0.7621 0.0156 98.3528)",
    ring: "oklch(0.6171 0.1375 39.0427)",
    radius: "0.5rem",
  },
  dark: {
    background: "oklch(0.2679 0.0036 106.6427)",
    foreground: "oklch(0.8074 0.0142 93.0137)",
    card: "oklch(0.2679 0.0036 106.6427)",
    "card-foreground": "oklch(0.9818 0.0054 95.0986)",
    popover: "oklch(0.3085 0.0035 106.6039)",
    "popover-foreground": "oklch(0.9211 0.004 106.4781)",
    primary: "oklch(0.6724 0.1308 38.7559)",
    "primary-foreground": "oklch(1 0 0)",
    secondary: "oklch(0.9818 0.0054 95.0986)",
    "secondary-foreground": "oklch(0.3085 0.0035 106.6039)",
    muted: "oklch(0.2213 0.0038 106.707)",
    "muted-foreground": "oklch(0.7713 0.0169 99.0657)",
    accent: "oklch(0.213 0.0078 95.4245)",
    "accent-foreground": "oklch(0.9663 0.008 98.8792)",
    destructive: "oklch(0.6368 0.2078 25.3313)",
    "destructive-foreground": "oklch(1 0 0)",
    border: "oklch(0.3618 0.0101 106.8928)",
    input: "oklch(0.4336 0.0113 100.2195)",
    ring: "oklch(0.6724 0.1308 38.7559)",
    radius: "0.5rem",
  },
};

export const PORTAL_THEME_PRESETS: PortalThemePreset[] = [AMEND, COBALT, T3_CHAT, AMBER];

export const CUSTOM_PORTAL_THEME_ID = "custom";

export function getPortalThemePreset(id?: string): PortalThemePreset | undefined {
  return PORTAL_THEME_PRESETS.find((preset) => preset.id === id);
}

/** The colors used for a preset's swatch preview in settings. */
export function portalThemeSwatch(preset: PortalThemePreset) {
  const vars = preset[preset.defaultAppearance];
  const fallback = preset.defaultAppearance === "dark";
  return {
    background: vars.background ?? (fallback ? "oklch(0.18 0 0)" : "oklch(0.99 0 0)"),
    card: vars.card ?? (fallback ? "oklch(0.22 0 0)" : "oklch(0.97 0 0)"),
    primary: vars.primary ?? (fallback ? "oklch(0.92 0 0)" : "oklch(0.55 0 0)"),
    border: vars.border ?? (fallback ? "oklch(0.30 0 0)" : "oklch(0.90 0 0)"),
  };
}

type PortalThemeSettings = {
  customThemeCss?: string;
  themeAppearance?: PortalThemeAppearance;
  themePreset?: string;
};

export type ResolvedPortalTheme = {
  appearance: PortalThemeAppearance;
  isDark: boolean;
  vars: PortalThemeVars;
};

export function resolvePortalTheme(settings?: PortalThemeSettings): ResolvedPortalTheme {
  if (settings?.themePreset === CUSTOM_PORTAL_THEME_ID && settings.customThemeCss?.trim()) {
    const parsed = parseThemeCss(settings.customThemeCss);
    const appearance =
      settings.themeAppearance ?? (parsed.dark && !parsed.light ? "dark" : "light");
    const vars =
      (appearance === "dark" ? (parsed.dark ?? parsed.light) : (parsed.light ?? parsed.dark)) ?? {};
    return { appearance, isDark: appearance === "dark", vars };
  }

  const preset = getPortalThemePreset(settings?.themePreset) ?? AMEND;
  const appearance = settings?.themeAppearance ?? preset.defaultAppearance;
  return {
    appearance,
    isDark: appearance === "dark",
    vars: appearance === "dark" ? preset.dark : preset.light,
  };
}

/** Map a resolved var set to an inline style object scoped to the portal root. */
export function portalThemeStyleVars(vars: PortalThemeVars): CSSProperties {
  const style: Record<string, string> = {};
  for (const token of APPLIED_TOKENS) {
    const value = vars[token];
    if (value) {
      style[`--${token}`] = value;
    }
  }
  return style as CSSProperties;
}

const DECLARATION_RE = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;

function parseDeclarations(body: string): PortalThemeVars | undefined {
  const vars: PortalThemeVars = {};
  for (const match of body.matchAll(DECLARATION_RE)) {
    const [, name, value] = match;
    if ((APPLIED_TOKENS as readonly string[]).includes(name)) {
      vars[name] = value.trim();
    }
  }
  return Object.keys(vars).length > 0 ? vars : undefined;
}

/** Parse a tweakcn-style CSS export into light (`:root`) and dark (`.dark`) token maps. */
export function parseThemeCss(css: string): { dark?: PortalThemeVars; light?: PortalThemeVars } {
  const root = css.match(/:root\s*\{([\s\S]*?)\}/);
  const dark = css.match(/\.dark\s*\{([\s\S]*?)\}/);
  return {
    light: root ? parseDeclarations(root[1]) : undefined,
    dark: dark ? parseDeclarations(dark[1]) : undefined,
  };
}
