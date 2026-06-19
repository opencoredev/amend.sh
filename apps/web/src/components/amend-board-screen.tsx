/**
 * The Ghost Board — the proactive-agent hero view, rendered inside the existing
 * dashboard shell (shared sidebar + workspace switcher).
 *
 * A briefing, not an inbox: it opens with what the agent already handled, shows
 * the needs committed to the board, then the "ghosts" still gathering proof —
 * the decisions waiting on you. Accept is optimistic; "Not a thing" teaches a
 * Memory rule (with an Undo). Selecting a need opens its evidence trail in place.
 */
import { cn } from "@amend/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  ActionButton,
  AgentMark,
  Avatar,
  AvatarStack,
  ChannelGlyph,
  EmptyState,
  ErrorState,
  ProofLine,
  SectionLabel,
  SkeletonBar,
  SourceChips,
  StrengthMeter,
  agentButtonClass,
  channelMeta,
} from "@/components/amend-agent-shared";
import { PageHeader, PageScroll } from "@/components/amend-agent-chrome";
import { AmendNeedDetailScreen } from "@/components/amend-need-detail-screen";
import type { Ghost, Need, ProofStrength } from "@/lib/amend-contract";
import { formatDayMonth, growthPhrase } from "@/lib/amend-agent-format";
import {
  acceptGhost,
  keepGathering,
  killGhost,
  restoreGhost,
  useAcceptedNeeds,
  useDigestPreview,
  useGhosts,
} from "@/lib/mock-amend";
import { ChevronRight, Clock, GitMerge, LayoutGrid, Plus, Radio, TrendingUp, X } from "@/lib/icons";
import { toast } from "@/lib/toast";

function ribbonFor(strength: ProofStrength) {
  if (strength === "strong") return { label: "Ready when you are", ready: true };
  if (strength === "building") return { label: "Building proof", ready: false };
  return { label: "Just forming", ready: false };
}

function GhostRibbon({ strength }: { strength: ProofStrength }) {
  const { label, ready } = ribbonFor(strength);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold",
        ready
          ? "bg-amend-success/12 text-amend-success ring-1 ring-amend-success/20 ring-inset"
          : "bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.07] ring-inset",
      )}
    >
      {ready ? (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-amend-success/70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-amend-success" />
        </span>
      ) : null}
      {label}
    </span>
  );
}

