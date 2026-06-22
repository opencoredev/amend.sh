/**
 * Inbox — the agent's triage queue. One dense, scannable list segmented by tab
 * (Needs review · In progress · Shipped). Each row is one item: a plain type
 * icon, a title + a single status chip, a clean stat line, and low-chrome inline
 * actions. Drafts sit open with their full text and an Approve / Edit / Reject
 * row. Reads off the one mock store; selecting a need opens its evidence trail.
 */
import { cn } from "@amend/ui/lib/utils";
import { type ReactNode, useState } from "react";

import {
  Avatar,
  ChannelGlyph,
  EmptyState,
  ErrorState,
  ShaChip,
  SkeletonBar,
  channelMeta,
} from "@/components/amend-agent-shared";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { ToolbarBar, ToolbarGroup, ToolbarPill } from "@/components/dashboard-toolbar";
import { PageHeader } from "@/components/amend-agent-chrome";
import { AmendNeedDetailScreen } from "@/components/amend-need-detail-screen";
import type { DigestResolved, DraftProposal, Ghost, Need, Proof } from "@/lib/amend-contract";
import {
  acceptGhost,
  approveDraft,
  killGhost,
  rejectDraft,
  restoreGhost,
  updateDraftText,
  useAcceptedNeeds,
  useDigestPreview,
  useGhosts,
  usePendingDrafts,
} from "@/lib/mock-amend";
import {
  Check,
  ChevronRight,
  GitMerge,
  Inbox,
  Megaphone,
  Newspaper,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  SquarePen,
  X,
  type LucideIcon,
} from "@/lib/icons";
import { toast } from "@/lib/toast";

// ---------------------------------------------------------------------------
// Chrome
// ---------------------------------------------------------------------------

function CenteredSurface({ children }: { children: ReactNode }) {
  return <div className="grid min-h-0 flex-1 place-items-center p-6">{children}</div>;
}

function TabEmpty({ children }: { children: ReactNode }) {
  return <p className="px-6 py-16 text-center text-sm text-muted-foreground">{children}</p>;
}

// ---------------------------------------------------------------------------
// Row primitives — plain icon, status chip, stat line, low-chrome actions.
// ---------------------------------------------------------------------------

const glyphColor = {
  muted: "text-muted-foreground/70",
  success: "text-amend-success",
  warm: "text-amend-warm",
} as const;

function RowGlyph({
  icon: Icon,
  tone,
  className,
}: {
  icon: LucideIcon;
  tone: keyof typeof glyphColor;
  className?: string;
}) {
  return <Icon className={cn("size-4 shrink-0", glyphColor[tone], className)} />;
}

