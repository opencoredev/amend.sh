import { X } from "@/lib/icons";
import type { RefObject } from "react";

import type { EditorPanel } from "./post-composer-model";

export function EditorToolPanel({
  codeLanguage,
  codeValue,
  linkText,
  linkUrl,
  onClose,
  onCodeLanguageChange,
  onCodeValueChange,
  onInsertCode,
  onInsertLink,
  onLinkTextChange,
  onLinkUrlChange,
  panel,
  panelRef,
}: {
  codeLanguage: string;
  codeValue: string;
  linkText: string;
  linkUrl: string;
  onClose: () => void;
  onCodeLanguageChange: (value: string) => void;
  onCodeValueChange: (value: string) => void;
  onInsertCode: () => void;
  onInsertLink: () => void;
  onLinkTextChange: (value: string) => void;
  onLinkUrlChange: (value: string) => void;
  panel: EditorPanel;
  panelRef: RefObject<HTMLDivElement | null>;
}) {
  if (!panel) return null;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-10 z-40 w-[min(26rem,calc(100vw-3rem))] overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-[0_18px_55px_rgb(0_0_0/0.5)] ring-1 ring-white/[0.07] animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {panel === "link" ? "Insert link" : "Insert code"}
        </p>
        <button
          type="button"
          aria-label="Close tool panel"
          className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 ease-linear hover:bg-white/[0.06] hover:text-foreground active:opacity-75"
          onClick={onClose}
        >
          <X className="size-4" />
        </button>
      </div>

      {panel === "link" ? (
        <div className="grid gap-2 p-3">
          <input
            className="h-9 rounded-lg bg-amend-inset px-3 text-sm text-foreground ring-1 ring-white/[0.055] placeholder:text-muted-foreground focus:outline-none focus:ring-white/[0.16]"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(event) => onLinkUrlChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onInsertLink();
            }}
          />
          <input
            className="h-9 rounded-lg bg-amend-inset px-3 text-sm text-foreground ring-1 ring-white/[0.055] placeholder:text-muted-foreground focus:outline-none focus:ring-white/[0.16]"
            placeholder="Optional label"
            value={linkText}
            onChange={(event) => onLinkTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onInsertLink();
            }}
          />
          <EditorToolActions primaryLabel="Add link" onCancel={onClose} onSubmit={onInsertLink} />
        </div>
      ) : (
        <div className="grid gap-2 p-3">
          <select
            className="h-9 rounded-lg bg-amend-inset px-3 text-sm text-foreground ring-1 ring-white/[0.055] focus:outline-none focus:ring-white/[0.16]"
            value={codeLanguage}
            onChange={(event) => onCodeLanguageChange(event.target.value)}
          >
            <option value="tsx">TypeScript</option>
            <option value="json">JSON</option>
            <option value="sh">Shell</option>
          </select>
          <textarea
            className="min-h-28 resize-none rounded-lg bg-amend-inset p-3 font-mono text-xs leading-5 text-foreground ring-1 ring-white/[0.055] placeholder:text-muted-foreground focus:outline-none focus:ring-white/[0.16]"
            placeholder={'const update = "shipped";'}
            value={codeValue}
            onChange={(event) => onCodeValueChange(event.target.value)}
          />
          <EditorToolActions primaryLabel="Add code" onCancel={onClose} onSubmit={onInsertCode} />
        </div>
      )}
    </div>
  );
}

function EditorToolActions({
  onCancel,
  onSubmit,
  primaryLabel,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  primaryLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button
        type="button"
        className="h-8 rounded-lg px-3 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.06] transition-colors duration-150 ease-linear hover:bg-white/[0.06] hover:text-foreground active:opacity-75"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        type="button"
        className="h-8 rounded-lg border border-foreground bg-foreground px-3.5 text-xs font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75"
        onClick={onSubmit}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
