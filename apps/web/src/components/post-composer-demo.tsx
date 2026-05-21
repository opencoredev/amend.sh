import { Button } from "@amend/ui/components/button";
import { cn } from "@amend/ui/lib/utils";
import {
  Bold,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileImage,
  Italic,
  Lightbulb,
  Link2,
  List,
  Paperclip,
  Plus,
  Radio,
  Smile,
  Strikethrough,
  Tag,
  Underline,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

type ComposerPanel = "board" | "status" | "tag" | "assignee" | "date" | null;
type EditorPanel = "link" | "code" | null;

const boardItems = ["Feature Request", "Bug Report", "Changelog", "Customer Feedback"] as const;
export type BoardItem = (typeof boardItems)[number];
const statusItems = [
  ["In Review", "bg-foreground"],
  ["Planned", "bg-muted-foreground"],
  ["In Progress", "bg-foreground/70"],
  ["Completed", "bg-foreground"],
  ["Rejected", "bg-muted-foreground"],
] as const;
export type StatusItem = (typeof statusItems)[number][0];
const tagItems = [
  ["High Priority", "bg-foreground"],
  ["Low Priority", "bg-muted-foreground"],
] as const;
type TagItem = (typeof tagItems)[number][0];
export type ComposerSubmitPayload = {
  assignee: string | null;
  board: BoardItem;
  createMore: boolean;
  description: string;
  dueDate: string | null;
  status: StatusItem;
  tag: TagItem | null;
  title: string;
};
const dateRows = [
  ["26", "27", "28", "29", "30", "1", "2"],
  ["3", "4", "5", "6", "7", "8", "9"],
  ["10", "11", "12", "13", "14", "15", "16"],
  ["17", "18", "19", "20", "21", "22", "23"],
  ["24", "25", "26", "27", "28", "29", "30"],
  ["31", "1", "2", "3", "4", "5", "6"],
] as const;

export default function PostComposerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <main className="dark relative min-h-svh overflow-hidden bg-background font-mono text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "4.5rem 4.5rem",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-foreground/5 blur-3xl"
      />

      <div
        className={cn(
          "relative z-10 grid min-h-svh place-items-center px-6 transition-[filter,opacity,transform] duration-500",
          open && "scale-[0.985] opacity-40 blur-sm",
        )}
      >
        <Button
          type="button"
          size="lg"
          className="h-12 border border-foreground bg-foreground px-6 text-sm font-semibold text-background hover:bg-background hover:text-foreground"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" />
          Create new post
        </Button>
      </div>

      <ComposerModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}

