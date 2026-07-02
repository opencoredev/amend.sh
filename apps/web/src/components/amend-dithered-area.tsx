/**
 * Dithered area charts — the dithering is the FILL of an area chart, rendered as
 * ordered (Bayer 8×8) dithering of a vertical density gradient on a <canvas>.
 *
 * The trick that gives the "delicate dotted falloff" look (vs. a flat slab of
 * grain dimmed by a CSS fade): the dithered *field* carries a per-column
 * gradient that is dense right under the line and thins to nothing toward the
 * baseline, so the DOTS themselves get sparser going down — not just darker.
 * This is the same algorithm a dithering shader runs internally (`dot =
 * field > bayerThreshold`), but here we control the field, which a fixed-shape
 * shader won't let us do. A crisp <svg> line sits on top.
 *
 * Everything is static (no WebGL, no RAF): one canvas draw per geometry change,
 * redrawn on resize via a ResizeObserver. Cheap, and motionless by nature.
 */
import { cn } from "@amend/ui/lib/utils";
import { type MouseEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { InsightsPoint } from "@/lib/amend-contract";

const GOLD = "#ef9836"; // demand / signal
const GREEN = "#67e19f"; // shipped / success

// Dither tuning — the dot grid pitch and how fast density thins toward the
// baseline. Kept here so the texture is easy to dial in one place.
const CELL_CSS = 2.5; // dot-grid pitch in CSS px
const DOT_GAP_CSS = 0.5; // gap between dots in CSS px (reads as a matrix, not a slab)
const TOP_DENSITY = 0.92; // dot density right under the line (0–1)
const FALLOFF = 1.9; // higher = dots thin out faster going down
const LIGHT_LIFT = 0.22; // subtle whiten of dots right at the line

// Bayer 8×8 ordered-dithering matrix (values 0–63) — the per-cell threshold.
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7,
  39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(REDUCE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Live `prefers-reduced-motion`, read through an external store (no effect). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () =>
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia(REDUCE_QUERY).matches
        : false,
    () => false,
  );
}

type Point = [number, number];

type BuiltPaths = {
  line: string;
  points: Point[];
};

/**
 * Build the line path + points for `values` in a normalised 0–100 × 0–100 space
 * (the SVG renders with preserveAspectRatio="none", so it stretches to any
 * container; the canvas reads the same points so its fill aligns to the line).
 */
