import { GitPullRequestArrow } from "lucide-react";

import { SettingsPanel } from "@/components/amend-dashboard-shared";
import type { SettingsServiceRow } from "@/components/settings-workspace-panel-types";

export function ServicesSettingsPanel({ serviceRows }: { serviceRows: SettingsServiceRow[] }) {
  return (
    <SettingsPanel icon={<GitPullRequestArrow />} title="Connected services">
      <div className="grid gap-2">
        {serviceRows.map((service) => (
          <div
            key={service.label}
            className="grid gap-3 border border-border bg-background p-3 md:grid-cols-[1fr_auto]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{service.label}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{service.value}</p>
            </div>
            <span className="w-fit border border-border bg-muted/25 px-2 py-1 text-xs text-muted-foreground">
              {service.state}
            </span>
          </div>
        ))}
      </div>
    </SettingsPanel>
  );
}
