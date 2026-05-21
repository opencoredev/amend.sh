import { Button, buttonVariants } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import {
  Bell,
  FolderOpen,
  GitPullRequestArrow,
  Lightbulb,
  MessageSquareText,
  Road,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import AmendLogo from "@/components/amend-logo";
import UserMenu from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";
import { canonicalLink, openGraphMeta } from "@/lib/seo";

export const Route = createFileRoute("/portal/$workspaceSlug")({
  head: ({ params }) => ({
    links: [canonicalLink(`/portal/${params.workspaceSlug}`)],
    meta: [
      {
        title: `${params.workspaceSlug} - Amend public portal`,
      },
      {
        name: "description",
        content: "Source-linked changelog, roadmap, and feedback portal powered by Amend.sh.",
      },
      ...openGraphMeta({
        description: "Source-linked changelog, roadmap, and feedback portal powered by Amend.sh.",
        path: `/portal/${params.workspaceSlug}`,
        title: `${params.workspaceSlug} - Amend public portal`,
      }),
    ],
  }),
  component: PortalRoute,
});

const portalQuery = makeFunctionReference<"query">("amend:getPublicPortal");
const feedbackMutation = makeFunctionReference<"mutation">("amend:createFeedback");

type PortalData = {
  changelog: PortalChangelog[];
  feedback: PortalFeedback[];
  roadmap: PortalRoadmap[];
  workspace: {
    description?: string;
    name: string;
    portalSettings?: {
      accentColor?: string;
      changelogVisibility: "private" | "public";
      feedbackMode: "authenticated" | "closed" | "open";
      headline?: string;
      intro?: string;
      roadmapVisibility: "private" | "public";
    };
    slug: string;
  };
};

type SourceLink = {
  externalId: string;
  kind: string;
  number?: number;
  provider: string;
  title: string;
  url: string;
};

type PortalChangelog = {
  body: string;
  category: string;
  publishedAt?: number;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  summary: string;
  title: string;
  updatedAt: number;
  version?: string;
};

type PortalRoadmap = {
  feedbackCount: number;
  impact: string;
  priority: string;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  target?: string;
  title: string;
  updatedAt: number;
};

type PortalFeedback = {
  authorName: string;
  body: string;
  labels: string[];
  linkedChangelogCount: number;
  linkedRoadmapCount: number;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  title: string;
  votes: number;
};

function PortalRoute() {
  const { workspaceSlug } = Route.useParams();
  const portal = useQuery(portalQuery, { workspaceSlug }) as PortalData | undefined;

  if (!portal) {
    return <PortalSkeleton workspaceSlug={workspaceSlug} />;
  }

  const settings = portal.workspace.portalSettings;
  const roadmap = settings?.roadmapVisibility === "private" ? [] : portal.roadmap;
  const changelog = settings?.changelogVisibility === "private" ? [] : portal.changelog;
  const feedback = settings?.feedbackMode === "closed" ? [] : portal.feedback;

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-sm font-semibold">
              {portal.workspace.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="truncate text-base font-semibold">{portal.workspace.name}</span>
          </Link>
          <nav
            aria-label="Portal"
            className="hidden items-center gap-2 text-sm font-medium sm:flex"
          >
            <a href="#feedback" className="rounded-full border bg-card px-4 py-2">
              Feedback
            </a>
            <a
              href="#roadmap"
              className="rounded-full px-4 py-2 text-muted-foreground hover:text-foreground"
            >
              Roadmap
            </a>
            <a
              href="#updates"
              className="rounded-full px-4 py-2 text-muted-foreground hover:text-foreground"
            >
              Updates
            </a>
          </nav>
          <PortalAccountActions />
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-7 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{portal.workspace.slug}.amend.sh</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal">
              {settings?.headline ?? "All feedback"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {settings?.intro ??
                portal.workspace.description ??
                "Requests, roadmap moves, and shipped updates with source evidence from Amend."}
            </p>
          </div>
          <Button size="icon" variant="outline" aria-label="Search feedback">
            <Search />
          </Button>
        </div>

        <div id="feedback" className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <section className="rounded-lg border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-muted-foreground" />
                <h2 className="text-lg font-semibold">All feedback</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  Top
                </Button>
              </div>
            </div>

            {feedback.length === 0 ? (
              <EmptyState
                icon={MessageSquareText}
                title="Ready to collect feedback"
                text="Share this portal with users to start collecting source-linked requests."
              />
            ) : (
              <div className="divide-y">
                {feedback.map((item) => (
                  <article key={item.stableKey} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                      </div>
                      <span className="rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="grid size-8 place-items-center rounded-full bg-muted font-medium text-foreground">
                        {item.authorName.slice(0, 2).toUpperCase()}
                      </span>
                      <span>{item.authorName}</span>
                      <span>{item.sourceLinks.length} sources</span>
                      <span className="ml-auto rounded-md border px-2 py-1">
                        {item.votes} votes
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="grid gap-3">
            <FeedbackSubmissionPanel
              feedbackMode={settings?.feedbackMode ?? "open"}
              workspaceSlug={workspaceSlug}
            />
            <section className="rounded-lg border bg-card p-3">
              <div className="mb-2 flex items-center gap-2 px-1">
                <FolderOpen className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Boards</h2>
              </div>
              <BoardRow active count={feedback.length} label="All feedback" />
              <BoardRow count={roadmap.length} label="Roadmap" />
              <BoardRow count={changelog.length} label="Updates" />
            </section>
            <p className="mx-auto rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              Powered by Amend
            </p>
          </aside>
        </div>

        <section id="roadmap" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Road className="size-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Product roadmap</h2>
            </div>
            {roadmap.length === 0 ? (
              <EmptyState
                icon={Road}
                title="Roadmap is empty"
                text="New planned work will appear here once requests are linked to source evidence."
              />
            ) : (
              <div className="divide-y">
                {roadmap.map((item) => (
                  <article key={item.stableKey} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="rounded-full border bg-muted px-2.5 py-1 text-xs">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.impact}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {item.feedbackCount} feedback links · {item.target ?? "no target"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="updates" className="rounded-lg border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Product updates</h2>
          </div>
          {changelog.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No updates found"
              text="Shipped source-linked updates will appear here after publication."
            />
          ) : (
            <div className="grid gap-3">
              {changelog.map((item) => (
                <article key={item.stableKey} className="rounded-lg border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="rounded-full border bg-muted px-2.5 py-1 text-xs">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.sourceLinks.slice(0, 3).map((link) => (
                      <a
                        key={link.externalId}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:text-foreground"
                      >
                        <GitPullRequestArrow className="size-3.5" />
                        {link.title}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function FeedbackSubmissionPanel({
  feedbackMode,
  workspaceSlug,
}: {
  feedbackMode: "authenticated" | "closed" | "open";
  workspaceSlug: string;
}) {
  const session = authClient.useSession();
  const isAuthenticated = Boolean(session.data?.user);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "submitting">("idle");
  const [error, setError] = useState("");
  const disabled =
    feedbackMode === "closed" || (feedbackMode === "authenticated" && !isAuthenticated);
  const createFeedback = useMutation(feedbackMutation);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }
    setState("submitting");
    setError("");

    try {
      await createFeedback({
        authorEmail: session.data?.user.email ?? (email || undefined),
        authorName: session.data?.user.name ?? undefined,
        body,
        sourceUrl: window.location.href,
        title,
        workspaceSlug,
      });
      setTitle("");
      setBody("");
      setEmail("");
      setState("sent");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Feedback request failed");
      setState("idle");
    }
  }

  if (feedbackMode === "closed") {
    return (
      <section className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Feedback is closed for this workspace, but shipped records remain visible.
      </section>
    );
  }

  if (feedbackMode === "authenticated" && !isAuthenticated) {
    return (
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Got an idea?</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to submit feedback and receive shipped updates.
        </p>
        <Link to="/sign-in" className={cn(buttonVariants({ size: "sm" }), "mt-4 h-9 w-full")}>
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={submitFeedback} className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Got an idea?</h2>
      </div>
      <div className="mt-4 grid gap-2">
        <Input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Request title"
        />
        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={session.data?.user.email ?? "Email for updates"}
          type="email"
        />
        <textarea
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What should change?"
          className="min-h-24 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>
      <Button type="submit" className="mt-3 w-full" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting" : "Submit a post"}
      </Button>
      <div className="mt-2 min-h-4 text-xs text-muted-foreground">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : state === "sent" ? (
          "Request sent for triage."
        ) : null}
      </div>
    </form>
  );
}

function PortalSkeleton({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <main className="min-h-svh bg-background px-4 py-5 text-foreground sm:px-6">
      <div className="mx-auto max-w-5xl">
        <AmendLogo size="md" markVariant="soft" />
        <div className="grid gap-4 py-20">
          <p className="text-sm text-muted-foreground">{workspaceSlug}.amend.sh</p>
          <div className="h-10 max-w-md rounded-lg bg-muted" />
          <div className="h-4 max-w-xl rounded-lg bg-muted" />
          <div className="h-56 rounded-lg border bg-card" />
        </div>
      </div>
    </main>
  );
}

function PortalAccountActions() {
  const session = authClient.useSession();
  const isAuthenticated = Boolean(session.data?.user);

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <UserMenu />
        <Link
          to="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 px-3")}
        >
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <Link
      to="/sign-in"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 px-3")}
    >
      Sign in
    </Link>
  );
}

function BoardRow({ active, count, label }: { active?: boolean; count: number; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm",
        active ? "bg-muted font-medium" : "text-muted-foreground",
      )}
    >
      <span className="size-2 rounded-full bg-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="rounded-full border bg-background px-2 text-xs">{count}</span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
  title,
}: {
  icon: LucideIcon;
  text: string;
  title: string;
}) {
  return (
    <div className="grid place-items-center px-4 py-14 text-center">
      <span className="grid size-16 place-items-center rounded-full border bg-muted/40">
        <Icon className="size-8 text-muted-foreground" />
      </span>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
