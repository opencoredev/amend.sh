import type { ReactNode } from "react";

import { copySvg } from "@/components/brand-guidelines-actions";
import { amendMarkSvg, amendWordmarkSvg } from "@/lib/brand-assets";

export function BrandGuidelinesAssetSystem() {
  return (
    <section className="relative z-10 border-t">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Asset system</p>
          <h2 className="amend-display mt-5 max-w-lg text-4xl font-medium leading-tight sm:text-5xl">
            Lockup for the brand. Mark for the product surface.
          </h2>
        </div>

        <div className="grid gap-px border bg-border sm:grid-cols-2">
          <BrandAssetCard
            label="Primary logo"
            logo={
              <div
                className="w-full max-w-xs"
                dangerouslySetInnerHTML={{ __html: amendWordmarkSvg }}
              />
            }
            onCopy={() => copySvg(amendWordmarkSvg)}
          />
          <BrandAssetCard
            label="Favicon / app mark"
            logo={<div className="w-28" dangerouslySetInnerHTML={{ __html: amendMarkSvg }} />}
            onCopy={() => copySvg(amendMarkSvg)}
          />
        </div>
      </div>
    </section>
  );
}

function BrandAssetCard({
  label,
  logo,
  onCopy,
}: {
  label: string;
  logo: ReactNode;
  onCopy: () => void;
}) {
  return (
    <article className="grid min-h-72 content-between bg-background p-6">
      <div className="grid min-h-36 place-items-center text-foreground">{logo}</div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <button
          type="button"
          className="mt-4 border border-border px-4 py-2 text-sm text-muted-foreground transition-[border-color,color] duration-200 hover:border-foreground hover:text-foreground"
          onClick={onCopy}
        >
          Copy SVG
        </button>
      </div>
    </article>
  );
}