function GhostCard({ ghost, onOpen }: { ghost: Ghost; onOpen: () => void }) {
  const ready = ghost.proof.strength === "strong";
  const thin = ghost.proof.strength === "thin";
  const quote = ghost.sampleQuotes[0];

  function onAccept() {
    acceptGhost(ghost.id);
    toast.success({
      title: "Added to the board",
      description: `“${ghost.title}” is now a tracked need.`,
    });
  }
  function onKeep() {
    keepGathering(ghost.id);
    toast.info({
      title: "Keeping watch",
      description: "The agent will resurface it as the proof grows.",
    });
  }
  function onKill() {
    killGhost(ghost.id);
    toast.success({
      title: "Taught Amend to skip this",
      description: `Won't surface “${ghost.title}”-style requests. Manage it in Memory.`,
      button: { title: "Undo", onClick: () => restoreGhost(ghost.id) },
    });
  }

  return (
    <article
      className={cn(
        "group flex flex-col rounded-2xl border border-dashed p-4 transition-colors duration-150 sm:p-5",
        ready
          ? "border-amend-success/25 bg-amend-success/[0.022] hover:border-amend-success/40"
          : "border-white/[0.1] bg-white/[0.012] hover:border-white/[0.18] hover:bg-white/[0.02]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="text-left text-[0.95rem] font-semibold leading-snug tracking-tight text-foreground decoration-white/30 underline-offset-4 hover:underline"
        >
          {ghost.title}
        </button>
        <GhostRibbon strength={ghost.proof.strength} />
      </div>

      <ProofLine proof={ghost.proof} className="mt-2" />

      <SourceChips sources={ghost.proof.sources} className="mt-3" />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <StrengthMeter strength={ghost.proof.strength} />
        <span className="inline-flex items-center gap-1 text-[0.72rem] text-muted-foreground">
          <TrendingUp className="size-3.5 opacity-70" />
          {growthPhrase(ghost.proof.growthPerWeek)}
        </span>
        <span className="text-[0.72rem] text-muted-foreground">
          first raised {formatDayMonth(ghost.firstSeen)}
        </span>
      </div>

      {quote ? (
        <figure className="mt-3.5 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.04] ring-inset">
          <div className="flex items-start gap-2.5">
            <Avatar name={quote.author} size="sm" />
            <div className="min-w-0">
              <blockquote className="text-[0.8rem] leading-relaxed text-foreground/80">
                “{quote.text}”
              </blockquote>
              <figcaption className="mt-1.5 flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                <ChannelGlyph channel={quote.channel} className="size-3 opacity-80" />
                <span className="truncate">{quote.author}</span>
                <span className="opacity-50">· {channelMeta[quote.channel].label}</span>
              </figcaption>
            </div>
          </div>
        </figure>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ActionButton
          variant={ready ? "success" : "primary"}
          size="sm"
          disabled={thin}
          onClick={onAccept}
          title={thin ? "Needs more proof before it can be added" : undefined}
        >
          <Plus />
          Add to board
        </ActionButton>
        <ActionButton variant="ghost" size="sm" onClick={onKeep}>
          <Clock />
          Keep gathering
        </ActionButton>
        <ActionButton variant="danger" size="sm" className="ml-auto" onClick={onKill}>
          <X />
          Not a thing
        </ActionButton>
      </div>

      {thin ? (
        <p className="mt-2.5 text-[0.7rem] leading-relaxed text-muted-foreground">
          Too thin to add yet — the agent keeps gathering until the proof earns a spot.
        </p>
      ) : null}
    </article>
  );
}

function AcceptedRow({ need, onOpen }: { need: Need; onOpen: () => void }) {
  const requesters = need.sampleQuotes.map((q) => q.author);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-4 rounded-xl bg-white/[0.015] px-3.5 py-3 text-left ring-1 ring-white/[0.05] ring-inset transition-colors hover:bg-white/[0.03]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{need.title}</h3>
          {need.linkedShip ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amend-success/12 px-2 py-0.5 text-[0.62rem] font-semibold text-amend-success ring-1 ring-amend-success/20 ring-inset">
              Shipped
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[0.62rem] font-medium text-muted-foreground ring-1 ring-white/[0.07] ring-inset">
              In progress
            </span>
          )}
        </div>
        <ProofLine proof={need.proof} className="mt-1" />
      </div>

      {requesters.length ? (
        <div className="hidden sm:block">
          <AvatarStack names={requesters} size="sm" max={3} />
        </div>
      ) : null}

      <div className="hidden shrink-0 md:block">
        {need.linkedShip ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-muted-foreground">
            <GitMerge className="size-3 text-amend-success" />
            {need.linkedShip.releaseTag ?? need.linkedShip.sha}
          </span>
        ) : (
          <StrengthMeter strength={need.proof.strength} withLabel={false} />
        )}
      </div>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
    </button>
  );
}

function BoardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.05] ring-inset">
        <SkeletonBar className="h-4 w-2/3" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBar key={i} className="h-12" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBar className="h-3 w-28" />
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonBar key={i} className="h-14 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonBar key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function BoardBriefing({
  handledSilently,
  onBoard,
  gathering,
  ready,
}: {
  handledSilently: number;
  onBoard: number;
  gathering: number;
  ready: number;
}) {
  const cells: { label: string; value: number; accent?: boolean }[] = [
    { label: "Handled silently", value: handledSilently },
    { label: "On the board", value: onBoard },
    { label: "Gathering", value: gathering },
    { label: "Ready", value: ready, accent: ready > 0 },
  ];
  return (
    <section className="rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/[0.05] ring-inset sm:p-5">
      <div className="flex items-start gap-3">
        <AgentMark />
        <p className="text-sm leading-relaxed text-foreground/90">
          Handled <span className="font-mono font-semibold tabular-nums">{handledSilently}</span>{" "}
          signals on its own this week.{" "}
          <span className="font-mono font-semibold tabular-nums">{gathering}</span>{" "}
          {gathering === 1 ? "need is" : "needs are"} still gathering proof
          {ready > 0 ? (
            <>
              {" — "}
              <span className="font-medium text-amend-success">{ready} ready when you are</span>.
            </>
          ) : (
            "."
          )}
        </p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/[0.05] ring-inset sm:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label} className="bg-[#151518] px-4 py-3">
            <dd
              className={cn(
                "font-mono text-xl font-semibold tabular-nums",
                c.accent ? "text-amend-success" : "text-foreground",
              )}
            >
              {c.value}
            </dd>
            <dt className="mt-0.5 text-[0.68rem] text-muted-foreground">{c.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function AmendBoardScreen() {
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const ghostsQuery = useGhosts();
  const acceptedQuery = useAcceptedNeeds();
  const digestQuery = useDigestPreview();

  if (selectedNeedId) {
    return <AmendNeedDetailScreen needId={selectedNeedId} onBack={() => setSelectedNeedId(null)} />;
  }

  const isLoading = ghostsQuery.isLoading || acceptedQuery.isLoading || digestQuery.isLoading;
  const isError = ghostsQuery.isError || acceptedQuery.isError || digestQuery.isError;

  const ghosts = ghostsQuery.data ?? [];
  const accepted = acceptedQuery.data ?? [];
  const ready = ghosts.filter((g) => g.proof.strength === "strong").length;

  return (
    <>
      <PageHeader
        icon={LayoutGrid}
        title="The board"
        subtitle="What your agent assembled from this week's signals"
      />
      <PageScroll routeKey="board" className="max-w-6xl space-y-8">
        {isError ? (
          <ErrorState />
        ) : isLoading ? (
          <BoardSkeleton />
        ) : ghosts.length === 0 && accepted.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="Your board is clear"
            hint="Connect a source and the agent will start assembling needs from your feedback — nothing to triage by hand."
            action={
              <Link
                to="/dashboard/$view"
                params={{ view: "settings" }}
                className={agentButtonClass("primary", "sm")}
              >
                Connect a source
              </Link>
            }
          />
        ) : (
          <>
            <BoardBriefing
              handledSilently={digestQuery.data?.handledSilently ?? 0}
              onBoard={accepted.length}
              gathering={ghosts.length}
              ready={ready}
            />

            <section className="space-y-3">
              <SectionLabel count={accepted.length}>On the board</SectionLabel>
              {accepted.length ? (
                <div className="space-y-2">
                  {accepted.map((need) => (
                    <AcceptedRow
                      key={need.id}
                      need={need}
                      onOpen={() => setSelectedNeedId(need.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-5 text-center text-xs text-muted-foreground">
                  Nothing committed yet. Add a ghost below when its proof is strong enough.
                </p>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionLabel count={ghosts.length}>Gathering proof</SectionLabel>
                <span className="text-[0.7rem] text-muted-foreground/70">Sorted by strength</span>
              </div>
              {ghosts.length ? (
                <div className="grid items-start gap-3 lg:grid-cols-2">
                  {ghosts.map((ghost) => (
                    <GhostCard
                      key={ghost.id}
                      ghost={ghost}
                      onOpen={() => setSelectedNeedId(ghost.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-5 text-center text-xs text-muted-foreground">
                  No ghosts gathering right now — the agent is watching your sources.
                </p>
              )}
            </section>
          </>
        )}
      </PageScroll>
    </>
  );
}
