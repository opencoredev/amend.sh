import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { Suspense } from "react";

import { useMDXComponents } from "@/components/mdx";
import { baseOptions } from "@/lib/layout.shared";
import { docsUrl } from "@/lib/shared";
import { source } from "@/lib/source";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/").filter(Boolean) ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} | Amend.sh Docs` : "Amend.sh Docs" },
      ...(loaderData?.description
        ? [
            { name: "description", content: loaderData.description },
            { property: "og:description", content: loaderData.description },
          ]
        : []),
      ...(loaderData
        ? [
            { property: "og:title", content: loaderData.title },
            { property: "og:type", content: "article" },
            { property: "og:url", content: `${docsUrl}${loaderData.url}` },
          ]
        : []),
    ],
    links: loaderData ? [{ rel: "canonical", href: `${docsUrl}${loaderData.url}` }] : [],
  }),
});

const serverLoader = createServerFn({ method: "GET" })
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      url: page.url,
      title: page.data.title,
      description: page.data.description ?? null,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const loaderData = Route.useLoaderData();
  const data = useFumadocsLoader(loaderData);
  const pageUrl = `${docsUrl}${loaderData.url}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        name: loaderData.title,
        headline: loaderData.title,
        ...(loaderData.description ? { description: loaderData.description } : {}),
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        isPartOf: { "@type": "WebSite", name: "Amend.sh Docs", url: docsUrl },
        publisher: { "@type": "Organization", name: "Amend.sh", url: "https://amend.sh" },
      },
      {
        "@type": "WebSite",
        name: "Amend.sh Docs",
        url: docsUrl,
      },
    ],
  };

  return (
    <DocsLayout {...baseOptions()} tree={data.pageTree}>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense>{clientLoader.useContent(data.path)}</Suspense>
    </DocsLayout>
  );
}
