import { copySvg, downloadBrandAssets } from "@/components/brand-guidelines-actions";
import { brandGuidelinesAscii } from "@/components/brand-guidelines-data";
import { amendWordmarkSvg } from "@/lib/brand-assets";

export function BrandGuidelinesHero() {
  return (
    <section className="relative mx-auto grid min-h-[620px] max-w-7xl content-center px-4 pt-24 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.04]"
      >
        <pre className="w-screen select-none font-mono text-sm leading-[22px] text-foreground">
          {brandGuidelinesAscii}
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
  );
}
