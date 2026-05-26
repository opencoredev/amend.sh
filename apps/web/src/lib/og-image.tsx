import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

import satori from "satori";

import { createPortalTheme, type PortalTheme } from "@/lib/portal-theme";

// ── Font cache ────────────────────────────────────────────────────────────────

let fontRegular: ArrayBuffer | null = null;
let fontBold: ArrayBuffer | null = null;
let monoRegular: ArrayBuffer | null = null;
let monoBold: ArrayBuffer | null = null;

async function loadFonts(origin: string) {
  if (!fontRegular) {
    fontRegular = await fetch(`${origin}/fonts/geist-sans-400.ttf`).then((r) =>
      r.arrayBuffer(),
    );
  }
  if (!fontBold) {
    fontBold = await fetch(`${origin}/fonts/geist-sans-700.ttf`).then((r) => r.arrayBuffer());
  }
  if (!monoRegular) {
    monoRegular = await fetch(`${origin}/fonts/geist-mono-400.ttf`).then((r) =>
      r.arrayBuffer(),
    );
  }
  if (!monoBold) {
    monoBold = await fetch(`${origin}/fonts/geist-mono-700.ttf`).then((r) => r.arrayBuffer());
  }
  return {
    fontRegular: fontRegular!,
    fontBold: fontBold!,
    monoRegular: monoRegular!,
    monoBold: monoBold!,
  };
}

// ── WASM/Resvg singleton ──────────────────────────────────────────────────────

let resvgInitPromise: Promise<void> | null = null;
const require = createRequire(import.meta.url);

async function ensureResvg() {
  if (!resvgInitPromise) {
    resvgInitPromise = (async () => {
      const { initWasm } = await import("@resvg/resvg-wasm");
      const wasmPath = require.resolve("@resvg/resvg-wasm/index_bg.wasm");
      const wasm = await readFile(wasmPath);
      try {
        await initWasm(wasm);
      } catch (error) {
        if (!String(error).includes("Already initialized")) {
          throw error;
        }
      }
    })();
  }
  return resvgInitPromise;
}

async function svgToPng(svg: string): Promise<Uint8Array> {
  await ensureResvg();
  const { Resvg } = await import("@resvg/resvg-wasm");
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  return resvg.render().asPng();
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const BG = "#0d0d0f";
const FG = "#f1f1f0";
const MUTED = "#a7a7af";
const CARD = "#111113";
const BORDER = "#1f1f23";
const BRACKET = "rgba(255,255,255,0.28)";
const FONT = "GeistSans";
const MONO_FONT = "GeistMono";

// ── Shared components ─────────────────────────────────────────────────────────

function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          border: `1px solid ${BORDER}`,
          background: CARD,
        }}
      >
        <div style={{ width: 10, height: 10, background: FG }} />
      </div>
      <div style={{ display: "flex", fontFamily: FONT, fontWeight: 700, fontSize: 15, letterSpacing: 0 }}>
        <span style={{ color: FG }}>AMEND</span>
        <span style={{ color: MUTED }}>.SH</span>
      </div>
    </div>
  );
}

function CornerBrackets() {
  const arm = 36;
  const gap = 32;
  const w = 1.5;

  return (
    <>
      <div style={{ position: "absolute", top: gap, left: gap, width: arm, height: arm, borderTop: `${w}px solid ${BRACKET}`, borderLeft: `${w}px solid ${BRACKET}`, display: "flex" }} />
      <div style={{ position: "absolute", top: gap, right: gap, width: arm, height: arm, borderTop: `${w}px solid ${BRACKET}`, borderRight: `${w}px solid ${BRACKET}`, display: "flex" }} />
      <div style={{ position: "absolute", bottom: gap, left: gap, width: arm, height: arm, borderBottom: `${w}px solid ${BRACKET}`, borderLeft: `${w}px solid ${BRACKET}`, display: "flex" }} />
      <div style={{ position: "absolute", bottom: gap, right: gap, width: arm, height: arm, borderBottom: `${w}px solid ${BRACKET}`, borderRight: `${w}px solid ${BRACKET}`, display: "flex" }} />
    </>
  );
}

function DotGrid() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

// ── Landing page OG ───────────────────────────────────────────────────────────

