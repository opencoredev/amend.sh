import Link from "next/link";
import type { Metadata } from "next";

const docsDescription = "Source-linked product update docs for Amend.sh.";
const docsUrl = "https://docs.amend.sh";
const docsStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  description: docsDescription,
  name: "Amend.sh Docs",
  publisher: {
    "@type": "Organization",
    name: "Amend.sh",
    url: "https://amend.sh",
  },
  url: docsUrl,
};

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description: docsDescription,
  openGraph: {
    description: docsDescription,
    title: "Amend.sh Docs",
    url: docsUrl,
  },
  title: "Amend.sh Docs",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(docsStructuredData) }}
      />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-24">
        <p className="mb-5 text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
          &gt; Amend.sh Docs
        </p>
        <h1 className="amend-docs-display text-balance text-4xl font-medium tracking-normal md:text-6xl">
          Source-linked product updates.
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-fd-muted-foreground">
          Learn how Amend connects customer asks to shipped GitHub work, drafts reviewable updates,
          and closes the loop with the right users.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/docs"
            className="inline-flex h-10 items-center justify-center border border-fd-foreground bg-fd-foreground px-4 text-sm font-medium text-fd-background transition-[background-color,color] hover:bg-transparent hover:text-fd-foreground"
          >
            Open docs
          </Link>
          <Link
            href="/docs/quickstart"
            className="inline-flex h-10 items-center justify-center border px-4 text-sm font-medium text-fd-muted-foreground transition-[border-color,color] hover:border-fd-foreground hover:text-fd-foreground"
          >
            Quickstart
          </Link>
        </div>
      </div>
    </>
  );
}
