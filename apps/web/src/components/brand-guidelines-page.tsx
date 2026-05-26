import { BrandGuidelinesAssetSystem } from "@/components/brand-guidelines-asset-system";
import { BrandGuidelinesHeader } from "@/components/brand-guidelines-header";
import { BrandGuidelinesHero } from "@/components/brand-guidelines-hero";
import { BrandGuidelinesRules } from "@/components/brand-guidelines-rules";

export function BrandGuidelinesPage() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background font-mono text-foreground dark">
      <BrandGuidelinesHeader />
      <BrandGuidelinesHero />
      <BrandGuidelinesAssetSystem />
      <BrandGuidelinesRules />
    </main>
  );
}