function LandingOgImage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1200, height: 630, background: BG, position: "relative", overflow: "hidden", fontFamily: FONT }}>
      <DotGrid />
      <CornerBrackets />

      {/* Left vertical line accent */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 56, width: 1, background: BORDER, display: "flex" }} />

      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "52px 80px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BrandMark />
          <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: MUTED, letterSpacing: 0 }}>AMEND.SH</span>
        </div>

        {/* Main copy */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: FONT, fontSize: 60, fontWeight: 700, lineHeight: 1.04, letterSpacing: 0, maxWidth: 900 }}>
            <span style={{ color: FG }}>Users asked. You shipped.</span>
            <span style={{ color: MUTED }}>Amend closes the loop.</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 17, color: MUTED, lineHeight: 1.6, maxWidth: 700, fontFamily: FONT }}>
            Amend watches the places users talk, groups repeated demand, follows the work through GitHub and Linear, and updates the people who asked.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 36, fontFamily: MONO_FONT }}>
            {["Collect", "Connect", "Build", "Close"].map((label) => (
              <span key={label} style={{ fontSize: 11, letterSpacing: 0, color: MUTED, textTransform: "uppercase" as const }}>
                {label}
              </span>
            ))}
          </div>
          <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: MUTED, opacity: 0.55, letterSpacing: 0 }}>
            FEEDBACK THAT FINDS ITS WAY BACK
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Portal OG ─────────────────────────────────────────────────────────────────

type PortalOgImageProps = {
  accentColor?: string;
  workspaceName: string;
  description?: string;
  label?: string;
};

function PortalOgImage({ workspaceName, description, accentColor, label }: PortalOgImageProps) {
  const theme = createPortalTheme(accentColor);
  const initials = workspaceName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1200, height: 630, background: theme.background, position: "relative", overflow: "hidden", fontFamily: FONT }}>
      <ThemedDotGrid theme={theme} />
      <CornerBrackets />

      {/* Shadcn-style workspace theme accents */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 5, background: theme.accent, display: "flex" }} />
      <div style={{ position: "absolute", left: 76, right: 76, top: 126, height: 1, background: theme.border, display: "flex" }} />
      <div style={{ position: "absolute", right: 86, top: 150, width: 210, height: 210, border: `1px solid ${theme.border}`, background: theme.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", width: 92, height: 92, alignItems: "center", justifyContent: "center", background: theme.accent, color: theme.accentForeground, fontFamily: FONT, fontWeight: 700, fontSize: 34 }}>
          {initials || "A"}
        </div>
      </div>
      <div style={{ position: "absolute", right: 124, top: 398, width: 132, height: 10, background: theme.accent, opacity: 0.9, display: "flex" }} />
      <div style={{ position: "absolute", right: 84, top: 426, width: 212, height: 1, background: theme.border, display: "flex" }} />

      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "52px 80px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BrandMark />
          <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: theme.mutedForeground, letterSpacing: 0, textTransform: "uppercase" as const }}>
            {label ?? "Public Portal"}
          </span>
        </div>

        {/* Workspace name */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", paddingRight: 270 }}>
          <div style={{ display: "flex", fontFamily: FONT, fontSize: 70, fontWeight: 700, color: theme.foreground, lineHeight: 1.0, letterSpacing: 0, maxWidth: 760, overflow: "hidden" }}>
            {workspaceName.length > 22 ? `${workspaceName.slice(0, 22)}...` : workspaceName}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 18, color: theme.mutedForeground, lineHeight: 1.5, maxWidth: 670, fontFamily: FONT }}>
            {description
              ? description.length > 110
                ? `${description.slice(0, 107)}...`
                : description
              : "Changelog · Roadmap · Feedback"}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: `1px solid ${theme.border}` }}>
          <span style={{ fontFamily: MONO_FONT, fontSize: 12, color: theme.mutedForeground, letterSpacing: 0, textTransform: "uppercase" as const }}>
            Powered by Amend.sh
          </span>
          <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: theme.mutedForeground, opacity: 0.55, letterSpacing: 0 }}>
            SOURCE-LINKED PRODUCT UPDATES
          </span>
        </div>
      </div>
    </div>
  );
}

function ThemedDotGrid({ theme }: { theme: PortalTheme }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        backgroundImage: `radial-gradient(circle, ${theme.border} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export type OgImageParams =
  | { type: "landing" }
  | {
      type: "portal";
      workspaceName: string;
      description?: string;
      accentColor?: string;
      label?: string;
    };

export async function generateOgPng(params: OgImageParams, origin: string): Promise<Uint8Array> {
  const { fontRegular, fontBold, monoRegular, monoBold } = await loadFonts(origin);

  const element =
    params.type === "landing" ? (
      <LandingOgImage />
    ) : (
      <PortalOgImage
        workspaceName={params.workspaceName}
        description={params.description}
        accentColor={params.accentColor}
        label={params.label}
      />
    );

  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [
      { name: FONT, data: fontRegular, weight: 400, style: "normal" },
      { name: FONT, data: fontBold, weight: 700, style: "normal" },
      { name: MONO_FONT, data: monoRegular, weight: 400, style: "normal" },
      { name: MONO_FONT, data: monoBold, weight: 700, style: "normal" },
    ],
  });

  return svgToPng(svg);
}
