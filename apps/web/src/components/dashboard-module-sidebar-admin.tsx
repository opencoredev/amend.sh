import { GitPullRequestArrow } from "@/lib/icons";

import {
  SidebarFrame,
  SidebarNavItem,
  SidebarNavList,
} from "@/components/dashboard-module-sidebar-primitives";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function SetupModuleSidebar({ onViewChange }: Pick<ModuleSidebarProps, "onViewChange">) {
  return (
    <SidebarFrame>
      <SidebarNavList>
        <SidebarNavItem
          active
          icon={<GitPullRequestArrow />}
          label="Connect source"
          onClick={() => onViewChange("setup")}
        />
      </SidebarNavList>
    </SidebarFrame>
  );
}
