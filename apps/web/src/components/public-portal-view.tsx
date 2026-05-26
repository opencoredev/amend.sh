import { PortalMobileNav } from "@/components/portal-account-actions";
import { PortalFeedbackSection } from "@/components/public-portal-feedback-section";
import { PortalHeader } from "@/components/public-portal-header";
import { PortalHero } from "@/components/public-portal-hero";
import {
  PortalRoadmapSection,
  PortalUpdatesSection,
} from "@/components/public-portal-roadmap-updates";
import type { PortalData } from "@/components/public-portal-types";

export function PublicPortalView({
  portal,
  workspaceSlug,
}: {
  portal: PortalData;
  workspaceSlug: string;
}) {
  const settings = portal.workspace.portalSettings;
  const roadmap = settings?.roadmapVisibility === "private" ? [] : portal.roadmap;
  const changelog = settings?.changelogVisibility === "private" ? [] : portal.changelog;
  const feedback = settings?.feedbackMode === "closed" ? [] : portal.feedback;

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PortalHeader workspace={portal.workspace} />
      <PortalMobileNav workspaceSlug={portal.workspace.slug} />

      <section className="mx-auto grid max-w-5xl gap-7 px-4 pb-28 pt-8 sm:px-6 sm:pb-8">
        <PortalHero portal={portal} settings={settings} />
        <PortalFeedbackSection
          changelogCount={changelog.length}
          feedback={feedback}
          feedbackMode={settings?.feedbackMode ?? "open"}
          roadmapCount={roadmap.length}
          workspaceSlug={workspaceSlug}
        />
        <PortalRoadmapSection roadmap={roadmap} />
        <PortalUpdatesSection changelog={changelog} />
      </section>
    </main>
  );
}
