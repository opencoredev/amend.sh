import { Input } from "@amend/ui/components/input";
import { Globe } from "lucide-react";

import { SettingsPanel } from "@/components/amend-dashboard-shared";
import {
  SettingsField,
  SettingsSaveButton,
} from "@/components/settings-workspace-panel-primitives";
import type { SettingsSavingState } from "@/components/settings-workspace-panel-types";

export function PortalSettingsPanel({
  canSave,
  headline,
  intro,
  onPortalSave,
  saving,
  setHeadline,
  setIntro,
}: {
  canSave: boolean;
  headline: string;
  intro: string;
  onPortalSave: () => void;
  saving: SettingsSavingState;
  setHeadline: (value: string) => void;
  setIntro: (value: string) => void;
}) {
  return (
    <SettingsPanel
      action={
        <SettingsSaveButton disabled={!canSave || saving === "portal"} onClick={onPortalSave} />
      }
      icon={<Globe />}
      title="Public portal"
    >
      <SettingsField label="Headline">
        <Input
          className="h-10 bg-background text-sm"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
        />
      </SettingsField>
      <SettingsField label="Intro">
        <Input
          className="h-10 bg-background text-sm"
          value={intro}
          onChange={(event) => setIntro(event.target.value)}
        />
      </SettingsField>
    </SettingsPanel>
  );
}
