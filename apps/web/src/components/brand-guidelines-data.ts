export const brandGuidelinesNavItems = [
  ["01", "Features", "/#features"],
  ["02", "Workflow", "/#workflow"],
  ["03", "Pricing", "/#pricing"],
] as const;

export const brandGuidelinesRules = [
  ["Primary logo", "Use the full AMEND.SH lockup for headers, press, decks, and partner pages."],
  [
    "Mark only",
    "Use the transfer-grid mark for favicon, app icons, avatars, and compact UI chrome.",
  ],
  [
    "No extra frame",
    "Do not wrap the mark in a tile unless the platform requires an app icon container.",
  ],
  ["Mono first", "Use white on black or black on light before introducing any accent treatment."],
] as const;

export const brandGuidelinesAscii = [
  "      amend.sh logo       full lockup       favicon mark       svg asset       ",
  "  brand -> source -> story       copy svg       download assets       ",
  "      monochrome first       no outer tile       compact product mark       ",
  "  AMEND.SH       AMEND.SH       AMEND.SH       AMEND.SH       ",
].join("\n");
