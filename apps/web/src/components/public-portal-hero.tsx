import type { PortalData } from "@/components/public-portal-types";

export function PortalHero({
  portal,
  settings,
}: {
  portal: PortalData;
  settings: PortalData["workspace"]["portalSettings"];
}) {
  return (
    <div className="px-1 pt-2">
      <h1 className="text-xl font-semibold tracking-tight">
        {settings?.headline ?? "All feedback"}
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
        {settings?.intro ??
          portal.workspace.description ??
          "Requests, roadmap moves, and shipped updates with source evidence from Amend."}
      </p>
    </div>
  );
}
