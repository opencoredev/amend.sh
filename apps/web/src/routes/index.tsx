import { createFileRoute } from "@tanstack/react-router";

import { HomeHeader } from "@/components/home/home-header";
import { HomeHero } from "@/components/home/home-hero";
import { Footer } from "@/components/home/home-footer";
import {
  FounderProofSection,
  IntegrationSection,
  MobileActionBar,
} from "@/components/home/home-sections";
import {
  FeaturesSection,
  MemorySection,
  PricingSection,
  WorkflowSection,
} from "@/components/home/home-product-sections";
import { useLandingMotion } from "@/components/home/use-landing-motion";
import {
  canonicalLink,
  defaultDescription,
  defaultTitle,
  openGraphMeta,
  organizationJsonLd,
  productJsonLd,
} from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: defaultTitle,
      },
      {
        name: "description",
        content: defaultDescription,
      },
      {
        name: "keywords",
        content:
          "customer feedback, product roadmap, changelog, GitHub issues, release notes, customer notifications",
      },
      ...openGraphMeta({ description: defaultDescription, title: defaultTitle }),
    ],
    links: [canonicalLink("/")],
  }),
  component: HomeComponent,
});

function HomeComponent() {
  useLandingMotion();

  return (
    <main className="relative min-h-svh w-full max-w-full overflow-x-hidden bg-background pb-32 font-mono text-foreground dark md:pb-0">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd, productJsonLd]),
        }}
      />
      <HomeHeader />
      <MobileActionBar />
      <HomeHero />
      <FeaturesSection />
      <FounderProofSection />
      <IntegrationSection />
      <MemorySection />
      <WorkflowSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