export function ComposerModal({
  initialBoard = "Feature Request",
  initialStatus = "In Review",
  onClose,
  onSubmit,
  open,
}: {
  initialBoard?: BoardItem;
  initialStatus?: StatusItem;
  onClose: () => void;
  onSubmit?: (payload: ComposerSubmitPayload) => Promise<void> | void;
  open: boolean;
}) {
  const [panel, setPanel] = useState<ComposerPanel>(null);
  const [board, setBoard] = useState<BoardItem>(initialBoard);
  const [status, setStatus] = useState<StatusItem>(initialStatus);
  const [tag, setTag] = useState<TagItem | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectionTools, setSelectionTools] = useState(false);
  const [editorPanel, setEditorPanel] = useState<EditorPanel>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("tsx");
  const [codeValue, setCodeValue] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const toolPanelRef = useRef<HTMLDivElement | null>(null);
  const isDirty = title.trim().length > 0 || descriptionText.trim().length > 0;

  function resetForm() {
    setTitle("");
    setDescriptionText("");
    setBoard(initialBoard);
    setStatus(initialStatus);
    setTitleError(false);
    setConfirmClose(false);
    setSubmitError("");
    setPanel(null);
    setSelectionTools(false);
    setEditorPanel(null);
    setLinkUrl("");
    setLinkText("");
    setCodeValue("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  }

  function closeComposer() {
    resetForm();
    onClose();
  }

  function requestClose() {
    if (isDirty) {
      setConfirmClose(true);
      setPanel(null);
      return;
    }
    closeComposer();
  }

  function applyEditorCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setDescriptionText(editorRef.current?.innerText ?? "");
  }

  function insertEditorHtml(html: string) {
    restoreEditorSelection();
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    setDescriptionText(editorRef.current?.innerText ?? "");
  }

  function insertEditorText(value: string) {
    applyEditorCommand("insertText", value);
  }

  function hasEditorSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return false;
    const node = selection.anchorNode;
    return !!node && !!editorRef.current?.contains(node);
  }

  function saveEditorSelection() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !hasEditorSelection()) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }

  function restoreEditorSelection() {
    const range = savedRangeRef.current;
    if (!range) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function syncSelectionToolbar() {
    window.setTimeout(() => setSelectionTools(hasEditorSelection()), 0);
  }

  function toggleMetadataPanel(nextPanel: Exclude<ComposerPanel, null>) {
    setEditorPanel(null);
    setSelectionTools(false);
    setPanel(panel === nextPanel ? null : nextPanel);
  }

  function openEditorPanel(nextPanel: EditorPanel) {
    const selectedText = window.getSelection()?.toString() ?? "";
    if (hasEditorSelection()) saveEditorSelection();
    if (nextPanel === "link" && selectedText.trim() && !linkText.trim()) {
      setLinkText(selectedText.trim());
    }
    setPanel(null);
    setSelectionTools(false);
    setEditorPanel(editorPanel === nextPanel ? null : nextPanel);
  }

  function insertLink() {
    const url = linkUrl.trim();
    if (!url) return;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const text = linkText.trim() || url;

    insertEditorHtml(
      `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(text)}</a>`,
    );

    setLinkUrl("");
    setLinkText("");
    savedRangeRef.current = null;
    setEditorPanel(null);
  }

  function insertCodeBlock() {
    const code = codeValue.trimEnd();
    if (!code.trim()) return;
    insertEditorHtml(
      `<pre class="amend-code-block" data-language="${escapeHtml(codeLanguage)}"><code>${highlightCode(code, codeLanguage)}</code></pre><p><br></p>`,
    );
    setCodeValue("");
    savedRangeRef.current = null;
    setEditorPanel(null);
  }

  async function submitPost() {
    const titleText = title.trim();
    if (!titleText) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setTitleError(false);
    setSubmitError("");
    setPanel(null);
    setEditorPanel(null);
    setSelectionTools(false);

    try {
      await onSubmit?.({
        assignee,
        board,
        createMore,
        description: descriptionText.trim(),
        dueDate,
        status,
        tag,
        title: titleText,
      });
      if (createMore) {
        resetForm();
        window.setTimeout(() => titleRef.current?.focus(), 30);
        return;
      }
      closeComposer();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save this item.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!open) {
      setPanel(null);
      setSelectionTools(false);
      setConfirmClose(false);
      setEditorPanel(null);
      return;
    }

    const focusTimer = window.setTimeout(() => titleRef.current?.focus(), 80);
    setBoard(initialBoard);
    setStatus(initialStatus);

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void submitPost();
        return;
      }

      if (event.key !== "Escape") return;
      if (confirmClose) {
        setConfirmClose(false);
        return;
      }
      if (editorPanel) {
        setEditorPanel(null);
        return;
      }
      if (panel) {
        setPanel(null);
        return;
      }
      requestClose();
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [
    assignee,
    board,
    confirmClose,
    createMore,
    descriptionText,
    dueDate,
    editorPanel,
    isDirty,
    initialBoard,
    initialStatus,
    onSubmit,
    open,
    panel,
    status,
    submitting,
    tag,
    title,
  ]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/72 p-4 backdrop-blur-[3px] animate-in fade-in-0 duration-300"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Create post"
        className="relative grid h-[min(68vh,30rem)] w-full max-w-[56rem] grid-rows-[auto_minmax(0,1fr)_auto] overflow-visible border border-border bg-card text-card-foreground shadow-[0_22px_90px_rgb(0_0_0/0.55)] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerDownCapture={(event) => {
          if (panel && !panelRef.current?.contains(event.target as Node)) {
            setPanel(null);
          }
          if (editorPanel && !toolPanelRef.current?.contains(event.target as Node)) {
            setEditorPanel(null);
          }
        }}
      >
        <header className="relative z-20 flex items-center justify-between gap-3 px-4 pt-4">
          <div className="relative flex min-w-0 items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center border border-border bg-muted text-xs font-semibold text-foreground">
              L
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            <div
              className="relative"
              ref={panel === "board" ? panelRef : null}
              data-composer-panel-root
            >
              <button
                type="button"
                className={cn(
                  "flex h-8 items-center gap-2 border border-border bg-muted px-3 text-xs font-semibold text-muted-foreground transition-[background-color,color,border-color,scale]",
                  panel === "board" && "border-foreground bg-foreground text-background",
                )}
                onClick={() => toggleMetadataPanel("board")}
              >
                <Lightbulb className="size-4" />
                {board}
              </button>
              {panel === "board" ? (
                <BoardPopover
                  selected={board}
                  onSelect={(item) => {
                    setBoard(item);
                    setPanel(null);
                  }}
                />
              ) : null}
            </div>
          </div>

          <button
            type="button"
            aria-label="Close composer"
            className="grid size-8 place-items-center text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            onClick={requestClose}
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="relative min-h-0 px-5 pb-2 pt-5">
          <input
            ref={titleRef}
            aria-label="Post title"
            aria-invalid={titleError}
            className={cn(
              "h-9 w-full bg-transparent text-xl font-semibold tracking-normal text-foreground placeholder:text-muted-foreground focus:outline-none",
              titleError && "placeholder:text-destructive",
            )}
            placeholder="Title of your post"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (event.target.value.trim()) setTitleError(false);
            }}
          />
          {titleError ? (
            <p className="mt-1 text-xs font-semibold text-destructive">Title is required.</p>
          ) : null}

          <div className="relative mt-4">
            <SelectionToolbar
              visible={selectionTools}
              onCode={() => openEditorPanel("code")}
              onLink={() => openEditorPanel("link")}
            />
            <EditorToolPanel
              codeLanguage={codeLanguage}
              codeValue={codeValue}
              linkText={linkText}
              linkUrl={linkUrl}
              onCodeLanguageChange={setCodeLanguage}
              onCodeValueChange={setCodeValue}
              onInsertCode={insertCodeBlock}
              onInsertLink={insertLink}
              onLinkTextChange={setLinkText}
              onLinkUrlChange={setLinkUrl}
              onClose={() => setEditorPanel(null)}
              panel={editorPanel}
              panelRef={toolPanelRef}
            />
            <div
              ref={editorRef}
              aria-label="Post description"
              className="amend-composer-editor min-h-24 w-full bg-transparent text-sm leading-6 text-foreground focus:outline-none"
              contentEditable
              role="textbox"
              spellCheck
              onFocus={syncSelectionToolbar}
              onBlur={() => window.setTimeout(() => setSelectionTools(false), 140)}
              onKeyUp={syncSelectionToolbar}
              onMouseUp={syncSelectionToolbar}
              onInput={(event) => setDescriptionText(event.currentTarget.innerText ?? "")}
              onKeyDown={(event) => {
                if (!event.metaKey && !event.ctrlKey) return;
                const key = event.key.toLowerCase();
                if (key === "b") {
                  event.preventDefault();
                  applyEditorCommand("bold");
                }
                if (key === "i") {
                  event.preventDefault();
                  applyEditorCommand("italic");
                }
                if (key === "u") {
                  event.preventDefault();
                  applyEditorCommand("underline");
                }
                if (key === "k") {
                  event.preventDefault();
                  openEditorPanel("link");
                }
              }}
            />
            {!descriptionText ? (
              <p className="pointer-events-none absolute left-0 top-0 text-sm leading-6 text-muted-foreground">
                Post description...
              </p>
            ) : null}
            {submitError ? (
              <p className="mt-2 text-xs font-semibold leading-5 text-foreground">{submitError}</p>
            ) : null}
          </div>

          <div className="absolute bottom-3 left-4 flex items-center gap-0.5">
            <ToolbarButton label="Insert image" onClick={() => insertEditorText("[image]")}>
              <FileImage />
            </ToolbarButton>
            <ToolbarButton label="Bold" onClick={() => applyEditorCommand("bold")}>
              <Bold />
            </ToolbarButton>
            <ToolbarButton label="Italic" onClick={() => applyEditorCommand("italic")}>
              <Italic />
            </ToolbarButton>
            <ToolbarButton label="List" onClick={() => applyEditorCommand("insertUnorderedList")}>
              <List />
            </ToolbarButton>
            <ToolbarButton label="Code block" onClick={() => openEditorPanel("code")}>
              <Code2 />
            </ToolbarButton>
            <ToolbarButton label="Link" onClick={() => openEditorPanel("link")}>
              <Link2 />
            </ToolbarButton>
            <ToolbarButton label="Insert emoji" onClick={() => insertEditorText("🙂")}>
              <Smile />
            </ToolbarButton>
            <ToolbarButton label="Attach file" onClick={() => insertEditorText("[attachment]")}>
              <Paperclip />
            </ToolbarButton>
          </div>
        </div>

        <footer className="relative z-20 grid min-w-0 gap-3 border-t border-border px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="grid min-w-0 grid-cols-[minmax(8.5rem,1fr)_repeat(3,2.25rem)] gap-2 sm:flex sm:flex-wrap">
            <FooterControl
              active={panel === "status"}
              label={status}
              onClick={() => toggleMetadataPanel("status")}
              popover={
                panel === "status" ? (
                  <StatusPopover
                    selected={status}
                    onSelect={(item) => {
                      setStatus(item);
                      setPanel(null);
                    }}
                  />
                ) : null
              }
              panelRef={panel === "status" ? panelRef : undefined}
            >
              <Radio className="size-4" />
            </FooterControl>
            <IconControl
              active={panel === "tag"}
              label={tag ?? "Tags"}
              onClick={() => toggleMetadataPanel("tag")}
              popover={
                panel === "tag" ? (
                  <TagPopover
                    selected={tag}
                    onSelect={(item) => {
                      setTag(item);
                      setPanel(null);
                    }}
                  />
                ) : null
              }
              panelRef={panel === "tag" ? panelRef : undefined}
            >
              <Tag />
            </IconControl>
            <IconControl
              active={panel === "assignee"}
              label={assignee ?? "Assignee"}
              onClick={() => toggleMetadataPanel("assignee")}
              popover={
                panel === "assignee" ? (
                  <AssigneePopover
                    selected={assignee}
                    onSelect={(item) => {
                      setAssignee(item);
                      setPanel(null);
                    }}
                  />
                ) : null
              }
              panelRef={panel === "assignee" ? panelRef : undefined}
            >
              <UserRound />
            </IconControl>
            <IconControl
              active={panel === "date"}
              label={dueDate ?? "Due date"}
              onClick={() => toggleMetadataPanel("date")}
              popover={
                panel === "date" ? (
                  <DatePopover
                    selected={dueDate}
                    onSelect={(item) => {
                      setDueDate(item);
                      setPanel(null);
                    }}
                  />
                ) : null
              }
              panelRef={panel === "date" ? panelRef : undefined}
            >
              <CalendarDays />
            </IconControl>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <button
              type="button"
              aria-label="Create more"
              title="Create more"
              className="flex h-8 items-center gap-2 px-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setCreateMore(!createMore)}
            >
              <span
                className={cn(
                  "relative h-5 w-9 shrink-0 border border-border bg-muted transition-[background-color,border-color]",
                  createMore && "border-foreground bg-foreground",
                )}
              >
                <span
                  className={cn(
                    "absolute left-1 top-1 size-3 bg-muted-foreground transition-transform duration-200",
                    createMore && "translate-x-4 bg-background",
                  )}
                />
              </span>
              <span className="hidden sm:inline">Create more</span>
            </button>
            <Button
              type="button"
              className="h-8 border border-foreground bg-foreground px-3 text-xs font-semibold text-background hover:bg-background hover:text-foreground"
              disabled={submitting}
              onClick={() => void submitPost()}
            >
              {submitting ? "Saving..." : "Submit Post"}
            </Button>
          </div>
        </footer>

        {confirmClose ? (
          <div
            className="absolute inset-0 z-40 grid place-items-center bg-background/68 p-4 backdrop-blur-[2px] animate-in fade-in-0 duration-150"
            role="presentation"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) {
                setConfirmClose(false);
              }
            }}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="discard-title"
              aria-describedby="discard-description"
              className="w-full max-w-xs border border-border bg-popover p-4 text-popover-foreground shadow-[0_18px_55px_rgb(0_0_0/0.5)] animate-in fade-in-0 zoom-in-95 duration-150"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <p id="discard-title" className="text-sm font-semibold text-foreground">
                Discard this post?
              </p>
              <p id="discard-description" className="mt-2 text-xs leading-5 text-muted-foreground">
                Unsaved progress will be lost.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="h-8 border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setConfirmClose(false)}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  className="h-8 border border-foreground bg-foreground px-3 text-xs font-semibold text-background hover:bg-background hover:text-foreground"
                  onClick={closeComposer}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function EditorToolPanel({
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
      className="absolute left-0 top-10 z-40 w-[min(26rem,calc(100vw-3rem))] border border-border bg-popover text-popover-foreground shadow-[0_18px_55px_rgb(0_0_0/0.5)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {panel === "link" ? "Insert link" : "Insert code"}
        </p>
        <button
          type="button"
          aria-label="Close tool panel"
          className="grid size-7 place-items-center text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onClose}
        >
          <X className="size-4" />
        </button>
      </div>

      {panel === "link" ? (
        <div className="grid gap-2 p-3">
          <input
            className="h-9 border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(event) => onLinkUrlChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onInsertLink();
            }}
          />
          <input
            className="h-9 border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            placeholder="Optional label"
            value={linkText}
            onChange={(event) => onLinkTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onInsertLink();
            }}
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              className="h-8 border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-8 border border-foreground bg-foreground px-3 text-xs font-semibold text-background hover:bg-background hover:text-foreground"
              onClick={onInsertLink}
            >
              Add link
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 p-3">
          <select
            className="h-9 border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            value={codeLanguage}
            onChange={(event) => onCodeLanguageChange(event.target.value)}
          >
            <option value="tsx">TypeScript</option>
            <option value="json">JSON</option>
            <option value="sh">Shell</option>
          </select>
          <textarea
            className="min-h-28 resize-none border border-border bg-background p-3 font-mono text-xs leading-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            placeholder={'const update = "shipped";'}
            value={codeValue}
            onChange={(event) => onCodeValueChange(event.target.value)}
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              className="h-8 border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-8 border border-foreground bg-foreground px-3 text-xs font-semibold text-background hover:bg-background hover:text-foreground"
              onClick={onInsertCode}
            >
              Add code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectionToolbar({
  onCode,
  onLink,
  visible,
}: {
  onCode: () => void;
  onLink: () => void;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -top-11 left-0 z-30 flex items-center border border-border bg-popover text-popover-foreground opacity-0 shadow-[0_18px_50px_rgb(0_0_0/0.45)] transition-[opacity,transform] duration-200",
        visible && "pointer-events-auto translate-y-0 opacity-100",
        !visible && "translate-y-2",
      )}
    >
      <ToolbarButton label="Bold" onClick={() => document.execCommand("bold")}>
        <Bold />
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => document.execCommand("italic")}>
        <Italic />
      </ToolbarButton>
      <ToolbarButton label="Underline" onClick={() => document.execCommand("underline")}>
        <Underline />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" onClick={() => document.execCommand("strikeThrough")}>
        <Strikethrough />
      </ToolbarButton>
      <ToolbarButton label="Code block" onClick={onCode}>
        <Code2 />
      </ToolbarButton>
      <ToolbarButton label="Link" onClick={onLink}>
        <Link2 />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="grid size-9 place-items-center text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground [&_svg]:size-4"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function FooterControl({
  active,
  children,
  label,
  onClick,
  panelRef,
  popover,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  popover: ReactNode;
}) {
  return (
    <div className="relative" ref={panelRef} data-composer-panel-root>
      <button
        type="button"
        title={label}
        className={cn(
          "flex h-8 min-w-[8.75rem] items-center gap-2 border border-border bg-muted px-2.5 text-xs font-semibold text-muted-foreground transition-[background-color,border-color,color,scale] hover:border-foreground/60 hover:bg-accent hover:text-foreground",
          active && "border-foreground/70 bg-accent text-foreground",
        )}
        onClick={onClick}
      >
        {children}
        <span className="whitespace-nowrap">{label}</span>
      </button>
      {popover}
    </div>
  );
}

