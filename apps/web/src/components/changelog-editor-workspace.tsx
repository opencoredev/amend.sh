import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { DashboardChangelog } from "@/components/amend-dashboard-types";
import { ChangelogEditorHeader } from "@/components/changelog-editor-header";
import { ChangelogEditorMain } from "@/components/changelog-editor-main";
import { ChangelogEditorSidebar } from "@/components/changelog-editor-sidebar";
import type { ChangelogEditorSavePayload } from "@/components/changelog-editor-types";
import { errorMessage, toast } from "@/lib/toast";

export function ChangelogEditorWorkspace({
  entry,
  onClose,
  onSave,
}: {
  entry: DashboardChangelog;
  onClose: () => void;
  onSave: (payload: ChangelogEditorSavePayload) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("changed");
  const [confirmClose, setConfirmClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [showPublicly, setShowPublicly] = useState(true);
  const [status, setStatus] = useState("draft");
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isDirty =
    body !== entry.body ||
    category !== entry.category ||
    status !== entry.status ||
    summary !== entry.summary ||
    title !== entry.title ||
    version !== (entry.version ?? "");

  useEffect(() => {
    setBody(entry.body);
    setCategory(entry.category);
    setStatus(entry.status);
    setSummary(entry.summary);
    setTitle(entry.title);
    setVersion(entry.version ?? "");
    setConfirmClose(false);
    if (editorRef.current) editorRef.current.innerText = entry.body;
  }, [entry]);

  function requestClose() {
    if (isDirty) {
      setConfirmClose(true);
      return;
    }
    onClose();
  }

  function applyEditorCommand(command: string) {
    editorRef.current?.focus();
    document.execCommand(command);
    setBody(editorRef.current?.innerText ?? "");
  }

  return (
    <div className="min-h-svh bg-card/40">
      <form
        className="grid min-h-svh grid-rows-[auto_minmax(0,1fr)]"
        onKeyDown={(event: ReactKeyboardEvent<HTMLFormElement>) => {
          if (event.key === "Escape") {
            event.preventDefault();
            requestClose();
          }
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            document.getElementById("amend-changelog-save")?.click();
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          setSaving(true);
          void onSave({
            body: body.trim() || summary.trim() || title.trim(),
            category,
            stableKey: entry.stableKey,
            status,
            summary: summary.trim() || body.trim() || title.trim(),
            tags: entry.tags,
            title: title.trim(),
            ...(version.trim() ? { version: version.trim() } : {}),
          })
            .catch((error: unknown) =>
              toast.error({
                title: "Changelog save failed",
                description: errorMessage(
                  error,
                  "The changelog draft could not be saved. Check the title and body, then try again.",
                ),
              }),
            )
            .finally(() => setSaving(false));
        }}
      >
        <ChangelogEditorHeader
          canSave={Boolean(title.trim())}
          confirmClose={confirmClose}
          onCancelClose={() => setConfirmClose(false)}
          onClose={requestClose}
          onDiscard={onClose}
          onRequestClose={requestClose}
          saving={saving}
          status={status}
          title={title}
        />

        <div className="min-h-0 overflow-auto bg-background/45">
          <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_24rem]">
            <ChangelogEditorMain
              body={body}
              editorRef={editorRef}
              onBodyChange={setBody}
              onEditorCommand={applyEditorCommand}
              onSummaryChange={setSummary}
              onTitleChange={setTitle}
              summary={summary}
              title={title}
            />
            <ChangelogEditorSidebar
              category={category}
              entry={entry}
              onCategoryChange={setCategory}
              onSendEmailChange={setSendEmail}
              onShowPubliclyChange={setShowPublicly}
              onStatusChange={setStatus}
              onVersionChange={setVersion}
              sendEmail={sendEmail}
              showPublicly={showPublicly}
              status={status}
              version={version}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
