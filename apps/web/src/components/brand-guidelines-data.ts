export const brandGuidelinesNavItems = [
  ["01", "Features", "/#features"],
  ["02", "Pricing", "/#pricing"],
] as const;

export const brandGuidelinesRules = [
  ["Primary logo", "Use the full AMEND.SH lockup for headers, press, decks, and partner pages."],
  [
    "Mark only",
    "Use the A-splice mark for favicon, app icons, avatars, and compact UI chrome.",
  ],
  [
    "No extra frame",
    "Do not wrap the mark in a tile unless the platform requires an app icon container.",
  ],
  ["Light and dark", "Use the explicit light or dark logo file for each background surface."],
] as const;

export const brandGuidelinesAscii = [
  "      amend.sh logo       full lockup       favicon mark       svg asset       ",
  "  brand -> source -> story       copy svg       download assets       ",
  "      a-splice mark       light logo       dark logo       compact product mark       ",
  "  AMEND.SH       AMEND.SH       AMEND.SH       AMEND.SH       ",
].join("\n");