function IconControl({
  active,
  children,
  label,
  onClick,
  panelRef,
  popover,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  popover: ReactNode;
}) {
  return (
    <div className="relative" ref={panelRef} data-composer-panel-root>
      <button
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "flex h-8 min-w-8 items-center justify-center gap-2 border border-border bg-muted px-2 text-xs font-semibold text-muted-foreground transition-[background-color,border-color,color,scale] hover:border-foreground/60 hover:bg-accent hover:text-foreground [&_svg]:size-4",
          active && "border-foreground/70 bg-accent text-foreground",
        )}
        onClick={onClick}
      >
        {children}
      </button>
      {popover}
    </div>
  );
}

function BoardPopover({
  onSelect,
  selected,
}: {
  onSelect: (item: BoardItem) => void;
  selected: BoardItem;
}) {
  return (
    <Popover className="left-0 top-[calc(100%+0.5rem)] w-64">
      <SearchRow placeholder="Search board..." />
      <div className="grid gap-1 p-1.5">
        {boardItems.map((item) => (
          <button
            type="button"
            key={item}
            className={cn(
              "flex h-10 items-center justify-between px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground",
              item === selected && "bg-muted text-foreground",
            )}
            onClick={() => onSelect(item)}
          >
            <span className="flex items-center gap-2">
              {item === "Feature Request" ? (
                <Lightbulb className="size-4" />
              ) : (
                <span className="size-2 bg-muted-foreground" />
              )}
              {item}
            </span>
            {item === selected ? <Check className="size-4" /> : null}
          </button>
        ))}
      </div>
      <div className="border-t border-border p-1.5">
        <button
          type="button"
          className="flex h-10 w-full items-center gap-2 px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" />
          Create new board
        </button>
      </div>
    </Popover>
  );
}

