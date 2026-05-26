import { Button } from "@amend/ui/components/button";
import { Search } from "lucide-react";

import type { PortalData } from "@/components/public-portal-types";

export function PortalHero({
  portal,
  settings,
}: {
  portal: PortalData;
  settings: PortalData["workspace"]["portalSettings"];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm text-muted-foreground">{portal.workspace.slug}.amend.sh</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">
          {settings?.headline ?? "All feedback"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {settings?.intro ??
            portal.workspace.description ??
            "Requests, roadmap moves, and shipped updates with source evidence from Amend."}
        </p>
      </div>
      <Button size="icon" variant="outline" aria-label="Search feedback">
        <Search />
      </Button>
    </div>
  );
}
