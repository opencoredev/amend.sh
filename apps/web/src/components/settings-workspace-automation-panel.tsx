import {
  SettingsRow,
  SettingsSection,
  SettingsSwitch,
} from "@/components/settings-workspace-panel-primitives";
import type { AutomationRulesDraft } from "@/components/settings-workspace-panel-types";

const GUARDRAILS: Array<{
  description: string;
  key: keyof AutomationRulesDraft;
  label: string;
}> = [
  {
    key: "autoDraftChangelog",
    label: "Draft changelogs automatically",
    description: "Write a changelog draft when a matching pull request merges.",
  },
  {
    key: "autoUpdateFeedbackStatus",
    label: "Update feedback status",
    description: "Move feedback to shipped once its update goes live.",
  },
  {
    key: "autoUpdateRoadmapStatus",
    label: "Advance roadmap items",
    description: "Progress roadmap items as their work ships.",
  },
  {
    key: "requireReviewForPublicCopy",
    label: "Require review for public copy",
    description: "Hold anything user-facing for a human to approve before publishing.",
  },
];

export function AutomationSettingsPanel({
  automation,
  canSave,
  setAutomationRule,
}: {
  automation: AutomationRulesDraft;
  canSave: boolean;
  setAutomationRule: (key: keyof AutomationRulesDraft, value: boolean) => void;
}) {
  return (
    <SettingsSection
      description="Decide what the agent does on its own and what waits for a human."
      title="Automation guardrails"
    >
      {GUARDRAILS.map((rule) => (
        <SettingsRow
          key={rule.key}
          label={rule.label}
          description={rule.description}
          control={
            <SettingsSwitch
              checked={automation[rule.key]}
              label={rule.label}
              onChange={canSave ? (next) => setAutomationRule(rule.key, next) : undefined}
            />
          }
        />
      ))}
    </SettingsSection>
  );
}
