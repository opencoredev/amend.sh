/**
 * Need detail / evidence trail — opened in place from the board (back returns
 * to the grid).
 *
 * Sources-first. The page opens with a computed synthesis ("9 people across
 * Discord, GitHub and support — 3 paying — first raised Mar 2, active this
 * week"), makes the *people* the spine, then groups the raw evidence by source
 * (collapsed to 2 quotes each). The linked ship — with its SHA — closes the loop.
 */
import { cn } from "@amend/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  ActionButton,
  Avatar,
  ChannelGlyph,
  EmptyState,
  ErrorState,
  IconButton,
  SectionLabel,
  ShaChip,
  SkeletonBar,
  StrengthMeter,
  agentButtonClass,
  channelMeta,
} from "@/components/amend-agent-shared";
import { PageScroll } from "@/components/amend-agent-chrome";
import type { Evidence, Need, ProofStrength, SourceChannel } from "@/lib/amend-contract";
import { activityPhrase, formatDayMonth, formatFullDate } from "@/lib/amend-agent-format";
import {
  useAcceptGhost,
  useKeepGathering,
  useKillGhost,
  useNeed,
  useRestoreGhost,
} from "@/lib/amend-data";
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  ExternalLink,
  Inbox,
  Megaphone,
  Plus,
  X,
} from "@/lib/icons";
import { toast } from "@/lib/toast";

