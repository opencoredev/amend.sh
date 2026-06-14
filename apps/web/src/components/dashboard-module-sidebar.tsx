import { SetupModuleSidebar } from "@/components/dashboard-module-sidebar-panels";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function ModuleSidebar(props: ModuleSidebarProps) {
  // The sidebar stays static across pages: only project setup keeps a context list.
  // Every other view exposes its sub-navigation in a toolbar inside the content.
  if (props.activeView === "setup") {
    return <SetupModuleSidebar onViewChange={props.onViewChange} />;
  }

  return null;
}
