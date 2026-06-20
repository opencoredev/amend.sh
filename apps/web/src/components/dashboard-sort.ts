/**
 * Sort model shared by the list views (Feedback · Roadmap · Changelog). The
 * header renders these options in one consistent control; the main workspace
 * applies the matching comparator to the already-filtered list, so search and
 * sort compose. Comparators only read reliable numeric/string fields (votes,
 * `updatedAt`, `publishedAt`, title) — never the human-formatted `date` string.
 */
import type {
  DashboardChangelog,
  DashboardRoadmap,
  Post,
} from "@/components/amend-dashboard-types";

export type SortableView = "posts" | "roadmap" | "changelog";
export type SortOption = { value: string; label: string };

export const SORT_OPTIONS: Record<SortableView, SortOption[]> = {
  posts: [
    { value: "recent", label: "Recent" },
    { value: "votes", label: "Most upvoted" },
    { value: "alpha", label: "A–Z" },
  ],
  roadmap: [
    { value: "recent", label: "Recent" },
    { value: "feedback", label: "Most feedback" },
    { value: "alpha", label: "A–Z" },
  ],
  changelog: [
    { value: "recent", label: "Recent" },
    { value: "alpha", label: "A–Z" },
  ],
};

export const DEFAULT_SORT: Record<SortableView, string> = {
  posts: "recent",
  roadmap: "recent",
  changelog: "recent",
};

const SORTABLE_VIEWS = new Set<string>(["posts", "roadmap", "changelog"]);

export function asSortableView(view: string): SortableView | null {
  return SORTABLE_VIEWS.has(view) ? (view as SortableView) : null;
}

const byTitle = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title);

export function sortPosts(posts: Post[], sort: string): Post[] {
  const next = [...posts];
  switch (sort) {
    case "votes":
      return next.sort((a, b) => b.voters - a.voters || b.updatedAt - a.updatedAt);
    case "alpha":
      return next.sort(byTitle);
    default:
      return next.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export function sortRoadmap(entries: DashboardRoadmap[], sort: string): DashboardRoadmap[] {
  const next = [...entries];
  switch (sort) {
    case "feedback":
      return next.sort((a, b) => b.feedbackCount - a.feedbackCount || b.updatedAt - a.updatedAt);
    case "alpha":
      return next.sort(byTitle);
    default:
      return next.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export function sortChangelog(entries: DashboardChangelog[], sort: string): DashboardChangelog[] {
  const next = [...entries];
  const published = (entry: DashboardChangelog) => entry.publishedAt ?? entry.updatedAt;
  switch (sort) {
    case "alpha":
      return next.sort(byTitle);
    default:
      return next.sort((a, b) => published(b) - published(a));
  }
}
