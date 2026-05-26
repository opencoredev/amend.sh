export type SettingsSavingState = "automation" | "portal" | "project" | null;
export type LogoActionState = "upload" | "website" | null;

export type SettingsServiceRow = {
  label: string;
  state: string;
  value: string;
};
