import { Discord, Github, GitPullRequestArrow, Inbox, Kanban, MessageSquare } from "@/lib/icons";
import type { LucideIcon } from "@/lib/icons";

import {
  SettingsRow,
  SettingsSection,
  StatePill,
} from "@/components/settings-workspace-panel-primitives";
import type { SettingsServiceRow } from "@/components/settings-workspace-panel-types";

type PillTone = "info" | "neutral" | "success" | "warm";

function serviceIcon(label: string): LucideIcon {
  const key = label.toLowerCase();
  if (key.includes("github")) return Github;
  if (key.includes("feedback")) return Inbox;
  if (key.includes("discord")) return Discord;
  if (key.includes("slack")) return MessageSquare;
  if (key.includes("linear")) return Kanban;
  return GitPullRequestArrow;
}

function stateTone(state: string): PillTone {
  const key = state.toLowerCase();
  if (key === "connected" || key === "enabled") return "success";
  if (key === "required") return "warm";
  return "neutral";
}

export function ServicesSettingsPanel({ serviceRows }: { serviceRows: SettingsServiceRow[] }) {
  return (
    <SettingsSection
      description="Sources and channels Amend reads from and posts to."
      title="Connected services"
    >
      {serviceRows.map((service) => {
        const Icon = serviceIcon(service.label);
        const tone = stateTone(service.state);
        return (
          <SettingsRow
            key={service.label}
            label={
              <span className="flex items-center gap-2.5">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.06] ring-inset [&_svg]:size-3.5">
                  <Icon />
                </span>
                {service.label}
              </span>
            }
            description={<span className="pl-[2.375rem]">{service.value}</span>}
            control={
              <StatePill dot={tone === "success"} tone={tone}>
                {service.state}
              </StatePill>
            }
          />
        );
      })}
    </SettingsSection>
  );
}