function StatusPopover({
  onSelect,
  selected,
}: {
  onSelect: (item: StatusItem) => void;
  selected: StatusItem;
}) {
  return (
    <Popover className="left-0 top-[calc(100%+0.5rem)] w-60">
      <SearchRow placeholder="Search status..." />
      <div className="grid gap-1 p-1.5">
        {statusItems.map(([item, dot]) => (
          <button
            type="button"
            key={item}
            className={cn(
              "flex h-10 items-center justify-between px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground",
              item === selected && "bg-muted text-foreground",
            )}
            onClick={() => onSelect(item)}
          >
            <span className="flex items-center gap-3">
              <span className={cn("size-1.5", dot)} />
              {item}
            </span>
            {item === selected ? <Check className="size-4" /> : null}
          </button>
        ))}
      </div>
    </Popover>
  );
}

function TagPopover({
  onSelect,
  selected,
}: {
  onSelect: (item: TagItem) => void;
  selected: TagItem | null;
}) {
  return (
    <Popover className="left-0 top-[calc(100%+0.5rem)] w-60">
      <SearchRow placeholder="Search tag..." />
      <p className="border-y border-border bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Public tags
      </p>
      <div className="grid gap-1 p-1.5">
        {tagItems.map(([item, dot]) => (
          <button
            type="button"
            key={item}
            className={cn(
              "flex h-10 items-center justify-between px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground",
              item === selected && "bg-muted text-foreground",
            )}
            onClick={() => onSelect(item)}
          >
            <span className="flex items-center gap-3">
              <span className={cn("size-1.5", dot)} />
              {item}
            </span>
            {item === selected ? <Check className="size-4" /> : null}
          </button>
        ))}
      </div>
    </Popover>
  );
}

