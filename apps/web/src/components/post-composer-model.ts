export type EditorPanel = "link" | "code" | null;
export type ComposerPanel = "board" | "status" | "tag" | "assignee" | "date" | null;

export const boardItems = [
  "Feature Request",
  "Bug Report",
  "Changelog",
  "Customer Feedback",
] as const;
export type BoardItem = (typeof boardItems)[number];
export const statusItems = [
  ["In Review", "bg-foreground"],
  ["Planned", "bg-muted-foreground"],
  ["In Progress", "bg-foreground/70"],
  ["Completed", "bg-foreground"],
  ["Rejected", "bg-muted-foreground"],
] as const;
export type StatusItem = (typeof statusItems)[number][0];
export const tagItems = [
  ["High Priority", "bg-foreground"],
  ["Low Priority", "bg-muted-foreground"],
] as const;
export type TagItem = (typeof tagItems)[number][0];

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
