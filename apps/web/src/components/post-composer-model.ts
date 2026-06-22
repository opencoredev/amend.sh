export type EditorPanel = "link" | "code" | null;
export type ComposerPanel = "board" | "status" | "tag" | "assignee" | "date" | null;

export const boardItems = [
  "Feature Request",
  "Bug Report",
  "Changelog",
  "Customer Feedback",
] as const;
export type BoardItem = (typeof boardItems)[number];
// Status dot colors mirror the StatusPill palette used across the feedback list,
// roadmap, and detail views (amber → blue → violet → emerald), plus rose for the
// composer-only "Rejected" state, so a status reads the same color everywhere.
export const statusItems = [
  ["In Review", "bg-amber-400"],
  ["Planned", "bg-blue-400"],
  ["In Progress", "bg-violet-400"],
  ["Completed", "bg-emerald-400"],
  ["Rejected", "bg-rose-400"],
] as const;
export type StatusItem = (typeof statusItems)[number][0];
// Tag colors are resolved per name from the shared workspace tag palette
// (see tagColorByName) so the picker dot matches the tag's chip color elsewhere.
export const tagItems = ["High Priority", "Low Priority"] as const;
export type TagItem = (typeof tagItems)[number];

export type ComposerSubmitPayload = {
  assignee: string | null;
  board: BoardItem;
  createMore: boolean;
  description: string;
  dueDate: string | null;
  status: StatusItem;
  tag: TagItem | null;
  title: string;
};

export const dateRows = [
  ["26", "27", "28", "29", "30", "1", "2"],
  ["3", "4", "5", "6", "7", "8", "9"],
  ["10", "11", "12", "13", "14", "15", "16"],
  ["17", "18", "19", "20", "21", "22", "23"],
  ["24", "25", "26", "27", "28", "29", "30"],
  ["31", "1", "2", "3", "4", "5", "6"],
] as const;
