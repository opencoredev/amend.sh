import { createFileRoute, redirect } from "@tanstack/react-router";

import AmendDashboard from "@/components/amend-dashboard";
import { noIndexMeta } from "@/lib/seo";

type DashboardSearch = {
  board?: string;
  changelog?: string;
  feedback?: string;
  item?: string;
  q?: string;
  roadmap?: string;
  status?: string;
  workspace?: string;
};

export const Route = createFileRoute("/dashboard/$view")({
  // The dashboard is auth-gated and noindex, and its state is hydrated entirely
  // from the client (localStorage active-project, Convex live queries, the mock
  // agent store). SSR-ing it buys nothing and guarantees hydration mismatches —
  // the server has no localStorage, so the active project (and the whole tree it
  // drives) differs on the client. Render it client-only.
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
    if (typeof search.feedback === "string") next.feedback = search.feedback;
    if (typeof search.item === "string") next.item = search.item;
    if (typeof search.q === "string") next.q = search.q;
    if (typeof search.roadmap === "string") next.roadmap = search.roadmap;
    if (typeof search.status === "string") next.status = search.status;
    if (typeof search.workspace === "string") next.workspace = search.workspace;
    return next;
  },
  component: AmendDashboard,
});
