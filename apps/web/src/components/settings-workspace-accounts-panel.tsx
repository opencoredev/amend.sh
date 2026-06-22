import { cn } from "@amend/ui/lib/utils";

import type { WorkspaceSettingsData } from "@/components/amend-dashboard-types";
import {
  SettingsAvatar,
  SettingsRow,
  SettingsSection,
} from "@/components/settings-workspace-panel-primitives";

type Member = WorkspaceSettingsData["members"][number];

const ROLE_ORDER: Record<Member["role"], number> = {
  owner: 0,
  admin: 1,
  reviewer: 2,
  member: 3,
  viewer: 4,
};

function RoleBadge({ role }: { role: Member["role"] }) {
  const isOwner = role === "owner";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[0.68rem] font-semibold capitalize",
        isOwner
          ? "bg-foreground text-background"
          : "bg-white/[0.05] text-muted-foreground ring-1 ring-white/[0.08] ring-inset",
      )}
    >
      {role}
    </span>
  );
}

export function AccountsSettingsPanel({
  settings,
}: {
  settings: WorkspaceSettingsData | undefined;
}) {
  const members = [...(settings?.members ?? [])].sort(
    (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role],
  );
  const count = members.length;

  return (
    <SettingsSection
      description={
        count > 0 ? `${count} ${count === 1 ? "person" : "people"} with access` : undefined
      }
      title="Members"
    >
      {count > 0 ? (
        members.map((member) => (
          <SettingsRow
            key={member.recordId ?? member.email}
            label={
              <span className="flex min-w-0 items-center gap-3">
                <SettingsAvatar email={member.email} name={member.name} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {member.name ?? member.email}
                  </span>
                  {member.name ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  ) : null}
                </span>
              </span>
            }
            control={<RoleBadge role={member.role} />}
          />
        ))
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No members yet — invite your team from the Amend CLI.
        </p>
      )}
    </SettingsSection>
  );
}
