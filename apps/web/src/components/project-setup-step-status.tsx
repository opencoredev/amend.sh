import { cn } from "@amend/ui/lib/utils";
import { CircleDashed } from "@/lib/icons";

import type { WebsiteLookupStatus } from "@/components/amend-dashboard-types";
import { normalizeOptionalUrl } from "@/components/amend-dashboard-format";
import { ProjectLogo } from "@/components/project-logo";
import { StatePill } from "@/components/settings-workspace-panel-primitives";

export function WebsiteLookupMessage({
  message,
  status,
}: {
  message: string;
  status: WebsiteLookupStatus;
}) {
  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CircleDashed className="size-3.5 animate-spin" />
        Checking the site…
      </div>
    );
  }

  if (status === "valid") {
    return (
      <StatePill tone="success" dot>
        Verified
      </StatePill>
    );
  }

  if (status === "invalid") {
    return (
      <p className="text-xs leading-5 text-muted-foreground">
        Couldn&rsquo;t reach that domain — check it, or skip and set up by hand.
      </p>
    );
  }

  return <p className="text-xs leading-5 text-muted-foreground">{message}</p>;
}

/** Resolved-identity row, on the dashboard's `bg-amend-inset` inset surface. */
export function ProjectIdentityCard({
  logoUrl,
  name,
  websiteUrl,
}: {
  logoUrl?: string;
  name: string;
  websiteUrl?: string;
}) {
  const normalizedUrl = normalizeOptionalUrl(websiteUrl ?? "");

  return (
    <div className="flex items-center gap-3 rounded-xl bg-amend-inset p-3 ring-1 ring-white/[0.055] ring-inset">
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-background ring-1 ring-white/[0.06] ring-inset">
        <ProjectLogo
          className="size-full"
          fallbackIconClassName="size-4"
          logoUrl={logoUrl}
          websiteUrl={websiteUrl}
        />
      </span>
      <div className="min-w-0">
        <p className={cn("truncate text-sm font-medium text-foreground")}>
          {name || "Untitled project"}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {normalizedUrl ?? "Manual setup"}
        </p>
      </div>
    </div>
  );
}
