import { statusTitle } from "@/components/amend-dashboard-status-utils";
import type {
  DashboardChangelog,
  DashboardRoadmap,
  Post,
} from "@/components/amend-dashboard-types";

export function filterPosts(posts: Post[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return posts;

  return posts.filter((post) =>
    [post.title, post.source, post.date, statusTitle(post.status), post.status, post.boardId]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function filterChangelogEntries(entries: DashboardChangelog[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;

  return entries.filter((entry) =>
    [
      entry.title,
      entry.summary,
      entry.body,
      entry.category,
      entry.status,
      entry.version ?? "",
      ...entry.tags,
      ...entry.sourceLinks.map((link) => link.title ?? ""),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function filterRoadmapEntries(entries: DashboardRoadmap[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;

  return entries.filter((entry) =>
    [
      entry.title,
      entry.description,
      entry.impact,
      entry.priority,
      entry.status,
      entry.target ?? "",
      ...entry.sourceLinks.map((link) => link.title ?? ""),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}
