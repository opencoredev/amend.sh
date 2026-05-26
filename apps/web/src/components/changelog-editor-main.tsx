import { Input } from "@amend/ui/components/input";
import { ClipboardList, Globe } from "lucide-react";
import type { RefObject } from "react";

import { EditorButton } from "@/components/dashboard-detail-shared";

export function ChangelogEditorMain({
  body,
  editorRef,
  onBodyChange,
  onEditorCommand,
  onSummaryChange,
  onTitleChange,
  summary,
  title,
}: {
  body: string;
  editorRef: RefObject<HTMLDivElement | null>;
  onBodyChange: (value: string) => void;
  onEditorCommand: (command: string) => void;
  onSummaryChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  summary: string;
  title: string;
}) {
  return (
    <main className="min-w-0 border-b border-border p-4 md:p-6 lg:border-b-0 lg:border-r">
      <div className="mx-auto grid max-w-5xl gap-6">
        <button
          type="button"
          className="grid min-h-36 place-items-center border border-border bg-card/60 text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground hover:bg-muted/20 hover:text-foreground active:opacity-75"
        >
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <Globe className="size-4" />
            Add featured image
          </span>
        </button>

        <textarea
          className="min-h-20 w-full resize-none bg-transparent text-balance text-3xl font-semibold leading-tight outline-none placeholder:text-muted-foreground md:text-4xl"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Changelog title"
        />

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Summary
          </span>
          <Input
            className="h-11 border-border bg-background text-sm"
            value={summary}
            onChange={(event) => onSummaryChange(event.target.value)}
            placeholder="Short user-facing summary"
          />
        </label>

        <div className="border border-border bg-background">
          <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
            <EditorButton label="Bold" onClick={() => onEditorCommand("bold")}>
              <strong>B</strong>
            </EditorButton>
            <EditorButton label="Italic" onClick={() => onEditorCommand("italic")}>
              <em>I</em>
            </EditorButton>
            <EditorButton
              label="Bullet list"
              onClick={() => onEditorCommand("insertUnorderedList")}
            >
              <ClipboardList className="size-3.5" />
            </EditorButton>
          </div>
          <div className="relative min-h-[30rem] p-4 md:p-6">
            <div
              ref={editorRef}
              aria-label="Changelog body"
              className="amend-composer-editor min-h-[27rem] text-base leading-8 text-foreground outline-none"
              contentEditable
              role="textbox"
              spellCheck
              onInput={(event) => onBodyChange(event.currentTarget.innerText ?? "")}
            />
            {!body.trim() ? (
              <p className="pointer-events-none absolute left-4 top-4 text-sm text-muted-foreground">
                Write the changelog body...
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
