import { Link, createFileRoute } from "@tanstack/react-router";

import BrandMenu from "@/components/brand-menu";
import { amendMarkSvg, amendWordmarkSvg, brandAssetDownloads } from "@/lib/brand-assets";
import { canonicalLink, openGraphMeta } from "@/lib/seo";

const title = "Amend.sh Brand Guidelines";
const description = "Logo, wordmark, and usage notes for Amend.sh brand assets.";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      {
        title,
      },
      {
        name: "description",
        content: description,
      },
      ...openGraphMeta({ description, path: "/brand", title }),
    ],
    links: [canonicalLink("/brand")],
  }),
  component: BrandComponent,
});

const navItems = [
  ["01", "Features", "/#features"],
  ["02", "Workflow", "/#workflow"],
  ["03", "Pricing", "/#pricing"],
] as const;

const rules = [
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

function copySvg(svg: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(svg);
    return;
  }
  const input = document.createElement("textarea");
  input.value = svg;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function downloadSvg(filename: string, svg: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadBrandAssets() {
  brandAssetDownloads.forEach(([filename, svg], index) => {
    window.setTimeout(() => downloadSvg(filename, svg), index * 80);
  });
}

function BrandComponent() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background font-mono text-foreground dark">
      <header className="fixed inset-x-0 top-0 z-50 bg-background/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <BrandMenu />

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navItems.map(([index, label, href]) => (
              <a
                key={label}
                href={href}
                className="px-3 py-1.5 text-xs text-muted-foreground transition-[background-color,color] duration-200 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                <span className="opacity-50">{index}</span> {label.toUpperCase()}
              </a>
            ))}
          </nav>

          <Link
            to="/sign-in"
            className="flex h-8 min-w-24 items-center justify-center border border-border px-3 text-xs text-muted-foreground transition-[border-color,color,background-color,scale] duration-200 hover:border-foreground hover:bg-foreground hover:text-background active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[620px] max-w-7xl content-center px-4 pt-24 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.04]"
        >
          <pre className="w-screen select-none font-mono text-sm leading-[22px] text-foreground">
            {brandAscii}
          </pre>
        </div>

        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Brand guidelines
            </p>
            <h1 className="amend-display mt-6 max-w-3xl text-5xl font-medium leading-tight sm:text-6xl">
              Use the full lockup first.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
              The symbol is the compact mark. The brand is the mark and AMEND.SH together.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                className="border border-foreground bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-background hover:text-foreground active:scale-[0.96]"
                onClick={downloadBrandAssets}
              >
                Download assets
              </button>
              <button
                type="button"
                className="border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96]"
                onClick={() => copySvg(amendWordmarkSvg)}
              >
                Copy full logo as SVG
              </button>
            </div>
          </div>

          <div className="border bg-background/80 p-6">
            <div className="grid min-h-52 place-items-center border border-border bg-foreground p-8 text-background">
              <div
                className="w-full max-w-md"
                dangerouslySetInnerHTML={{ __html: amendWordmarkSvg }}
              />
            </div>
            <div className="grid min-h-52 place-items-center border-x border-b border-border bg-background p-8 text-foreground">
              <div
                className="w-full max-w-md"
                dangerouslySetInnerHTML={{ __html: amendWordmarkSvg }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Asset system</p>
            <h2 className="amend-display mt-5 max-w-lg text-4xl font-medium leading-tight sm:text-5xl">
              Lockup for the brand. Mark for the product surface.
            </h2>
          </div>

          <div className="grid gap-px border bg-border sm:grid-cols-2">
            <article className="grid min-h-72 content-between bg-background p-6">
              <div className="grid min-h-36 place-items-center text-foreground">
                <div
                  className="w-full max-w-xs"
                  dangerouslySetInnerHTML={{ __html: amendWordmarkSvg }}
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Primary logo
                </p>
                <button
                  type="button"
                  className="mt-4 border border-border px-4 py-2 text-sm text-muted-foreground transition-[border-color,color] duration-200 hover:border-foreground hover:text-foreground"
                  onClick={() => copySvg(amendWordmarkSvg)}
                >
                  Copy SVG
                </button>
              </div>
            </article>

            <article className="grid min-h-72 content-between bg-background p-6">
              <div className="grid min-h-36 place-items-center text-foreground">
                <div className="w-28" dangerouslySetInnerHTML={{ __html: amendMarkSvg }} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Favicon / app mark
                </p>
                <button
                  type="button"
                  className="mt-4 border border-border px-4 py-2 text-sm text-muted-foreground transition-[border-color,color] duration-200 hover:border-foreground hover:text-foreground"
                  onClick={() => copySvg(amendMarkSvg)}
                >
                  Copy SVG
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-28">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rules</p>
            <h2 className="amend-display mt-5 text-4xl font-medium leading-tight">
              Keep it sharp.
            </h2>
          </div>
          <div className="divide-y border-y text-sm">
            {rules.map(([title, copy]) => (
              <article key={title} className="grid gap-3 py-5 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="leading-6 text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const brandAscii = [
  "      amend.sh logo       full lockup       favicon mark       svg asset       ",
  "  brand -> source -> story       copy svg       download assets       ",
  "      monochrome first       no outer tile       compact product mark       ",
  "  AMEND.SH       AMEND.SH       AMEND.SH       AMEND.SH       ",
].join("\n");
