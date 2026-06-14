import { cn } from "@amend/ui/lib/utils";
import { ArrowLeft, Check, Mail, MoreHorizontal, Settings2 } from "@/lib/icons";
import { useEffect, useState } from "react";

const STATUS_OPTIONS = [
  ["draft", "Draft"],
  ["in_review", "In review"],
  ["scheduled", "Scheduled"],
  ["published", "Published"],
] as const;

const CATEGORY_OPTIONS = [
  ["added", "New"],
  ["changed", "Improved"],
  ["fixed", "Fixed"],
  ["removed", "Removed"],
] as const;

export function ChangelogEditorHeader({
  authorInitials,
  canSave,
  category,
  confirmClose,
  isDirty,
  isNew,
  onCancelClose,
  onCategoryChange,
  onDiscard,
  onRequestClose,
  onSendEmailChange,
  onShowPubliclyChange,
  onStatusChange,
  onVersionChange,
  saving,
  sendEmail,
  showPublicly,
  status,
  version,
}: {
  authorInitials: string;
  canSave: boolean;
  category: string;
  confirmClose: boolean;
  isDirty: boolean;
  isNew: boolean;
  onCancelClose: () => void;
  onCategoryChange: (value: string) => void;
  onDiscard: () => void;
  onRequestClose: () => void;
  onSendEmailChange: (value: boolean) => void;
  onShowPubliclyChange: (value: boolean) => void;
  onStatusChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  saving: boolean;
  sendEmail: boolean;
  showPublicly: boolean;
  status: string;
  version: string;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isPublished = status === "published";

  useEffect(() => {
    if (!settingsOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSettingsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.05] bg-background/80 px-3 backdrop-blur md:px-4">
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
        <button
          type="button"
          aria-pressed={isPublished}
          className="group flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors duration-150 ease-linear hover:bg-foreground/[0.05]"
          onClick={() => onStatusChange(isPublished ? "draft" : "published")}
        >
          <span
            className={cn(
              "text-xs font-semibold tabular-nums transition-colors",
              isPublished ? "text-emerald-400" : "text-muted-foreground",
            )}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
          <span
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors duration-200 ease-out",
              isPublished ? "bg-emerald-500/80" : "bg-foreground/[0.14]",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-background shadow-sm transition-transform duration-200 ease-out",
                isPublished ? "translate-x-[1.125rem]" : "translate-x-0.5",
              )}
            />
          </span>
        </button>

        <button
          type="submit"
          disabled={saving || !canSave}
          className="flex h-9 items-center gap-2 rounded-lg border border-foreground bg-foreground px-3.5 text-sm font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/85 active:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
          <span
            className={cn(
              "grid size-4 place-items-center rounded-full",
              isDirty ? "bg-amber-400/90" : "bg-emerald-500/90",
            )}
          >
            {isDirty ? null : <Check className="size-2.5 text-background" />}
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            aria-label="Changelog settings"
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
                  Publishing
                </div>
                <label className="grid gap-1.5 px-1 py-1.5">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Status
                  </span>
                  <select
                    className="h-9 rounded-lg border border-white/[0.08] bg-background px-2.5 text-sm text-foreground outline-none focus:border-foreground"
                    value={status}
                    onChange={(event) => onStatusChange(event.target.value)}
                  >
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
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

                <div className="mt-1.5 border-t border-white/[0.06] pt-1.5">
                  <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04]">
                    <span>Show on public portal</span>
                    <input
                      checked={showPublicly}
                      className="size-4 accent-foreground"
                      type="checkbox"
                      onChange={(event) => onShowPubliclyChange(event.target.checked)}
                    />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04]">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="size-3.5" />
                      Email subscribers on publish
                    </span>
                    <input
                      checked={sendEmail}
                      className="size-4 accent-foreground"
                      type="checkbox"
                      onChange={(event) => onSendEmailChange(event.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {confirmClose ? (
        <div className="absolute left-1/2 top-14 z-30 mt-2 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-white/[0.08] bg-card px-3 py-2 shadow-[0_18px_60px_rgb(0_0_0/0.5)]">
          <p className="text-sm text-muted-foreground">Discard unsaved changes?</p>
          <button
            type="button"
            className="h-8 rounded-lg border border-white/[0.08] bg-background px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground active:opacity-75"
            onClick={onCancelClose}
          >
            Keep editing
          </button>
          <button
            type="button"
            className="h-8 rounded-lg border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-colors hover:bg-foreground/85 active:opacity-75"
            onClick={onDiscard}
          >
            Discard
          </button>
        </div>
      ) : null}
    </header>
  );
}
