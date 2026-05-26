import { cn } from "@amend/ui/lib/utils";

import { AmendDashboardContent } from "@/components/amend-dashboard-content";
import { roadmapStatusToComposerStatus } from "@/components/amend-dashboard-utils";
import DashboardAuthShell from "@/components/dashboard-auth-shell";
import { DashboardSidebarChrome } from "@/components/dashboard-sidebar-chrome";
import { ComposerModal } from "@/components/post-composer-modal";
import { ProjectSetupShell } from "@/components/project-setup-shell";
import { useAmendDashboardController } from "@/components/use-amend-dashboard-controller";

export default function AmendDashboard() {
  const dashboard = useAmendDashboardController();

  if (!dashboard.sessionPending && !dashboard.hasSession) {
    return <DashboardAuthShell showSignIn />;
  }

  if (dashboard.requiresProjectSetup) {
    return (
      <ProjectSetupShell workspace={dashboard.workspace} onCreated={dashboard.onProjectCreated} />
    );
  }

  return (
    <main className="dark min-h-svh overflow-hidden bg-background font-mono text-foreground">
      <div
        className={cn(
          "grid min-h-svh",
          dashboard.focusChangelogEditor
            ? "lg:grid-cols-[3.75rem_minmax(0,1fr)]"
            : "lg:grid-cols-[3.75rem_17.5rem_minmax(0,1fr)]",
        )}
      >
        <DashboardSidebarChrome {...dashboard.sidebarProps} />

        <section className="min-h-0 overflow-x-hidden overflow-y-auto">
          <AmendDashboardContent {...dashboard.contentProps} />
        </section>
      </div>

      <ComposerModal
        initialBoard={
          dashboard.activeView === "changelog"
            ? "Changelog"
            : dashboard.activeView === "roadmap"
              ? "Feature Request"
              : "Customer Feedback"
        }
        initialStatus={roadmapStatusToComposerStatus(dashboard.roadmapCreateStatus)}
        open={dashboard.composerOpen}
        onClose={dashboard.closeComposer}
        onSubmit={dashboard.onComposerSubmit}
      />
    </main>
  );
}
