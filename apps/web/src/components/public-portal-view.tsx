import { PortalMobileNav } from "@/components/portal-account-actions";
import { PortalFeedbackSection } from "@/components/public-portal-feedback-section";
import { PortalTopBar } from "@/components/public-portal-header";
import { PortalHero } from "@/components/public-portal-hero";
import { PortalRail } from "@/components/public-portal-rail";
import {
  PortalRoadmapSection,
  PortalUpdatesSection,
} from "@/components/public-portal-roadmap-updates";
import type { PortalData } from "@/components/public-portal-types";
import { cn } from "@amend/ui/lib/utils";
import { portalThemeStyleVars, resolvePortalTheme } from "@/lib/portal-themes";

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
  const theme = resolvePortalTheme(settings);

  return (
    <main
      className={cn(
        "min-h-svh bg-background p-3 font-sans text-foreground lg:h-svh lg:overflow-hidden",
        theme.isDark && "dark",
      )}
      style={portalThemeStyleVars(theme.vars)}
    >
      <div className="grid min-h-[calc(100svh-1.5rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl lg:h-[calc(100svh-1.5rem)] lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <PortalRail
          counts={{
            changelog: changelog.length,
            feedback: feedback.length,
            roadmap: roadmap.length,
          }}
          workspace={portal.workspace}
        />

        <section className="flex min-h-0 flex-col lg:overflow-hidden">
          <PortalTopBar feedbackCount={feedback.length} workspace={portal.workspace} />

          <div className="t-panel-slide min-h-0 flex-1 lg:overflow-y-auto" data-open="true">
            <div className="mx-auto grid w-full max-w-3xl gap-4 px-4 pb-28 pt-2 sm:px-6 lg:pb-6">
              <PortalHero portal={portal} settings={settings} />
              <PortalFeedbackSection
                feedback={feedback}
                feedbackMode={settings?.feedbackMode ?? "open"}
                workspaceSlug={workspaceSlug}
              />
              <PortalRoadmapSection roadmap={roadmap} />
              <PortalUpdatesSection changelog={changelog} />
            </div>
          </div>
        </section>
      </div>

      <PortalMobileNav workspaceSlug={portal.workspace.slug} />
    </main>
  );
}
