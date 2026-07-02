import { api } from "@amend/backend/convex/_generated/api";
import { cn } from "@amend/ui/lib/utils";
import { useMutation } from "convex/react";
import { useMemo, useState, type FormEvent } from "react";

import { statusMeta } from "@/components/amend-dashboard-status";
import type { RoadmapStatus } from "@/components/amend-dashboard-types";
import { formatDate } from "@/components/amend-dashboard-format";
import { feedbackStatusToRoadmapStatus } from "@/components/amend-dashboard-status-utils";
import { DetailSectionLabel, SourceEvidenceList } from "@/components/dashboard-detail-shared";
import { ToolbarPill } from "@/components/dashboard-toolbar";
import { PortalSurface, useFeedbackVote } from "@/components/public-portal-shared";
import type { PortalFeedback } from "@/components/public-portal-types";
import { StatusPill } from "@/components/status-pill";
import { VoteButton } from "@/components/vote-button";
import { ArrowLeft, Inbox, Search } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";

type SortKey = "new" | "top";
const STATUS_TABS = Object.keys(statusMeta) as RoadmapStatus[];

export function PortalFeedbackView({
  feedback,
  onOpenPost,
  workspaceSlug,
}: {
  feedback: PortalFeedback[];
  onOpenPost: (stableKey: string) => void;
  workspaceSlug: string;
}) {
  const { vote, voter } = useFeedbackVote(workspaceSlug);
  const [sort, setSort] = useState<SortKey>("top");
  const [status, setStatus] = useState<RoadmapStatus | "all">("all");
  const [query, setQuery] = useState("");

  const statusOf = (item: PortalFeedback) => feedbackStatusToRoadmapStatus(item.status);
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: feedback.length };
    for (const item of feedback) {
      const key = statusOf(item);
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [feedback]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = feedback.filter((item) => {
      if (status !== "all" && statusOf(item) !== status) {
        return false;
      }
      if (needle && !`${item.title} ${item.body}`.toLowerCase().includes(needle)) {
        return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) =>
      sort === "top" ? b.votes - a.votes || b.updatedAt - a.updatedAt : b.updatedAt - a.updatedAt,
    );
  }, [feedback, status, query, sort]);

  return (
    <div className="py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-semibold tracking-tight">Feedback</h1>
          <span className="font-mono text-sm tabular-nums text-muted-foreground/70">
            {feedback.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              aria-label="Search feedback"
              className="h-9 w-56 rounded-lg border-transparent bg-amend-inset pl-9 pr-3 text-sm ring-1 ring-white/[0.055] outline-none transition-[box-shadow] duration-150 ease-linear placeholder:text-muted-foreground focus-visible:ring-white/[0.16]"
            />
          </label>
          <div className="inline-flex rounded-lg bg-amend-inset p-0.5 ring-1 ring-white/[0.055]">
            {(["top", "new"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={sort === option}
                onClick={() => setSort(option)}
                className={cn(
                  "h-8 rounded-md px-3 text-xs font-semibold capitalize transition-colors duration-150 ease-linear",
                  sort === option
                    ? "bg-foreground/[0.08] text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        <ToolbarPill
          active={status === "all"}
          count={counts.all ?? 0}
          onClick={() => setStatus("all")}
        >
          All
        </ToolbarPill>
        {STATUS_TABS.map((key) => (
          <ToolbarPill
            key={key}
            active={status === key}
            count={counts[key] ?? 0}
            onClick={() => setStatus(key)}
          >
            {statusMeta[key].label}
          </ToolbarPill>
        ))}
      </div>

      <PortalSurface className="mt-4 min-h-[calc(100svh-13rem)] overflow-hidden">
        {visible.length === 0 ? (
          <div className="grid place-items-center px-6 py-20 text-center">
            <Inbox className="size-7 text-muted-foreground/30" />
            <h3 className="mt-3 text-sm font-semibold">
              {feedback.length === 0 ? "No feedback yet" : "Nothing matches"}
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              {feedback.length === 0
                ? "Be the first to tell us what to build next."
                : "Try a different status, sort, or search."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.045]">
            {visible.map((item) => (
              <li
                key={item.stableKey}
                className="group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors duration-150 ease-linear hover:bg-foreground/[0.035] md:gap-4 md:px-5"
              >
                <VoteButton
                  count={item.votes}
                  voted={voter.hasVoted(item.stableKey)}
                  onVote={() => vote(item.stableKey)}
                  title={item.title}
                />
                <button
                  type="button"
                  className="min-w-0 text-left transition-colors duration-150 ease-linear active:opacity-75"
                  onClick={() => onOpenPost(item.stableKey)}
                >
                  <span className="block truncate text-[0.9rem] font-semibold leading-5 group-hover:text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {item.body || `Suggested by ${item.authorName}`}
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-3 md:gap-4">
                  <StatusPill status={statusOf(item)} hideLabelOnMobile />
                  <span className="w-16 text-right text-xs tabular-nums text-muted-foreground/70">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalSurface>
    </div>
  );
}

export function PortalFeedbackDetail({
  onBack,
  post,
  workspaceSlug,
}: {
  onBack: () => void;
  post: PortalFeedback;
  workspaceSlug: string;
}) {
  const { vote, voter } = useFeedbackVote(workspaceSlug);
  const recordInteraction = useMutation(api.amend.recordFeedbackInteraction);
  const session = authClient.useSession();
  const [comment, setComment] = useState("");
  const [commentState, setCommentState] = useState<"idle" | "sending" | "sent">("idle");
  const status = feedbackStatusToRoadmapStatus(post.status);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) {
      return;
    }
    setCommentState("sending");
    try {
      await recordInteraction({
        body: comment.trim(),
        email: session.data?.user.email ?? undefined,
        externalUserId: voter.voterId,
        feedbackKey: post.stableKey,
        kind: "comment",
        workspaceSlug,
      });
      setComment("");
      setCommentState("sent");
    } catch {
      setCommentState("idle");
    }
  }

  return (
    <div className="py-5">
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground [&_svg]:size-4"
      >
        <ArrowLeft className="transition-transform duration-150 ease-linear group-hover:-translate-x-0.5" />
        Feedback
      </button>

      <PortalSurface className="mt-4">
        <div className="w-full max-w-3xl px-5 py-6 md:px-8 md:py-8">
          <header className="flex items-start gap-4">
            <VoteButton
              count={post.votes}
              voted={voter.hasVoted(post.stableKey)}
              onVote={() => vote(post.stableKey)}
              title={post.title}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <StatusPill status={status} />
                <span aria-hidden>·</span>
                <span className="truncate">{post.authorName}</span>
                <span aria-hidden>·</span>
                <span>Updated {formatDate(post.updatedAt)}</span>
              </div>
              <h1 className="mt-2.5 text-balance text-2xl font-semibold leading-tight md:text-[1.75rem]">
                {post.title}
              </h1>
            </div>
          </header>

          <div className="mt-8 grid gap-8">
            <section className="grid gap-3">
              <DetailSectionLabel>Description</DetailSectionLabel>
              <p className="whitespace-pre-wrap text-pretty text-sm leading-7 text-muted-foreground">
                {post.body || "No description was added."}
              </p>
              {post.labels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {post.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-white/[0.06]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            {post.sourceLinks.length > 0 ? (
              <section className="grid gap-3">
                <DetailSectionLabel>Source evidence</DetailSectionLabel>
                <SourceEvidenceList links={post.sourceLinks} />
              </section>
            ) : null}

            <section className="grid gap-3">
              <DetailSectionLabel>Add a comment</DetailSectionLabel>
              {commentState === "sent" ? (
                <p className="text-sm text-muted-foreground">
                  Thanks — your comment was sent to the team.{" "}
                  <button
                    type="button"
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                    onClick={() => setCommentState("idle")}
                  >
                    Add another
                  </button>
                </p>
              ) : (
                <form onSubmit={submitComment} className="grid gap-2">
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Share your thoughts…"
                    className="min-h-20 w-full resize-y rounded-lg border-transparent bg-amend-inset px-3 py-2 text-sm ring-1 ring-white/[0.055] outline-none transition-[box-shadow] duration-150 ease-linear placeholder:text-muted-foreground focus-visible:ring-white/[0.16]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={commentState === "sending" || !comment.trim()}
                      className="inline-flex h-9 items-center rounded-lg border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/85 disabled:opacity-40"
                    >
                      {commentState === "sending" ? "Sending…" : "Comment"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </PortalSurface>
    </div>
  );
}
