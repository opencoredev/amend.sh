import { Users } from "@/lib/icons";

import { SettingsPanel, StatusRow } from "@/components/amend-dashboard-shared";
import type { WorkspaceSettingsData } from "@/components/amend-dashboard-types";

export function AccountsSettingsPanel({
  settings,
}: {
  settings: WorkspaceSettingsData | undefined;
}) {
  return (
    <SettingsPanel icon={<Users />} title="Accounts">
      <StatusRow label="Members" value={String(settings?.members.length ?? 0)} />
      <StatusRow
        label="Owner"
        value={settings?.members.find((member) => member.role === "owner")?.email ?? "Not set"}
      />
    </SettingsPanel>
  );
}
