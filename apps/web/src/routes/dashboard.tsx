import { createFileRoute, redirect } from "@tanstack/react-router";

import AmendDashboard from "@/components/amend-dashboard";
import { noIndexMeta } from "@/lib/seo";

type DashboardSearch = {
  board?: string;
  changelog?: string;
  q?: string;
  roadmap?: string;
  status?: string;
  workspace?: string;
};

export const Route = createFileRoute("/dashboard")({
  // Client-only: see the note in dashboard.$view.tsx. SSR-ing this auth-gated,
  // localStorage-driven shell only produces hydration mismatches.
  ssr: false,
  head: () => ({
    meta: [{ title: "Dashboard - Amend.sh" }, ...noIndexMeta],
  }),
  beforeLoad: ({ context }) => {
    const auth = context as { isAuthenticated?: boolean };
    if (!auth.isAuthenticated) {
      throw redirect({ to: "/sign-in" });
    }
  },
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    const next: DashboardSearch = {};
    if (typeof search.board === "string") next.board = search.board;
    if (typeof search.changelog === "string") next.changelog = search.changelog;
    if (typeof search.q === "string") next.q = search.q;
    if (typeof search.roadmap === "string") next.roadmap = search.roadmap;
    if (typeof search.status === "string") next.status = search.status;
    if (typeof search.workspace === "string") next.workspace = search.workspace;
    return next;
  },
  component: AmendDashboard,
});