function AssigneePopover({
  onSelect,
  selected,
}: {
  onSelect: (item: string) => void;
  selected: string | null;
}) {
  return (
    <Popover className="right-0 top-[calc(100%+0.5rem)] w-56">
      <SearchRow placeholder="Search assignee..." />
      <div className="p-1.5">
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-between px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground",
            selected === "Leo" && "bg-muted text-foreground",
          )}
          onClick={() => onSelect("Leo")}
        >
          <span className="flex items-center gap-3">
            <span className="grid size-7 place-items-center bg-muted text-xs text-foreground">
              L
            </span>
            Leo
          </span>
          {selected === "Leo" ? <Check className="size-4" /> : null}
        </button>
      </div>
    </Popover>
  );
}

function DatePopover({
  onSelect,
  selected,
}: {
  onSelect: (item: string) => void;
  selected: string | null;
}) {
  return (
    <Popover className="bottom-[calc(100%+0.5rem)] right-0 w-64">
      <div className="grid grid-cols-4 gap-1.5 border-b border-border p-2">
        {["Q2'26", "Q3'26", "Q4'26", "Q1'27"].map((quarter) => (
          <button
            key={quarter}
            type="button"
            className="h-7 bg-muted text-[0.68rem] font-semibold text-muted-foreground transition-[background-color,color] hover:bg-accent hover:text-foreground"
            onClick={() => onSelect(quarter)}
          >
            {quarter}
          </button>
        ))}
      </div>
      <div className="p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            className="grid size-7 place-items-center bg-muted text-muted-foreground hover:bg-foreground hover:text-background"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-semibold text-muted-foreground">May 2026</p>
          <button
            type="button"
            aria-label="Next month"
            className="grid size-7 place-items-center bg-muted text-muted-foreground hover:bg-foreground hover:text-background"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day} className="py-1.5 text-xs font-semibold text-muted-foreground">
              {day}
            </span>
          ))}
          {dateRows.flat().map((day, index) => {
            const isCurrentMonth = index >= 5 && index <= 35;
            const isSelected =
              isCurrentMonth && (selected === `May ${day}` || (!selected && index === 16));

            return (
              <button
                type="button"
                key={`${day}-${index}`}
                disabled={!isCurrentMonth}
                className={cn(
                  "grid aspect-square place-items-center text-xs font-semibold text-muted-foreground transition-[background-color,color] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35",
                  isSelected &&
                    "bg-foreground text-background hover:bg-foreground hover:text-background",
                )}
                onClick={() => onSelect(`May ${day}`)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}

function SearchRow({ placeholder }: { placeholder: string }) {
  return (
    <input
      className="h-11 w-full border-b border-border bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      placeholder={placeholder}
    />
  );
}

function Popover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "absolute z-50 overflow-hidden border border-border bg-popover text-popover-foreground shadow-[0_18px_55px_rgb(0_0_0/0.48)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 will-change-transform",
        className,
      )}
    >
      {children}
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlightCode(input: string, language: string) {
  if (language === "json") {
    return highlightMatches(
      input,
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g,
      (match) => {
        if (/":\s*$/.test(match)) return "token-key";
        if (match.startsWith('"')) return "token-string";
        if (/true|false|null/.test(match)) return "token-literal";
        return "token-number";
      },
    );
  }

  if (language === "sh") {
    return highlightMatches(
      input,
      /(#.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(--?[a-zA-Z0-9-]+)|\b(?:bun|npm|git|cd|curl|export|echo|cat|rg)\b/g,
      (match) => {
        if (match.startsWith("#")) return "token-comment";
        if (match.startsWith("-")) return "token-flag";
        if (match.startsWith('"') || match.startsWith("'")) return "token-string";
        return "token-keyword";
      },
    );
  }

  return highlightMatches(
    input,
    /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(?:const|let|var|function|return|import|from|export|type|interface|if|else|async|await|new|class|extends)\b|\b\d+(?:\.\d+)?\b/g,
    (match) => {
      if (match.startsWith("//") || match.startsWith("/*")) return "token-comment";
      if (match.startsWith('"') || match.startsWith("'") || match.startsWith("`")) {
        return "token-string";
      }
      if (/^\d/.test(match)) return "token-number";
      return "token-keyword";
    },
  );
}

function highlightMatches(input: string, regex: RegExp, classify: (match: string) => string) {
  let output = "";
  let cursor = 0;

  for (const match of input.matchAll(regex)) {
    const index = match.index ?? 0;
    output += escapeHtml(input.slice(cursor, index));
    output += `<span class="${classify(match[0])}">${escapeHtml(match[0])}</span>`;
    cursor = index + match[0].length;
  }

  output += escapeHtml(input.slice(cursor));
  return output;
}
