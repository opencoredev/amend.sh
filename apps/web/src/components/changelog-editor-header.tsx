import { cn } from "@amend/ui/lib/utils";
import { ArrowLeft, Check, Loader2, Megaphone, MoreHorizontal, Settings2 } from "@/lib/icons";
import { useEffect, useState } from "react";

import type { AutoSaveStatus } from "@/components/changelog-editor-types";

const CATEGORY_OPTIONS = [
  ["added", "New"],
  ["changed", "Improved"],
  ["fixed", "Fixed"],
  ["removed", "Removed"],
  ["security", "Security"],
] as const;

/**
 * Calm, always-present save status — the editor auto-saves, so this reassures
 * rather than interrupts: "Saving…" while a write is pending, "Saved · 2m ago"
 * at rest, a one-tap retry on failure, and a nudge when a title is still missing.
 */
function SaveIndicator({
  autoSaveStatus,
  hasUnsavedChanges,
  lastSavedLabel,
  needsTitle,
  onRetrySave,
}: {
  autoSaveStatus: AutoSaveStatus;
  hasUnsavedChanges: boolean;
  lastSavedLabel: string | null;
  needsTitle: boolean;
  onRetrySave: () => void;
}) {
  if (needsTitle) {
    return (
      <span className="hidden items-center gap-1.5 pr-1 text-xs font-medium text-amber-400/90 sm:flex">
        Add a title to save
      </span>
    );
  }

  if (autoSaveStatus === "error") {
    return (
      <span className="flex items-center gap-2 pr-1 text-xs font-medium">
        <span className="text-amber-400">Couldn’t save</span>
        <button
          type="button"
          className="rounded-md px-1.5 py-0.5 font-semibold text-foreground underline-offset-2 transition-colors hover:underline active:opacity-75"
          onClick={onRetrySave}
        >
          Retry
        </button>
      </span>
    );
  }

  if (autoSaveStatus === "saving" || hasUnsavedChanges) {
    return (
      <span
        aria-live="polite"
        className="hidden items-center gap-1.5 pr-1 text-xs font-medium text-muted-foreground sm:flex"
      >
        <Loader2 className="size-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (autoSaveStatus === "saved") {
    return (
      <span
        aria-live="polite"
        className="hidden items-center gap-1.5 pr-1 text-xs font-medium text-muted-foreground sm:flex"
      >
        <Check className="size-3.5 text-emerald-400" />
        Saved
        {lastSavedLabel ? (
          <span className="text-muted-foreground/55">· {lastSavedLabel}</span>
        ) : null}
      </span>
    );
  }

  return null;
}

/** Current publish state at a glance, beside the Publish action. */
function StatusPill({ status }: { status: string }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20 ring-inset">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Published
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/12 px-2.5 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-500/20 ring-inset">
        <span className="size-1.5 rounded-full bg-sky-400" />
        Scheduled
      </span>
    );
  }
  return null;
}

export function ChangelogEditorHeader({
  authorInitials,
  autoSaveStatus,
  category,
  hasUnsavedChanges,
  isNew,
  lastSavedLabel,
  needsTitle,
  onCategoryChange,
  onOpenPublish,
  onRequestClose,
  onRetrySave,
  onVersionChange,
  status,
  version,
}: {
  authorInitials: string;
  autoSaveStatus: AutoSaveStatus;
  category: string;
  hasUnsavedChanges: boolean;
  isNew: boolean;
  lastSavedLabel: string | null;
  needsTitle: boolean;
  onCategoryChange: (value: string) => void;
  onOpenPublish: () => void;
  onRequestClose: () => void;
  onRetrySave: () => void;
  onVersionChange: (value: string) => void;
  status: string;
  version: string;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!settingsOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSettingsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.05] bg-[var(--workspace-surface-background)] px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Back to changelog"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75"
          onClick={onRequestClose}
        >
          <ArrowLeft className="size-4" />
        </button>
        <span className="grid size-7 place-items-center rounded-full bg-foreground/[0.08] text-[0.65rem] font-semibold uppercase text-muted-foreground ring-1 ring-white/[0.06]">
          {authorInitials}
        </span>
        <span className="hidden truncate text-xs font-medium text-muted-foreground sm:block">
          {isNew ? "New changelog" : "Editing changelog"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <SaveIndicator
          autoSaveStatus={autoSaveStatus}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSavedLabel={lastSavedLabel}
          needsTitle={needsTitle}
          onRetrySave={onRetrySave}
        />

        <StatusPill status={status} />

        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-foreground bg-foreground px-3.5 text-sm font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/85 active:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onOpenPublish}
        >
          <Megaphone className="size-4" />
          {status === "published" ? "Update" : "Publish"}
        </button>

        <div className="relative">
          <button
            type="button"
            aria-label="Changelog details"
            aria-expanded={settingsOpen}
            className={cn(
              "grid size-9 place-items-center rounded-lg border text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground active:opacity-75",
              settingsOpen
                ? "border-white/[0.12] bg-foreground/[0.06] text-foreground"
                : "border-white/[0.06] bg-transparent hover:bg-foreground/[0.05]",
            )}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <MoreHorizontal className="size-4" />
          </button>

          {settingsOpen ? (
            <>
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setSettingsOpen(false)}
              />
              <div className="t-pop is-open absolute right-0 top-11 z-20 w-72 rounded-xl border border-white/[0.08] bg-card p-3 shadow-[0_22px_70px_rgb(0_0_0/0.5)]">
                <div className="flex items-center gap-2 px-1 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Settings2 className="size-3.5" />
                  Details
                </div>
                <label className="grid gap-1.5 px-1 py-1.5">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Category
                  </span>
                  <select
                    className="h-9 rounded-lg border border-white/[0.08] bg-background px-2.5 text-sm text-foreground outline-none focus:border-foreground"
                    value={category}
                    onChange={(event) => onCategoryChange(event.target.value)}
                  >
                    {CATEGORY_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 px-1 py-1.5">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Version
                  </span>
                  <input
                    className="h-9 rounded-lg border border-white/[0.08] bg-background px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
                    value={version}
                    placeholder="Optional, e.g. 2.4.0"
                    onChange={(event) => onVersionChange(event.target.value)}
                  />
                </label>
                <p className="px-1 pt-1.5 text-xs text-muted-foreground/70">
                  Cover image, summary, scheduling, and email live in Publish.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
