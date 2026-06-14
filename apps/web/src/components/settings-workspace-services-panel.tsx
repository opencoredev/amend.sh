import { GitPullRequestArrow } from "@/lib/icons";

import { SettingsPanel } from "@/components/amend-dashboard-shared";
import type { SettingsServiceRow } from "@/components/settings-workspace-panel-types";

export function ServicesSettingsPanel({ serviceRows }: { serviceRows: SettingsServiceRow[] }) {
  return (
    <SettingsPanel icon={<GitPullRequestArrow />} title="Connected services">
      <div className="grid gap-2">
        {serviceRows.map((service) => (
          <div
            key={service.label}
            className="grid gap-3 rounded-xl bg-[#151518] p-3 ring-1 ring-white/[0.055] md:grid-cols-[1fr_auto] md:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{service.label}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{service.value}</p>
            </div>
            <span className="w-fit rounded-md bg-white/[0.05] px-2 py-1 text-xs text-muted-foreground ring-1 ring-white/[0.06]">
              {service.state}
            </span>
          </div>
        ))}
      </div>
    </SettingsPanel>
  );
}
