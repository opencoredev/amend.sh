/**
 * PHASE 3 — Draft-review lane (the trust surface).
 *
 * The agent writes changelog entries and notify-the-requesters messages, then
 * holds them here. Nothing sends until you approve. Every draft is editable in
 * place (Edit + approve), and the pre-send hold is stated plainly up top.
 */
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  ActionButton,
  Avatar,
  ChannelGlyph,
  EmptyState,
  ErrorState,
  SectionLabel,
  SkeletonBar,
  channelMeta,
} from "@/components/amend-agent-shared";
import { PageHeader, PageScroll } from "@/components/amend-agent-chrome";
import type { DraftProposal } from "@/lib/amend-contract";
import { approveDraft, rejectDraft, updateDraftText, usePendingDrafts } from "@/lib/mock-amend";
import { Check, Inbox, Megaphone, Newspaper, ShieldCheck, SquarePen, X } from "@/lib/icons";
import { toast } from "@/lib/toast";

const kindMeta = {
  changelog: { label: "Changelog entry", Icon: Newspaper, verb: "added to your changelog" },
  notify: { label: "Notify requesters", Icon: Megaphone, verb: "sent to the people who asked" },
} as const;

function HoldNote() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-amend-warm/[0.05] px-4 py-3 ring-1 ring-amend-warm/15 ring-inset">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amend-warm" />
      <p className="text-xs leading-relaxed text-foreground/80">
        Nothing here has gone out. The agent writes the drafts;{" "}
        <span className="font-semibold text-foreground">nothing sends until you approve</span>. Edit
        anything first — your wording wins.
      </p>
    </div>
  );
}

function RecipientChips({ draft }: { draft: DraftProposal }) {
  if (!draft.recipients?.length) return null;
  return (
    <div className="mb-3 rounded-xl bg-white/[0.015] p-3 ring-1 ring-white/[0.05] ring-inset">
      <p className="mb-2 text-[0.7rem] text-muted-foreground">
        Will reach{" "}
        <span className="font-mono font-semibold tabular-nums text-foreground">
          {draft.recipients.length}
        </span>{" "}
        {draft.recipients.length === 1 ? "person" : "people"} who asked
      </p>
      <div className="flex flex-wrap gap-1.5">
        {draft.recipients.map((r) => (
          <span
            key={`${r.handle}-${r.channel}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] py-1 pl-1 pr-2.5 ring-1 ring-white/[0.06] ring-inset"
            title={`${r.handle} · ${channelMeta[r.channel].label}`}
          >
            <Avatar name={r.handle} size="sm" />
            <span className="text-[0.72rem] text-foreground/80">{r.handle}</span>
            <ChannelGlyph channel={r.channel} className="size-3 text-muted-foreground/70" />
          </span>
        ))}
      </div>
    </div>
  );
}

function DraftCard({ draft }: { draft: DraftProposal }) {
  const { label, Icon, verb } = kindMeta[draft.kind];
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft.draftText);

  function approve(value?: string) {
    if (value !== undefined) updateDraftText(draft.id, value);
    approveDraft(draft.id);
    toast.success({
      title: "Approved",
      description: `Your ${draft.kind === "notify" ? "message" : "entry"} will be ${verb}.`,
    });
  }

  function reject() {
    rejectDraft(draft.id);
    toast.info({ title: "Draft rejected", description: "The agent won't send this one." });
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] ring-inset">
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.06] ring-inset [&_svg]:size-4">
            <Icon />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground">{label}</div>
            <Link
              to="/dashboard/$view"
              params={{ view: "board" }}
              className="truncate text-[0.72rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              for “{draft.needTitle}”
            </Link>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amend-warm/12 px-2.5 py-1 text-[0.66rem] font-semibold text-amend-warm ring-1 ring-amend-warm/20 ring-inset">
          Held — not sent
        </span>
      </header>

      <div className="p-4">
        <RecipientChips draft={draft} />

        {editing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            autoFocus
            className="w-full resize-y rounded-xl bg-[#151518] p-3 text-[0.83rem] leading-relaxed text-foreground ring-1 ring-white/[0.09] ring-inset outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        ) : (
          <p className="whitespace-pre-wrap rounded-xl bg-white/[0.015] p-3 text-[0.83rem] leading-relaxed text-foreground/85 ring-1 ring-white/[0.04] ring-inset">
            {draft.draftText}
          </p>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-white/[0.05] bg-white/[0.01] px-4 py-3">
        {editing ? (
          <>
            <ActionButton variant="success" size="sm" onClick={() => approve(text)}>
              <Check />
              Save &amp; approve
            </ActionButton>
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setText(draft.draftText);
                setEditing(false);
              }}
            >
              Cancel
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton variant="success" size="sm" onClick={() => approve()}>
              <Check />
              Approve
            </ActionButton>
            <ActionButton variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <SquarePen />
              Edit
            </ActionButton>
            <ActionButton variant="danger" size="sm" className="ml-auto" onClick={reject}>
              <X />
              Reject
            </ActionButton>
          </>
        )}
      </footer>
    </article>
  );
}

function DraftsSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBar className="h-12 rounded-xl" />
      {Array.from({ length: 2 }).map((_, i) => (
        <SkeletonBar key={i} className="h-56 rounded-2xl" />
      ))}
    </div>
  );
}

export function AmendDraftsScreen() {
  const { data, isLoading, isError } = usePendingDrafts();
  const drafts = data ?? [];

  return (
    <>
      <PageHeader
        icon={Inbox}
        title="Drafts"
        subtitle="The agent's proposed updates — review before anything sends"
      />
      <PageScroll routeKey="drafts" className="max-w-3xl space-y-4">
        {isError ? (
          <ErrorState />
        ) : isLoading ? (
          <DraftsSkeleton />
        ) : drafts.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Nothing waiting on you"
            hint="When the agent ships a need or has something worth telling requesters, the draft lands here first — held until you approve."
          />
        ) : (
          <>
            <HoldNote />
            <SectionLabel count={drafts.length}>Pending your review</SectionLabel>
            <div className="space-y-3">
              {drafts.map((draft) => (
                <DraftCard key={draft.id} draft={draft} />
              ))}
            </div>
          </>
        )}
      </PageScroll>
    </>
  );
}
