import { cn } from "@amend/ui/lib/utils";
import { useEffect, useState } from "react";
import type { ComponentType, ReactNode, RefObject } from "react";

import {
  Bold,
  ChevronDown,
  Clock,
  Code2,
  FileText,
  Heading1,
  Heading2,
  type IconProps,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Type,
  Underline,
} from "@/lib/icons";

import { ChangelogTagInput } from "./changelog-tag-input";
import type { WorkspaceTag } from "./changelog-tags";

const CATEGORY_META: Record<string, { label: string; dot: string }> = {
  added: { label: "New", dot: "bg-emerald-400" },
  changed: { label: "Improved", dot: "bg-sky-400" },
  fixed: { label: "Fixed", dot: "bg-amber-400" },
  removed: { label: "Removed", dot: "bg-rose-400" },
};

const CATEGORY_ORDER = ["added", "changed", "fixed", "removed"] as const;

type ToolCommand = {
  command: string;
  icon: ComponentType<IconProps>;
  label: string;
  value?: string;
};

const TOOL_GROUPS: ToolCommand[][] = [
  [
    { command: "bold", icon: Bold, label: "Bold" },
    { command: "italic", icon: Italic, label: "Italic" },
    { command: "underline", icon: Underline, label: "Underline" },
    { command: "strikeThrough", icon: Strikethrough, label: "Strikethrough" },
  ],
  [
    { command: "formatBlock", value: "<h1>", icon: Heading1, label: "Heading 1" },
    { command: "formatBlock", value: "<h2>", icon: Heading2, label: "Heading 2" },
  ],
  [
    { command: "insertUnorderedList", icon: List, label: "Bullet list" },
    { command: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
    { command: "formatBlock", value: "<blockquote>", icon: Quote, label: "Quote" },
    { command: "formatBlock", value: "<pre>", icon: Code2, label: "Code block" },
  ],
];

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.08] hover:text-foreground active:opacity-75 [&_svg]:size-4"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function CategoryPicker({
  category,
  onCategoryChange,
}: {
  category: string;
  onCategoryChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = CATEGORY_META[category] ?? CATEGORY_META.added;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.06] py-1 pl-2.5 pr-2 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.05] transition-colors duration-150 ease-linear hover:text-foreground active:opacity-75"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn("size-1.5 rounded-full", meta.dot)} />
        {meta.label}
        <ChevronDown className="size-3 opacity-60" />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="t-pop is-open absolute left-0 top-9 z-20 w-40 rounded-xl border border-white/[0.08] bg-card p-1 shadow-[0_18px_60px_rgb(0_0_0/0.5)]">
            {CATEGORY_ORDER.map((value) => {
              const item = CATEGORY_META[value];
              return (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-foreground/[0.06]",
                    value === category ? "text-foreground" : "text-muted-foreground",
                  )}
                  onClick={() => {
                    onCategoryChange(value);
                    setOpen(false);
                  }}
                >
                  <span className={cn("size-1.5 rounded-full", item.dot)} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ChangelogEditorMain({
  availableTags,
  category,
  charCount,
  editorRef,
  isEmpty,
  onAddTag,
  onBodyChange,
  onCategoryChange,
  onCommand,
  onCreateTag,
  onRemoveTag,
  onTitleChange,
  readMinutes,
  tags,
  title,
  wordCount,
}: {
  availableTags: WorkspaceTag[];
  category: string;
  charCount: number;
  editorRef: RefObject<HTMLDivElement | null>;
  isEmpty: boolean;
  onAddTag: (tag: string) => void;
  onBodyChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCommand: (command: string, value?: string) => void;
  onCreateTag: (name: string, color: string) => void;
  onRemoveTag: (tag: string) => void;
  onTitleChange: (value: string) => void;
  readMinutes: number;
  tags: string[];
  title: string;
  wordCount: number;
}) {
  function insertLink() {
    const url = window.prompt("Link URL");
    if (!url) return;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    onCommand("createLink", href);
  }

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-transparent">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-white/[0.05] bg-[var(--workspace-surface-background)] px-3 py-1.5 md:px-5">
        {TOOL_GROUPS.map((group, index) => (
          <div key={group[0].label} className="flex items-center gap-0.5">
            {index > 0 ? <span className="mx-1 h-5 w-px bg-white/[0.07]" /> : null}
            {group.map((tool) => (
              <ToolbarButton
                key={tool.label}
                label={tool.label}
                onClick={() => onCommand(tool.command, tool.value)}
              >
                <tool.icon />
              </ToolbarButton>
            ))}
          </div>
        ))}
        <span className="mx-1 h-5 w-px bg-white/[0.07]" />
        <ToolbarButton label="Link" onClick={insertLink}>
          <Link2 />
        </ToolbarButton>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 pb-28 pt-7 md:px-8 md:pt-9">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryPicker category={category} onCategoryChange={onCategoryChange} />
          <ChangelogTagInput
            availableTags={availableTags}
            tags={tags}
            onAddTag={onAddTag}
            onCreateTag={onCreateTag}
            onRemoveTag={onRemoveTag}
          />
        </div>

        <textarea
          rows={1}
          className="mt-6 min-h-[2.75rem] w-full resize-none bg-transparent text-3xl font-bold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/70 md:text-[2.5rem]"
          value={title}
          placeholder="Enter a title"
          onChange={(event) => onTitleChange(event.target.value)}
          onInput={(event) => {
            const el = event.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
        />

        <div className="relative mt-4">
          <div
            ref={editorRef}
            aria-label="Changelog body"
            className="amend-composer-editor min-h-[18rem] text-[0.95rem] leading-7 text-foreground/90 outline-none"
            contentEditable
            role="textbox"
            spellCheck
            onInput={(event) => onBodyChange(event.currentTarget.innerHTML ?? "")}
          />
          {isEmpty ? (
            <p className="pointer-events-none absolute left-0 top-0 text-[0.95rem] leading-7 text-muted-foreground/70">
              Start writing…
            </p>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none sticky bottom-0 left-0 flex justify-start px-5 pb-4 md:px-8">
        <div className="pointer-events-auto inline-flex items-center gap-3 rounded-lg border border-white/[0.07] bg-card/90 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span className="inline-flex items-center gap-1.5">
            <Type className="size-3.5 opacity-70" />
            {charCount}
          </span>
          <span className="opacity-30">·</span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="size-3.5 opacity-70" />
            {wordCount}
          </span>
          <span className="opacity-30">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 opacity-70" />
            {readMinutes < 1 ? "< 1 min" : `${readMinutes} min`}
          </span>
        </div>
      </div>
    </main>
  );
}
