import { StatusRow } from "@/components/amend-dashboard-shared";
import type { ProjectMenuItem } from "@/components/amend-dashboard-types";
import { ProjectLogo } from "@/components/project-logo";

export function SettingsWorkspaceHeader({
  activeProject,
  logoUrl,
  websiteUrl,
}: {
  activeProject: ProjectMenuItem;
  logoUrl: string;
  websiteUrl: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 gap-4">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#151518] text-lg font-semibold ring-1 ring-white/[0.06]">
          <ProjectLogo
            className="size-full"
            fallbackIconClassName="size-6"
            logoUrl={logoUrl}
            websiteUrl={websiteUrl}
          />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Project settings
          </p>
          <h2 className="mt-2 truncate text-2xl font-semibold">Configure {activeProject.name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Settings apply to the selected project. Workspace membership, billing, and shared limits
            stay separate from product identity.
          </p>
        </div>
      </div>
      <StatusRow label="Repository" value={activeProject.repo} />
    </div>
  );
}