function buildPaths(
  values: number[],
  opts: { max?: number; min?: number; padTop?: number; padBottom?: number } = {},
): BuiltPaths {
  const n = values.length;
  const max = opts.max ?? Math.max(...values, 1);
  const min = opts.min ?? Math.min(...values, 0);
  const range = max - min || 1;
  const padTop = opts.padTop ?? 0.14;
  const padBottom = opts.padBottom ?? 0.04;
  const usable = 100 * (1 - padTop - padBottom);
  const xAt = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * 100);
  const yAt = (v: number) => 100 * padTop + (1 - (v - min) / range) * usable;
  const points = values.map((v, i): Point => [xAt(i), yAt(v)]);
  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  return { line, points };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}` : h;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Interpolate the line's y (0–100) at a normalised x (0–100). */
function lineYAt(points: Point[], xN: number): number {
  const m = points.length;
  if (m === 0) return 100;
  if (m === 1) return points[0][1];
  const span = (xN / 100) * (m - 1);
  const i = Math.min(m - 2, Math.max(0, Math.floor(span)));
  const [x0, y0] = points[i];
  const [x1, y1] = points[i + 1];
  const t = x1 === x0 ? 0 : (xN - x0) / (x1 - x0);
  return y0 + (y1 - y0) * Math.max(0, Math.min(1, t));
}

/**
 * Paint the dithered fill under `points` into `canvas`, sized to its CSS box.
 * Dot density = TOP_DENSITY·(1−depth)^FALLOFF, thresholded by the Bayer matrix,
 * so the dots thin from the line down to the baseline.
 */
function drawDither(canvas: HTMLCanvasElement, points: Point[], color: string): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);

  const cell = Math.max(2, Math.round(CELL_CSS * dpr));
  const dot = Math.max(1, cell - Math.max(1, Math.round(DOT_GAP_CSS * dpr)));
  const inset = (cell - dot) >> 1;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const base = hexToRgb(color);

  for (let c = 0; c < cols; c++) {
    const xN = (((c + 0.5) * cell) / w) * 100;
    const ly = (lineYAt(points, xN) / 100) * h;
    const denom = h - ly;
    if (denom <= 0) continue;
    for (let r = 0; r < rows; r++) {
      const cy = (r + 0.5) * cell;
      if (cy < ly) continue; // above the curve — empty
      const depth = (cy - ly) / denom; // 0 at line → 1 at baseline
      const density = TOP_DENSITY * Math.pow(1 - depth, FALLOFF);
      if (density <= 0) continue;
      const threshold = (BAYER8[(r & 7) * 8 + (c & 7)] + 0.5) / 64;
      if (density <= threshold) continue;

      let { r: rr, g: gg, b: bb } = base;
      if (LIGHT_LIFT > 0) {
        const lift = LIGHT_LIFT * Math.pow(1 - depth, 3); // strongest at the line
        rr = rr + (255 - rr) * lift;
        gg = gg + (255 - gg) * lift;
        bb = bb + (255 - bb) * lift;
      }
      ctx.fillStyle = `rgb(${rr | 0},${gg | 0},${bb | 0})`;
      ctx.fillRect(c * cell + inset, r * cell + inset, dot, dot);
    }
  }
}

/**
 * Canvas that paints the dithered fill under `points` and repaints on resize.
 * `points` is read through a ref so hover-driven parent re-renders don't trigger
 * a repaint — only a real geometry change (the `key`) or a resize does.
 */
function DitherCanvas({ points, color }: { points: Point[]; color: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const key = points.map((p) => p[1].toFixed(1)).join(",");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => drawDither(canvas, pointsRef.current, color);
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [key, color]);

  return <canvas aria-hidden className="absolute inset-0 h-full w-full" ref={ref} />;
}

/** Small dithered sparkline for a KPI cell. */
export function DitheredSparkline({
  values,
  color,
  height = 40,
}: {
  values: number[];
  color: string;
  height?: number;
}) {
  if (values.length === 0) return <div style={{ height }} />;
  const { line, points } = buildPaths(values, { padTop: 0.2, padBottom: 0.05 });
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <DitherCanvas color={color} points={points} />
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function HoverDot({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <span
      className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-amend-inset"
      style={{ left: `${x}%`, top: `${y}%`, background: color }}
    />
  );
}

function HoverTip({ point, x }: { point: InsightsPoint; x: number }) {
  return (
    <div
      className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg border border-white/[0.08] bg-[#191613] px-2.5 py-1.5 shadow-xl shadow-black/40"
      style={{ left: `${Math.min(85, Math.max(15, x))}%` }}
    >
      <p className="mb-1 text-[0.64rem] font-medium text-muted-foreground">{point.label}</p>
      {(
        [
          ["Signal", point.signal, GOLD],
          ["Shipped", point.shipped, GREEN],
        ] as const
      ).map(([label, value, color]) => (
        <div className="flex items-center gap-2 text-[0.7rem]" key={label}>
          <span className="size-1.5 rounded-full" style={{ background: color }} />
          <span className="text-muted-foreground">{label}</span>
          <span className="ml-auto pl-3 font-mono font-semibold tabular-nums text-foreground">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The hero Signal-vs-Shipped chart: dithered gold fill, crisp lines, hover. */
export function DitheredAreaChart({ timeline }: { timeline: InsightsPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = timeline.length;
  const signal = timeline.map((p) => p.signal);
  const shipped = timeline.map((p) => p.shipped);
  const max = Math.max(...signal, ...shipped, 1);
  const sig = buildPaths(signal, { max, min: 0 });
  const shp = buildPaths(shipped, { max, min: 0 });
  const labelEvery = n > 6 ? 2 : 1;

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const rel = (event.clientX - rect.left) / rect.width;
    setHover(Math.min(n - 1, Math.max(0, Math.round(rel * (n - 1)))));
  }

  return (
    <div className="select-none">
      <div
        className="relative h-[248px] w-full"
        onMouseLeave={() => setHover(null)}
        onMouseMove={onMove}
      >
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {[20, 40, 60, 80].map((y) => (
            <line
              key={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              x1="0"
              x2="100"
              y1={y}
              y2={y}
            />
          ))}
        </svg>

        <DitherCanvas color={GOLD} points={sig.points} />

        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d={shp.line}
            fill="none"
            stroke={GREEN}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.9}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={sig.line}
            fill="none"
            stroke={GOLD}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {hover !== null ? (
          <>
            <div
              className="absolute top-0 bottom-0 w-px bg-white/15"
              style={{ left: `${sig.points[hover][0]}%` }}
            />
            <HoverDot color={GREEN} x={shp.points[hover][0]} y={shp.points[hover][1]} />
            <HoverDot color={GOLD} x={sig.points[hover][0]} y={sig.points[hover][1]} />
            <HoverTip point={timeline[hover]} x={sig.points[hover][0]} />
          </>
        ) : null}
      </div>

      <div className="mt-2.5 flex justify-between px-1">
        {timeline.map((point, i) => (
          <span
            className={cn(
              "font-mono text-[0.62rem] tabular-nums text-muted-foreground/70",
              i % labelEvery !== 0 && "invisible",
            )}
            key={point.ts}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
