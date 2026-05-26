import { cn } from "@amend/ui/lib/utils";
import { Bold, Code2, FileImage, Italic, Link2, List, Paperclip, Smile } from "lucide-react";
import type { RefObject } from "react";

import { EditorToolPanel, SelectionToolbar, ToolbarButton } from "./post-composer-controls";
import type { PostComposerEditorController } from "./use-post-composer-editor";

export function PostComposerEditorBody({
  editor,
  onTitleChange,
  submitError,
  title,
  titleError,
  titleRef,
}: {
  editor: PostComposerEditorController;
  onTitleChange: (title: string) => void;
  submitError: string;
  title: string;
  titleError: boolean;
  titleRef: RefObject<HTMLInputElement | null>;
}) {
  const {
    applyEditorCommand,
    codeLanguage,
    codeValue,
    descriptionText,
    editorPanel,
    editorRef,
    insertCodeBlock,
    insertEditorText,
    insertLink,
    linkText,
    linkUrl,
    openEditorPanel,
    selectionTools,
    setCodeLanguage,
    setCodeValue,
    setDescriptionText,
    setEditorPanel,
    setLinkText,
    setLinkUrl,
    setSelectionTools,
    syncSelectionToolbar,
    toolPanelRef,
  } = editor;

  return (
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
        onChange={(event) => onTitleChange(event.target.value)}
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
  );
}
