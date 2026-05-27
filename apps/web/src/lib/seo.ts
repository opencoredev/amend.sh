export const siteUrl = "https://amend.sh";
export const agentDocsUrl = "https://docs.amend.sh";
export const defaultOgImage = `${siteUrl}/og-image.png`;

export const defaultTitle = "Amend.sh - close the loop when users ask and you ship";
export const defaultDescription =
  "Amend watches the places users talk, groups repeated requests, follows the work through GitHub and Linear, and helps you update the people who asked.";

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
  image = defaultOgImage,
  path = "/",
  title = defaultTitle,
}: {
  description?: string;
  image?: string;
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
    { property: "og:image", content: image },
    { property: "og:image:secure_url", content: image },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Amend.sh source-linked product update loop preview" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@amendsh" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: "Amend.sh source-linked product update loop preview" },
  ];
}

export const noIndexMeta = [{ name: "robots", content: "noindex, nofollow" }] as const;

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does Amend.sh do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amend groups repeated customer requests, links them to GitHub and Linear work, and helps teams update the right users when work ships.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Amend.sh cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amend is open source and self-hostable. Hosted plans start at $19/month for Builder, $49/month for Team, and $99/month for Growth. Custom pricing is available for higher-volume teams.",
      },
    },
    {
      "@type": "Question",
      name: "Can I self-host Amend?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Amend is open source. You can run the portal, roadmap, changelog, widget, SDK, API, and CLI on your own infrastructure with your own provider keys.",
      },
    },
    {
      "@type": "Question",
      name: "How does Amend link customer feedback to GitHub?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amend keeps each request tied to the issues, pull requests, commits, releases, and Linear work connected to it. When the work ships, Amend updates the record and follows your rules for public follow-up.",
      },
    },
    {
      "@type": "Question",
      name: "What integrations does Amend support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amend works with GitHub, Linear, Discord, Slack, email forwarding, support tools, a hosted portal, an in-app widget, and a TypeScript SDK.",
      },
    },
  ],
};

export const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Amend.sh",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description: defaultDescription,
  offers: [
    {
      "@type": "Offer",
      name: "Open Source",
      price: "0",
      priceCurrency: "USD",
      description: "Self-hosted, BYO providers",
      url: `${siteUrl}/#pricing`,
    },
    {
      "@type": "Offer",
      name: "Builder",
      price: "19",
      priceCurrency: "USD",
      description: "Hosted feedback, roadmap, and changelog workflow for founders and small projects",
      url: `${siteUrl}/#pricing`,
    },
    {
      "@type": "Offer",
      name: "Team",
      price: "49",
      priceCurrency: "USD",
      description: "More projects, seats, history, automation, and review controls",
      url: `${siteUrl}/#pricing`,
    },
    {
      "@type": "Offer",
      name: "Growth",
      price: "99",
      priceCurrency: "USD",
      description: "Support integrations, account context, audit history, and higher limits",
      url: `${siteUrl}/#pricing`,
    },
  ],
  featureList: [
    "Capture feedback from Discord, Slack, GitHub, support, portal, widget, SDK, and email",
    "Group duplicate requests with source links, account context, and signal history",
    "Link requests to GitHub and Linear work",
    "Prepare roadmap, changelog, Slack, Discord, email, and widget updates",
    "Set rules for silent capture, public replies, teammate replies, and approval",
    "Self-host the open source version or use hosted cloud plans from $19/month",
  ],
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Amend.sh",
  url: siteUrl,
  description: defaultDescription,
  sameAs: [],
};
