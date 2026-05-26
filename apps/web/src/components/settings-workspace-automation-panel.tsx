import { DatabaseZap } from "lucide-react";

import { BooleanRow, SettingsPanel } from "@/components/amend-dashboard-shared";
import type { WorkspaceSettingsData } from "@/components/amend-dashboard-types";
import { SettingsSaveButton } from "@/components/settings-workspace-panel-primitives";
import type { SettingsSavingState } from "@/components/settings-workspace-panel-types";

export function AutomationSettingsPanel({
  canSave,
  onAutomationSave,
  saving,
  settings,
}: {
  canSave: boolean;
  onAutomationSave: () => void;
  saving: SettingsSavingState;
  settings: WorkspaceSettingsData | undefined;
}) {
  const rules = settings?.automationRules;

  return (
    <SettingsPanel
      action={
        <SettingsSaveButton
          disabled={!canSave || saving === "automation"}
          onClick={onAutomationSave}
        />
      }
      icon={<DatabaseZap />}
      title="Automation guardrails"
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <BooleanRow checked={rules?.autoDraftChangelog ?? false} label="Draft changelogs" />
        <BooleanRow
          checked={rules?.autoUpdateFeedbackStatus ?? false}
          label="Update feedback status"
        />
        <BooleanRow checked={rules?.autoUpdateRoadmapStatus ?? false} label="Move roadmap items" />
        <BooleanRow
          checked={rules?.requireReviewForPublicCopy ?? true}
          label="Require public copy review"
        />
      </div>
    </SettingsPanel>
  );
}
