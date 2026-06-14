import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { DashboardChangelog } from "@/components/amend-dashboard-types";
import { ChangelogAssistantRail } from "@/components/changelog-editor-sidebar";
import { ChangelogEditorHeader } from "@/components/changelog-editor-header";
import { ChangelogEditorMain } from "@/components/changelog-editor-main";
import { isBlankChangelog } from "@/components/changelog-editor-types";
import type { ChangelogEditorSavePayload } from "@/components/changelog-editor-types";
import { errorMessage, toast } from "@/lib/toast";

function authorInitials(entry: DashboardChangelog) {
  const source = entry.authorName.trim();
  if (!source) return "·";
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "·";
}

function htmlToText(html: string) {
  return html
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function deriveSummary(text: string, fallback: string) {
  const firstLine = text
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  const summary = (firstLine ?? "").slice(0, 200).trim();
  return summary || fallback;
}

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
  const [category, setCategory] = useState("added");
  const [confirmClose, setConfirmClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [showPublicly, setShowPublicly] = useState(true);
  const [status, setStatus] = useState("draft");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isNew = isBlankChangelog(entry);

  const isDirty =
    body !== entry.body ||
    category !== entry.category ||
    status !== entry.status ||
    tags.join(" ") !== entry.tags.join(" ") ||
    title !== entry.title ||
    version !== (entry.version ?? "");

  const bodyText = useMemo(() => htmlToText(body), [body]);
  const stats = useMemo(() => {
    const words = bodyText ? bodyText.split(/\s+/).length : 0;
    return { chars: bodyText.length, words, readMinutes: Math.ceil(words / 200) };
  }, [bodyText]);

  useEffect(() => {
    setBody(entry.body);
    setCategory(entry.category || "added");
    setStatus(entry.status || "draft");
    setTags(entry.tags);
    setTitle(entry.title);
    setVersion(entry.version ?? "");
    setConfirmClose(false);
    if (editorRef.current) editorRef.current.innerHTML = entry.body;
  }, [entry]);

  function applyCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setBody(editorRef.current?.innerHTML ?? "");
  }

  function requestClose() {
    if (isDirty) {
      setConfirmClose(true);
      return;
    }
    onClose();
  }

  function submit() {
    if (!title.trim() || saving) return;
    setSaving(true);
    void onSave({
      body: bodyText ? body : "",
      category,
      status,
      summary: deriveSummary(bodyText, title.trim()),
      tags,
      title: title.trim(),
      ...(isNew ? {} : { stableKey: entry.stableKey }),
      ...(version.trim() ? { version: version.trim() } : {}),
    })
      .catch((error: unknown) =>
        toast.error({
          title: "Changelog save failed",
          description: errorMessage(
            error,
            "The changelog could not be saved. Check the title and body, then try again.",
          ),
        }),
      )
      .finally(() => setSaving(false));
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <form
        className="flex h-full min-h-0 flex-1 flex-col"
        onKeyDown={(event: ReactKeyboardEvent<HTMLFormElement>) => {
          if (event.key === "Escape" && !confirmClose) {
            event.preventDefault();
            requestClose();
          }
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            submit();
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <ChangelogEditorHeader
          authorInitials={authorInitials(entry)}
          canSave={Boolean(title.trim())}
          category={category}
          confirmClose={confirmClose}
          isDirty={isDirty}
          isNew={isNew}
          onCancelClose={() => setConfirmClose(false)}
          onCategoryChange={setCategory}
          onDiscard={onClose}
          onRequestClose={requestClose}
          onSendEmailChange={setSendEmail}
          onShowPubliclyChange={setShowPublicly}
          onStatusChange={setStatus}
          onVersionChange={setVersion}
          saving={saving}
          sendEmail={sendEmail}
          showPublicly={showPublicly}
          status={status}
          version={version}
        />

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ChangelogEditorMain
            category={category}
            charCount={stats.chars}
            editorRef={editorRef}
            isEmpty={!bodyText}
            onAddTag={(tag) => setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))}
            onBodyChange={setBody}
            onCategoryChange={setCategory}
            onCommand={applyCommand}
            onRemoveTag={(tag) => setTags((prev) => prev.filter((value) => value !== tag))}
            onTitleChange={setTitle}
            readMinutes={stats.readMinutes}
            tags={tags}
            title={title}
            wordCount={stats.words}
          />
          <ChangelogAssistantRail />
        </div>
      </form>
    </div>
  );
}