function prose(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function synthesis(need: Need): string {
  const channels = prose(need.proof.sources.map((s) => channelMeta[s.channel].label));
  const paying = need.proof.payingPeople > 0 ? `, ${need.proof.payingPeople} paying,` : "";
  return `${need.proof.people} people across ${channels}${paying} — first raised ${formatDayMonth(
    need.firstSeen,
  )}, ${activityPhrase(need.lastSeen)}.`;
}

type PersonGroup = {
  key: string;
  author: string;
  handle?: string;
  avatarUrl?: string;
  channels: SourceChannel[];
  items: Evidence[];
};

// Dedupe one person across all their mentions (by stable handle, falling back to
// display name) so the trail reads person-first: who asked, and everything each
// of them actually said — most-engaged first.
function groupByPerson(evidence: Evidence[]): PersonGroup[] {
  const map = new Map<string, PersonGroup>();
  for (const e of evidence) {
    const key = (e.authorHandle || e.author).toLowerCase();
    const group =
      map.get(key) ??
      ({ key, author: e.author, handle: e.authorHandle, channels: [], items: [] } as PersonGroup);
    group.items.push(e);
    if (!group.channels.includes(e.sourceChannel)) group.channels.push(e.sourceChannel);
    if (!group.avatarUrl && e.authorAvatarUrl) group.avatarUrl = e.authorAvatarUrl;
    map.set(key, group);
  }
  return [...map.values()].sort((a, b) => b.items.length - a.items.length);
}

// Color the demand by how much signal backs it — grey while still gathering,
// warming to gold as more (and paying) people ask.
const strengthTone: Record<ProofStrength, { dot: string; text: string; label: string }> = {
  thin: { dot: "bg-muted-foreground/40", text: "text-muted-foreground", label: "Still gathering" },
  building: { dot: "bg-amber-400", text: "text-amber-300", label: "Building" },
  strong: { dot: "bg-amend-warm", text: "text-amend-warm", label: "Strong demand" },
};

function PersonCard({ group }: { group: PersonGroup }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? group.items : group.items.slice(0, 3);
  const rest = group.items.length - shown.length;
  return (
    <section className="overflow-hidden rounded-2xl bg-white/[0.015] ring-1 ring-white/[0.05] ring-inset">
      <header className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3">
        <Avatar name={group.author} src={group.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{group.author}</span>
            {group.handle ? (
              <span className="truncate text-[0.7rem] text-muted-foreground">@{group.handle}</span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[0.68rem] text-muted-foreground">
            <span className="flex items-center gap-1">
              {group.channels.map((channel) => (
                <ChannelGlyph
                  key={channel}
                  channel={channel}
                  className="size-3 text-muted-foreground/70"
                />
              ))}
            </span>
            <span>
              {group.items.length} {group.items.length === 1 ? "mention" : "mentions"}
            </span>
          </div>
        </div>
      </header>
      <ul className="divide-y divide-white/[0.04]">
        {shown.map((item) => (
          <li key={item.id} className="flex items-start gap-2 px-4 py-2.5">
            <p className="min-w-0 flex-1 text-[0.83rem] leading-relaxed text-foreground/85">
              <span className="select-none text-muted-foreground/40">“</span>
              {item.text}
              <span className="select-none text-muted-foreground/40">”</span>
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex shrink-0 text-muted-foreground/40 transition-colors hover:text-foreground"
              aria-label="Open original"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </li>
        ))}
      </ul>
      {rest > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.05] py-2 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:bg-white/[0.02] hover:text-foreground"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded ? "Show less" : `Show ${rest} more from ${group.author}`}
        </button>
      ) : null}
    </section>
  );
}

function ProofRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function ProofRail({ need, onBack }: { need: Need; onBack: () => void }) {
  const isGhost = need.status === "ghost";
  const thin = need.proof.strength === "thin";
  const acceptGhost = useAcceptGhost();
  const keepGathering = useKeepGathering();
  const killGhost = useKillGhost();
  const restoreGhost = useRestoreGhost();

  return (
    <aside className="space-y-3 lg:sticky lg:top-1">
      <div className="rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/[0.05] ring-inset">
        <SectionLabel>Proof at a glance</SectionLabel>
        <div className="mt-2 divide-y divide-white/[0.05]">
          <ProofRow label="People">
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {need.proof.people}
            </span>
          </ProofRow>
          <ProofRow label="Paying">
            <span
              className={cn(
                "font-mono text-sm font-semibold tabular-nums",
                need.proof.payingPeople > 0 ? "text-amend-warm" : "text-muted-foreground",
              )}
            >
              {need.proof.payingPeople}
            </span>
          </ProofRow>
          <ProofRow label="Strength">
            <StrengthMeter strength={need.proof.strength} />
          </ProofRow>
        </div>

        <div className="mt-3 border-t border-white/[0.05] pt-3">
          <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
            Sources
          </p>
          <div className="space-y-1">
            {need.proof.sources.map((s) => (
              <div key={s.channel} className="flex items-center gap-2 text-xs">
                <ChannelGlyph channel={s.channel} className="text-muted-foreground/80" />
                <span className="text-foreground/80">{channelMeta[s.channel].label}</span>
                <span className="ml-auto font-mono tabular-nums text-muted-foreground">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-1 border-t border-white/[0.05] pt-3 text-[0.72rem] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>First raised</span>
            <span className="text-foreground/70">{formatDayMonth(need.firstSeen)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last active</span>
            <span className="text-foreground/70">{formatDayMonth(need.lastSeen)}</span>
          </div>
        </div>
      </div>

      {need.linkedShip ? (
        <div className="rounded-2xl bg-amend-success/[0.04] p-4 ring-1 ring-amend-success/15 ring-inset">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amend-success">Shipped</span>
            <span className="text-[0.7rem] text-muted-foreground">
              {formatFullDate(need.linkedShip.mergedAt)}
            </span>
          </div>
          <div className="mt-2.5">
            <ShaChip ship={need.linkedShip} />
          </div>
          <Link
            to="/dashboard/$view"
            params={{ view: "inbox" }}
            className={agentButtonClass("secondary", "sm", "mt-3 w-full")}
          >
            <Megaphone />
            Draft an update
          </Link>
        </div>
      ) : null}

      {isGhost ? (
        <div className="space-y-2 rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/[0.05] ring-inset">
          <p className="text-[0.72rem] text-muted-foreground">Your call on this ghost</p>
          <ActionButton
            variant={need.proof.strength === "strong" ? "success" : "primary"}
            size="sm"
            disabled={thin}
            className="w-full"
            title={thin ? "Needs more proof before it can be added" : undefined}
            onClick={() => {
              void acceptGhost(need.id);
              toast.success({
                title: "Added to the board",
                description: `“${need.title}” is now tracked.`,
              });
            }}
          >
            <Plus />
            Add to board
          </ActionButton>
          <div className="flex gap-2">
            <ActionButton
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                void keepGathering(need.id);
                toast.info({
                  title: "Keeping watch",
                  description: "Resurfaced as the proof grows.",
                });
              }}
            >
              <Clock />
              Keep
            </ActionButton>
            <ActionButton
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => {
                void killGhost(need.id);
                toast.success({
                  title: "Taught Amend to skip this",
                  description: "Manage it in Memory.",
                  button: { title: "Undo", onClick: () => void restoreGhost(need.id) },
                });
                onBack();
              }}
            >
              <X />
              Not a thing
            </ActionButton>
          </div>
          {thin ? (
            <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
              Too thin to add yet — the agent keeps gathering until it earns a spot.
            </p>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBar className="h-7 w-3/4" />
      <SkeletonBar className="h-4 w-full max-w-xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBar key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <SkeletonBar className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export function AmendNeedDetailScreen({ needId, onBack }: { needId: string; onBack: () => void }) {
  const { data: need, isLoading, isError } = useNeed(needId);
  const groups = need ? groupByPerson(need.evidence) : [];
  const tone = need ? strengthTone[need.proof.strength] : strengthTone.thin;

  const statusLabel = need
    ? need.status === "accepted"
      ? need.linkedShip
        ? "Shipped"
        : "On the board"
      : "Gathering proof"
    : "";

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 px-5 pt-4 md:px-8">
        <IconButton aria-label="Back to inbox" onClick={onBack}>
          <ArrowLeft />
        </IconButton>
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={onBack}
            className="transition-colors hover:text-foreground"
          >
            Inbox
          </button>
          {need ? (
            <>
              <span className="opacity-40">/</span>
              <span className="text-foreground">{statusLabel}</span>
            </>
          ) : null}
        </nav>
      </div>

      <PageScroll routeKey={`need-${needId}`} className="max-w-5xl">
        {isError ? (
          <ErrorState />
        ) : isLoading ? (
          <DetailSkeleton />
        ) : !need ? (
          <EmptyState
            icon={Inbox}
            title="This need isn't here anymore"
            hint="It may have been dismissed or never existed. Head back to your inbox to see what's live."
            action={
              <ActionButton variant="primary" size="sm" onClick={onBack}>
                Back to inbox
              </ActionButton>
            }
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.4rem]">
                {need.title}
              </h1>
              <span
                className={cn(
                  "mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[0.7rem] font-medium ring-1 ring-white/[0.06] ring-inset",
                  tone.text,
                )}
              >
                <span className={cn("size-1.5 rounded-full", tone.dot)} />
                {tone.label}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {synthesis(need)}
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="space-y-3">
                <SectionLabel count={groups.length}>Who's asking</SectionLabel>
                {groups.map((group) => (
                  <PersonCard key={group.key} group={group} />
                ))}
                {groups.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-5 text-center text-xs text-muted-foreground">
                    No evidence captured yet.
                  </p>
                ) : null}
              </div>
              <ProofRail need={need} onBack={onBack} />
            </div>
          </>
        )}
      </PageScroll>
    </>
  );
}
