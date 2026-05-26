import { createFileRoute } from "@tanstack/react-router";

import { BrandGuidelinesPage } from "@/components/brand-guidelines-page";
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
  component: BrandGuidelinesPage,
});