function StatusChip({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "success" | "warm";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-medium",
        tone === "success"
          ? "bg-amend-success/10 text-amend-success"
          : tone === "warm"
            ? "bg-amend-warm/10 text-amend-warm"
            : "bg-white/[0.05] text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function ReadyChip() {
  return (
    <StatusChip tone="success">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-amend-success/70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-amend-success" />
      </span>
      Ready
    </StatusChip>
  );
}

function ProofStats({ proof, className }: { proof: Proof; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <span>
        <span className="font-semibold text-foreground">{proof.people}</span> people
      </span>
      {proof.payingPeople > 0 ? (
        <span>
          <span className="font-semibold text-amend-warm">{proof.payingPeople}</span> paying
        </span>
      ) : null}
      <span>
        <span className="font-semibold text-foreground">{proof.sources.length}</span>{" "}
        {proof.sources.length === 1 ? "source" : "sources"}
      </span>
    </div>
  );
}

// Low-chrome action buttons — soft-filled primary, quiet secondary. No borders.
function PrimaryAction({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-amend-success/15 px-2.5 text-xs font-semibold text-amend-success outline-none transition-colors duration-150 ease-linear hover:bg-amend-success/25 active:opacity-75 focus-visible:ring-2 focus-visible:ring-amend-success/40 [&_svg]:size-3.5"
    >
      {children}
    </button>
  );
}

function QuietAction({
  onClick,
  children,
  danger = false,
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium outline-none transition-colors duration-150 ease-linear active:opacity-75 focus-visible:ring-2 focus-visible:ring-white/20 [&_svg]:size-3.5",
        danger
          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

const rowGrid = "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 md:px-6";

// ---------------------------------------------------------------------------
// Draft row — held changelog entry / message, open in place with the full text.
// ---------------------------------------------------------------------------

function RecipientList({ draft }: { draft: DraftProposal }) {
  if (!draft.recipients?.length) return null;
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[0.7rem] text-muted-foreground">
        Reaches {draft.recipients.length} {draft.recipients.length === 1 ? "person" : "people"}:
      </span>
      {draft.recipients.map((r) => (
        <span
          key={`${r.handle}-${r.channel}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] py-0.5 pl-1 pr-2 ring-1 ring-white/[0.06] ring-inset"
          title={`${r.handle} · ${channelMeta[r.channel].label}`}
        >
          <Avatar name={r.handle} size="sm" />
          <span className="text-[0.7rem] text-foreground/80">{r.handle}</span>
          <ChannelGlyph channel={r.channel} className="size-3 text-muted-foreground/70" />
        </span>
      ))}
    </div>
  );
}

function DraftRow({ draft }: { draft: DraftProposal }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft.draftText);
  const isNotify = draft.kind === "notify";

  function approve(value?: string) {
    if (value !== undefined) updateDraftText(draft.id, value);
    approveDraft(draft.id);
    toast.success({
      title: "Approved",
      description: isNotify
        ? "Your message will go to the people who asked."
        : "It'll be added to your changelog.",
    });
  }
  function reject() {
    rejectDraft(draft.id);
    toast.info({ title: "Draft rejected", description: "The agent won't send this one." });
  }

  return (
    <div className="px-5 py-4 transition-colors duration-150 hover:bg-foreground/[0.015] md:px-6">
      <div className="flex items-start gap-3">
        <RowGlyph icon={isNotify ? Megaphone : Newspaper} tone="warm" className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{draft.needTitle}</span>
            <StatusChip tone="warm">Held</StatusChip>
          </div>

          {isNotify ? <RecipientList draft={draft} /> : null}

          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              autoFocus
              className="mt-2.5 w-full resize-y rounded-xl bg-[#151518] p-3 text-[0.84rem] leading-relaxed text-foreground ring-1 ring-white/[0.09] ring-inset outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          ) : (
            <p className="mt-1.5 whitespace-pre-wrap text-[0.84rem] leading-relaxed text-foreground/80">
              {draft.draftText}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1">
            {editing ? (
              <>
                <PrimaryAction onClick={() => approve(text)}>
                  <Check />
                  Save &amp; approve
                </PrimaryAction>
                <QuietAction
                  onClick={() => {
                    setText(draft.draftText);
                    setEditing(false);
                  }}
                >
                  Cancel
                </QuietAction>
              </>
            ) : (
              <>
                <PrimaryAction onClick={() => approve()}>
                  <Check />
                  Approve
                </PrimaryAction>
                <QuietAction onClick={() => setEditing(true)}>
                  <SquarePen />
                  Edit
                </QuietAction>
                <QuietAction danger className="ml-auto" onClick={reject}>
                  <X />
                  Reject
                </QuietAction>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detected-need row — strong enough to schedule.
// ---------------------------------------------------------------------------

function ReadyRow({ ghost, onOpen }: { ghost: Ghost; onOpen: () => void }) {
  function add() {
    acceptGhost(ghost.id);
    toast.success({
      title: "Added to the roadmap",
      description: `“${ghost.title}” is now a tracked need.`,
    });
  }
  function dismiss() {
    killGhost(ghost.id);
    toast.success({
      title: "Dismissed",
      description: `Amend won't resurface “${ghost.title}”. Manage it in Memory.`,
      button: { title: "Undo", onClick: () => restoreGhost(ghost.id) },
    });
  }
  return (
    <div className="transition-colors duration-150 hover:bg-foreground/[0.015]">
      <div className={rowGrid}>
        <RowGlyph icon={Sparkles} tone="success" />
        <button type="button" onClick={onOpen} className="min-w-0 text-left">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{ghost.title}</span>
            <ReadyChip />
          </div>
          <ProofStats proof={ghost.proof} className="mt-1" />
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <PrimaryAction onClick={add}>
            <Plus />
            <span className="hidden sm:inline">Add</span>
          </PrimaryAction>
          <QuietAction danger onClick={dismiss}>
            <X />
            <span className="hidden sm:inline">Dismiss</span>
          </QuietAction>
        </div>
      </div>
    </div>
  );
}

function InProgressRow({ need, onOpen }: { need: Need; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full text-left transition-colors duration-150 hover:bg-foreground/[0.015]"
    >
      <div className={rowGrid}>
        <RowGlyph icon={Radio} tone="muted" />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{need.title}</span>
            <StatusChip>In progress</StatusChip>
          </div>
          <ProofStats proof={need.proof} className="mt-1" />
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
      </div>
    </button>
  );
}

function ShippedRow({ item }: { item: DigestResolved }) {
  return (
    <div className={rowGrid}>
      <RowGlyph icon={GitMerge} tone="success" />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{item.needTitle}</span>
          <StatusChip tone="success">Shipped</StatusChip>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{item.peopleNotified}</span>{" "}
          {item.peopleNotified === 1 ? "person" : "people"} notified
        </p>
      </div>
      <ShaChip ship={item.ship} className="hidden shrink-0 sm:inline-flex" />
    </div>
  );
}

function InboxSkeleton() {
  return (
    <div className="grid divide-y divide-white/[0.045]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={rowGrid}>
          <SkeletonBar className="size-4 rounded" />
          <div className="space-y-2">
            <SkeletonBar className="h-3.5 w-1/2" />
            <SkeletonBar className="h-3 w-2/3" />
          </div>
          <SkeletonBar className="h-7 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

type InboxTab = "review" | "progress" | "shipped";

export function AmendInboxScreen() {
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const [tab, setTab] = useState<InboxTab>("review");
  const draftsQuery = usePendingDrafts();
  const ghostsQuery = useGhosts();
  const acceptedQuery = useAcceptedNeeds();
  const digestQuery = useDigestPreview();

  if (selectedNeedId) {
    return <AmendNeedDetailScreen needId={selectedNeedId} onBack={() => setSelectedNeedId(null)} />;
  }

  const isLoading =
    draftsQuery.isLoading ||
    ghostsQuery.isLoading ||
    acceptedQuery.isLoading ||
    digestQuery.isLoading;
  const isError =
    draftsQuery.isError || ghostsQuery.isError || acceptedQuery.isError || digestQuery.isError;

  const drafts = draftsQuery.data ?? [];
  const ready = (ghostsQuery.data ?? []).filter((g) => g.proof.strength === "strong");
  const inProgress = (acceptedQuery.data ?? []).filter((n) => !n.linkedShip);
  const resolved = digestQuery.data?.resolved ?? [];
  const reviewCount = drafts.length + ready.length;
  const isEmpty = reviewCount === 0 && inProgress.length === 0 && resolved.length === 0;
  const hasContent = !isLoading && !isError && !isEmpty;

  return (
    <>
      <PageHeader
        className="relative z-20 bg-background"
        icon={Inbox}
        title="Inbox"
        filters={
          hasContent ? (
            <ToolbarBar>
              <ToolbarGroup>
                <ToolbarPill
                  active={tab === "review"}
                  count={reviewCount}
                  onClick={() => setTab("review")}
                >
                  Needs review
                </ToolbarPill>
                <ToolbarPill
                  active={tab === "progress"}
                  count={inProgress.length}
                  onClick={() => setTab("progress")}
                >
                  In progress
                </ToolbarPill>
                <ToolbarPill
                  active={tab === "shipped"}
                  count={resolved.length}
                  onClick={() => setTab("shipped")}
                >
                  Shipped
                </ToolbarPill>
              </ToolbarGroup>
            </ToolbarBar>
          ) : undefined
        }
      />

      <DashboardWorkspaceSurface>
        {isError ? (
          <CenteredSurface>
            <ErrorState />
          </CenteredSurface>
        ) : isLoading ? (
          <InboxSkeleton />
        ) : isEmpty ? (
          <CenteredSurface>
            <EmptyState
              icon={ShieldCheck}
              title="You're all caught up"
              hint="When the agent drafts an update, finds a need that's ready, or ships something worth announcing, it lands here first — held until you decide."
            />
          </CenteredSurface>
        ) : (
          <div className="grid divide-y divide-white/[0.045]">
            {tab === "review" ? (
              reviewCount === 0 ? (
                <TabEmpty>Nothing waiting on you right now.</TabEmpty>
              ) : (
                <>
                  {drafts.map((draft) => (
                    <DraftRow key={draft.id} draft={draft} />
                  ))}
                  {ready.map((ghost) => (
                    <ReadyRow
                      key={ghost.id}
                      ghost={ghost}
                      onOpen={() => setSelectedNeedId(ghost.id)}
                    />
                  ))}
                </>
              )
            ) : tab === "progress" ? (
              inProgress.length === 0 ? (
                <TabEmpty>Nothing in progress.</TabEmpty>
              ) : (
                inProgress.map((need) => (
                  <InProgressRow
                    key={need.id}
                    need={need}
                    onOpen={() => setSelectedNeedId(need.id)}
                  />
                ))
              )
            ) : resolved.length === 0 ? (
              <TabEmpty>Nothing shipped this week.</TabEmpty>
            ) : (
              resolved.map((item) => (
                <ShippedRow key={`${item.needTitle}-${item.ship.sha}`} item={item} />
              ))
            )}
          </div>
        )}
      </DashboardWorkspaceSurface>
    </>
  );
}
