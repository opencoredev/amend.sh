import { cn } from "@amend/ui/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { Check, Plus, Search, X } from "@/lib/icons";
import {
  STARTER_TAGS,
  type TagColor,
  type WorkspaceTag,
  tagColorByKey,
  tagColorByName,
  tagColorKeyByName,
} from "./changelog-tags";
import { useDisclosureTransition } from "./use-disclosure-transition";

type Row = { kind: "tag"; name: string; selected: boolean } | { kind: "create"; name: string };

export function ChangelogTagInput({
  availableTags,
  onAddTag,
  onCreateTag,
  onRemoveTag,
  tags,
}: {
  /** Persisted workspace tags (with colors) the user can reuse. */
  availableTags: WorkspaceTag[];
  onAddTag: (name: string) => void;
  /** Persist a brand-new tag so it's reusable next time. */
  onCreateTag: (name: string, color: string) => void;
  onRemoveTag: (name: string) => void;
  /** Tag names selected on this entry. */
  tags: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const transition = useDisclosureTransition(open, "top-left");

  const trimmed = query.trim();
  const selected = useMemo(() => new Set(tags.map((tag) => tag.toLowerCase())), [tags]);

  const colorKeyByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const tag of availableTags) map.set(tag.name.toLowerCase(), tag.color);
    return map;
  }, [availableTags]);

  function colorFor(name: string): TagColor {
    const key = colorKeyByName.get(name.toLowerCase());
    return key ? tagColorByKey(key) : tagColorByName(name);
  }

  // Everything that can be toggled: the workspace tags (or starters on a fresh
  // workspace) plus anything already on this entry, so a selected tag can always
  // be switched off from the same list it was switched on.
  const allNames = useMemo(() => {
    const base =
      availableTags.length > 0 ? availableTags.map((tag) => tag.name) : [...STARTER_TAGS];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const name of [...base, ...tags]) {
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(name);
    }
    return out;
  }, [availableTags, tags]);

  const rows = useMemo<Row[]>(() => {
    const needle = trimmed.toLowerCase();
    const list: Row[] = allNames
      .filter((name) => !needle || name.toLowerCase().includes(needle))
      .map((name) => ({ kind: "tag", name, selected: selected.has(name.toLowerCase()) }));
    const exact = allNames.some((name) => name.toLowerCase() === needle);
    if (trimmed && !exact) list.push({ kind: "create", name: trimmed });
    return list;
  }, [allNames, trimmed, selected]);

  useEffect(() => {
    setActiveIndex((index) => (rows.length === 0 ? 0 : Math.min(index, rows.length - 1)));
  }, [rows.length]);

  function activate(row: Row) {
    if (row.kind === "create") {
      onCreateTag(row.name, tagColorKeyByName(row.name));
      onAddTag(row.name);
    } else if (row.selected) {
      onRemoveTag(row.name);
    } else {
      if (!colorKeyByName.has(row.name.toLowerCase())) {
        onCreateTag(row.name, tagColorKeyByName(row.name));
      }
      onAddTag(row.name);
    }
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.focus();
  }

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const row = rows[activeIndex];
      if (row) activate(row);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (rows.length ? (index + 1) % rows.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (rows.length ? (index - 1 + rows.length) % rows.length : 0));
      return;
    }
    if (event.key === "Backspace" && !query && tags.length > 0) {
      event.preventDefault();
      onRemoveTag(tags[tags.length - 1]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  return (
    <>
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "group inline-flex animate-in items-center gap-1.5 rounded-full py-1 pl-2 pr-1.5 text-xs font-medium ring-1 duration-150 fade-in-0 zoom-in-95",
            colorFor(tag).chip,
          )}
        >
          <span className={cn("size-1.5 rounded-full", colorFor(tag).dot)} />
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            className="grid size-4 place-items-center rounded-full opacity-60 transition-[opacity,background-color] duration-150 ease-linear hover:bg-white/10 hover:opacity-100 active:scale-90"
            onClick={() => onRemoveTag(tag)}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground ring-1 ring-white/[0.06] transition-colors duration-150 ease-linear hover:bg-foreground/[0.05] hover:text-foreground active:opacity-75",
            open && "bg-foreground/[0.06] text-foreground",
          )}
          onClick={() => setOpen((value) => !value)}
        >
          <Plus className="size-3.5" />
          Tag
        </button>

        {transition.mounted ? (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-30 cursor-default"
              onClick={close}
            />
            <div
              className={cn(
                "absolute left-0 top-[calc(100%+0.5rem)] z-40 w-60 overflow-hidden rounded-xl bg-popover shadow-[0_18px_60px_rgb(0_0_0/0.55)] ring-1 ring-white/[0.06]",
                transition.className,
              )}
              data-origin={transition["data-origin"]}
            >
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-3">
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  autoFocus
                  value={query}
                  className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="Filter or create…"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onKeyDown}
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {rows.length === 0 ? (
                  <p className="px-2.5 py-2 text-sm text-muted-foreground">No tags yet</p>
                ) : (
                  rows.map((row, index) => (
                    <button
                      key={`${row.kind}-${row.name}`}
                      type="button"
                      className={cn(
                        "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium transition-colors duration-150 ease-linear active:opacity-75",
                        index === activeIndex
                          ? "bg-foreground/[0.07] text-foreground"
                          : "text-muted-foreground",
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => activate(row)}
                    >
                      {row.kind === "create" ? (
                        <>
                          <Plus className="size-3.5 shrink-0 opacity-70" />
                          <span className="min-w-0 flex-1 truncate">Create “{row.name}”</span>
                        </>
                      ) : (
                        <>
                          <span
                            className={cn("size-1.5 shrink-0 rounded-full", colorFor(row.name).dot)}
                          />
                          <span className="min-w-0 flex-1 truncate">{row.name}</span>
                          {row.selected ? (
                            <Check className="size-4 shrink-0 text-foreground" />
                          ) : null}
                        </>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
