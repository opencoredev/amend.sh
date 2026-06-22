import { getDashboardDetailView } from "@/components/amend-dashboard-detail-router";
import { AmendDashboardMainWorkspace } from "@/components/amend-dashboard-main-workspace";
import type { DashboardContentProps } from "@/components/amend-dashboard-content-types";
import { DashboardOnboardingLauncher } from "@/components/dashboard-onboarding-launcher";
import {
  computeOnboardingState,
  type OnboardingStepAction,
} from "@/components/dashboard-onboarding-model";

export function AmendDashboardContent(props: DashboardContentProps) {
  const detailView = getDashboardDetailView(props);

  // The changelog editor is a full-screen editing mode with its own chrome.
  if (detailView && props.activeView === "changelog") {
    return <div className="flex min-h-0 flex-1 flex-col lg:overflow-y-auto">{detailView}</div>;
  }

  // Post-setup activation lives in a floating launcher (see component) rather
  // than an inline banner, so it never pushes the board views around.
  const onboarding = computeOnboardingState({
    activeProject: props.activeProject,
    dashboard: props.dashboard,
    workspace: props.workspace,
  });
  const showLauncher =
    Boolean(props.dashboard) && props.activeProject.id !== "new-project" && !detailView;

  const handleStepAction = (action: OnboardingStepAction) => {
    switch (action.kind) {
      case "setup":
        props.onOpenSetup();
        break;
      case "compose":
        if (props.activeView === "changelog") props.onNewChangelog();
        else props.onCreate();
        break;
      case "settings":
        props.onOpenSettingsSection(action.section);
        break;
      case "none":
        break;
    }
  };

  return (
    <>
      <AmendDashboardMainWorkspace {...props} detailView={detailView} />
      {showLauncher ? (
        <DashboardOnboardingLauncher
          projectId={props.activeProject.id}
          projectName={props.activeProject.name}
          state={onboarding}
          onStepAction={handleStepAction}
        />
      ) : null}
    </>
  );
}
