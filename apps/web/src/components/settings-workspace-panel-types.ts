export type LogoActionState = "upload" | "website" | null;

export type SettingsServiceRow = {
  label: string;
  state: string;
  value: string;
};

/** The automation guardrails a user can toggle in the Automation section. */
export type AutomationRulesDraft = {
  autoDraftChangelog: boolean;
  autoUpdateFeedbackStatus: boolean;
  autoUpdateRoadmapStatus: boolean;
  requireReviewForPublicCopy: boolean;
};
