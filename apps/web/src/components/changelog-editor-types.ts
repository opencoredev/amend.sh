export type ChangelogEditorSavePayload = {
  body: string;
  category: string;
  stableKey: string;
  status: string;
  summary: string;
  tags: string[];
  title: string;
  version?: string;
};
