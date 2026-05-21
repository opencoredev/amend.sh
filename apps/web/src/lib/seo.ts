export const siteUrl = "https://amend.sh";
export const agentDocsUrl = "https://docs.amend.sh";

export const defaultTitle = "Amend.sh - Source-linked product updates";
export const defaultDescription =
  "Amend.sh connects customer feedback to GitHub issues, pull requests, releases, roadmaps, changelogs, and customer updates.";

export function canonicalUrl(path = "/") {
  return `${siteUrl}${path}`;
}

export function canonicalLink(path = "/") {
  return {
    href: canonicalUrl(path),
    rel: "canonical",
  };
}

export function openGraphMeta({
  description = defaultDescription,
  path = "/",
  title = defaultTitle,
}: {
  description?: string;
  path?: string;
  title?: string;
}) {
  const url = canonicalUrl(path);

  return [
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Amend.sh" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export const noIndexMeta = [{ name: "robots", content: "noindex, nofollow" }] as const;

export const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  applicationCategory: "BusinessApplication",
  description: defaultDescription,
  name: "Amend.sh",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "19",
      priceCurrency: "USD",
      url: `${siteUrl}/#pricing`,
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "49",
      priceCurrency: "USD",
      url: `${siteUrl}/#pricing`,
    },
    {
      "@type": "Offer",
      name: "Team",
      price: "99",
      priceCurrency: "USD",
      url: `${siteUrl}/#pricing`,
    },
  ],
  operatingSystem: "Web",
  subjectOf: [
    `${agentDocsUrl}/docs/quickstart`,
    `${agentDocsUrl}/docs/integration`,
    `${agentDocsUrl}/docs/source-trace`,
    `${agentDocsUrl}/docs/self-hosting`,
    `${agentDocsUrl}/docs/launch`,
  ],
  url: siteUrl,
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  description: defaultDescription,
  name: "Amend.sh",
  url: siteUrl,
};
