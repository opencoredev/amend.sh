import { useMutation } from "convex/react";

import { useAuthedQuery } from "@/lib/convex-utils";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import {
  createWorkspaceTagMutation,
  listWorkspaceTagsQuery,
} from "@/components/amend-dashboard-data";
import type { ChangelogPublishPayload } from "@/components/amend-dashboard-content-types";
import type { DashboardChangelog } from "@/components/amend-dashboard-types";
import { ChangelogEditorHeader } from "@/components/changelog-editor-header";
import { ChangelogEditorMain } from "@/components/changelog-editor-main";
import { ChangelogPublishReview } from "@/components/changelog-publish-review";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import type { PublishReviewValues } from "@/components/changelog-publish-review";
import type {
  AutoSaveStatus,
  ChangelogEditorSavePayload,
} from "@/components/changelog-editor-types";
import type { WorkspaceTag } from "@/components/changelog-tags";
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

/** How long the editor sits idle before an auto-save fires. */
const AUTOSAVE_DELAY_MS = 1200;
/** How often the "Saved · 2m ago" label re-renders to stay current. */
const SAVED_LABEL_TICK_MS = 30_000;

/**
 * Stable identity for the open entry. Live Convex queries hand us a fresh object
 * on every keystroke-triggered save, so we reset the editor on identity change —
 * not object identity — to avoid clobbering in-flight edits. We key off stableKey
 * (which a draft already carries before its first save) rather than recordId, so the
 * moment a draft becomes a saved record its identity is unchanged and the editor is
 * never reset out from under the writer.
 */
function changelogIdentity(entry: DashboardChangelog) {
  return entry.stableKey;
}

/**
 * Canonical signature of everything we persist, so auto-save can cheaply tell
 * "changed since last save" and skip redundant writes. Mirrors the payload shape.
 */
function autoSaveSignature(fields: {
  body: string;
  category: string;
  status: string;
  tags: string[];
  title: string;
  version: string;
}) {
  const text = htmlToText(fields.body);
  return JSON.stringify({
    body: text ? fields.body : "",
    category: fields.category,
    status: fields.status,
    tags: fields.tags,
    title: fields.title.trim(),
    version: fields.version.trim(),
  });
}

function formatSavedAgo(at: number, now: number) {
  const diff = Math.max(0, now - at);
  if (diff < 10_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export function ChangelogEditorWorkspace({
  entry,
  onAutoSave,
  onClose,
  onPublish,
  workspaceSlug,
}: {
  entry: DashboardChangelog;
  onAutoSave: (payload: ChangelogEditorSavePayload) => Promise<string | null>;
  onClose: () => void;
  onPublish: (payload: ChangelogPublishPayload) => Promise<void>;
  workspaceSlug?: string;
}) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("added");
  const [status, setStatus] = useState("draft");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [savedSignature, setSavedSignature] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [reviewing, setReviewing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  // Unsaved until the backend assigns a record id; a seeded draft carries its key but
  // no record id yet, so this — not the key — is what marks it new.
  const isNew = entry.recordId === null;

  // Persistent, reusable workspace tags (with their colors).
  const availableTags: WorkspaceTag[] =
    useAuthedQuery(listWorkspaceTagsQuery, workspaceSlug ? { workspaceSlug } : {}) ?? [];
  const createWorkspaceTag = useMutation(createWorkspaceTagMutation);

  function handleCreateTag(name: string, color: string) {
    void createWorkspaceTag({
      name,
      color,
      ...(workspaceSlug ? { workspaceSlug } : {}),
    }).catch((error: unknown) =>
      toast.error({
        title: "Could not create tag",
        description: errorMessage(error, "The tag could not be saved. Try again."),
      }),
    );
  }

  // The key we write into. Starts at the entry's key (or undefined for a fresh
  // draft, where the backend mints one) and is captured from the first save so
  // every later write — including title edits — updates the same record.
  const savedKeyRef = useRef<string | undefined>(undefined);
  const identityRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  // Signature whose save failed; we hold off retrying it until the content moves.
  const errorSignatureRef = useRef<string | null>(null);
  // Pending debounce timer, tracked so a force-save (Cmd+S / close) can cancel it.
  const debounceRef = useRef<number | null>(null);
  // The in-flight save promise, so publishing can await a guaranteed stableKey.
  const savePromiseRef = useRef<Promise<void> | null>(null);

  const bodyText = useMemo(() => htmlToText(body), [body]);
  const stats = useMemo(() => {
    const words = bodyText ? bodyText.split(/\s+/).length : 0;
    return { chars: bodyText.length, words, readMinutes: Math.ceil(words / 200) };
  }, [bodyText]);

  const currentSignature = useMemo(
    () => autoSaveSignature({ body, category, status, tags, title, version }),
    [body, category, status, tags, title, version],
  );
  const hasUnsavedChanges = currentSignature !== savedSignature;
  // A title is required before anything can persist (the backend keys off it).
  const needsTitle = hasUnsavedChanges && !title.trim();

  // Load entry → editor only when a *different* entry opens, so a live-query
  // refresh of the entry we're already editing never resets the fields.
  useEffect(() => {
    const identity = changelogIdentity(entry);
    if (identityRef.current === identity) return;
    identityRef.current = identity;

    const nextCategory = entry.category || "added";
    const nextStatus = entry.status || "draft";
    const nextVersion = entry.version ?? "";
    setBody(entry.body);
    setCategory(nextCategory);
    setStatus(nextStatus);
    setTags(entry.tags);
    setTitle(entry.title);
    setVersion(nextVersion);
    setAutoSaveStatus("idle");
    setLastSavedAt(null);
    savedKeyRef.current = entry.stableKey || undefined;
    inFlightRef.current = false;
    errorSignatureRef.current = null;
    setSavedSignature(
      autoSaveSignature({
        body: entry.body,
        category: nextCategory,
        status: nextStatus,
        tags: entry.tags,
        title: entry.title,
        version: nextVersion,
      }),
    );
    if (editorRef.current) editorRef.current.innerHTML = entry.body;
  }, [entry]);

  // Keep the "Saved · 2m ago" label fresh without re-rendering on every keystroke.
  useEffect(() => {
    if (lastSavedAt === null) return;
    const id = window.setInterval(() => setNowTick(Date.now()), SAVED_LABEL_TICK_MS);
    return () => window.clearInterval(id);
  }, [lastSavedAt]);

  function buildPayload(): ChangelogEditorSavePayload {
    const stableKey = savedKeyRef.current ?? entry.stableKey;
    return {
      body: bodyText ? body : "",
      category,
      status,
      summary: deriveSummary(bodyText, title.trim()),
      tags,
      title: title.trim(),
      ...(stableKey ? { stableKey } : {}),
      ...(version.trim() ? { version: version.trim() } : {}),
    };
  }

  function runAutoSave(signature: string): Promise<void> {
    if (inFlightRef.current) return savePromiseRef.current ?? Promise.resolve();
    inFlightRef.current = true;
    setAutoSaveStatus("saving");
    const promise = (async () => {
      try {
        const savedKey = await onAutoSave(buildPayload());
        if (savedKey) savedKeyRef.current = savedKey;
        errorSignatureRef.current = null;
        setSavedSignature(signature);
        setLastSavedAt(Date.now());
        setNowTick(Date.now());
        setAutoSaveStatus("saved");
      } catch {
        errorSignatureRef.current = signature;
        setAutoSaveStatus("error");
      } finally {
        inFlightRef.current = false;
      }
    })();
    savePromiseRef.current = promise;
    return promise;
  }

  // Debounced auto-save: skip while a save is in flight or while the current
  // content already failed — each completed save re-renders and re-evaluates
  // this for any edit that landed mid-flight.
  useEffect(() => {
    if (needsTitle || !hasUnsavedChanges) return;
    if (inFlightRef.current) return;
    if (errorSignatureRef.current === currentSignature) return;
    const handle = window.setTimeout(() => {
      debounceRef.current = null;
      void runAutoSave(currentSignature);
    }, AUTOSAVE_DELAY_MS);
    debounceRef.current = handle;
    return () => {
      window.clearTimeout(handle);
      if (debounceRef.current === handle) debounceRef.current = null;
    };
    // runAutoSave/buildPayload read the latest state via this render's closure.
  }, [currentSignature, savedSignature, hasUnsavedChanges, needsTitle]);

  /** Persist immediately, bypassing the debounce — for Cmd+S, retry, and close. */
  function flushSave() {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (needsTitle || !hasUnsavedChanges || inFlightRef.current) return;
    errorSignatureRef.current = null;
    void runAutoSave(currentSignature);
  }

  /** Persist (awaiting any in-flight save) and resolve the entry's real stableKey. */
  async function ensureSaved(): Promise<string | undefined> {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (title.trim() && (hasUnsavedChanges || inFlightRef.current)) {
      await runAutoSave(currentSignature);
    }
    return savedKeyRef.current ?? entry.stableKey ?? undefined;
  }

  function openPublish() {
    if (!title.trim()) {
      toast.error({
        title: "Add a title first",
        description: "Give the changelog a title before publishing.",
      });
      return;
    }
    // Kick off a save now so the review opens over already-persisted content.
    flushSave();
    setReviewing(true);
  }

  async function publishFromReview(values: PublishReviewValues) {
    if (publishing) return;
    setPublishing(true);
    try {
      const stableKey = await ensureSaved();
      if (!stableKey) {
        throw new Error("The changelog could not be saved before publishing.");
      }
      const content = buildPayload();
      await onPublish({
        ...content,
        stableKey,
        summary: values.summary || content.summary,
        coverImageStorageId: values.coverImageStorageId,
        metaDescription: values.metaDescription,
        mode: values.mode,
        ...(values.scheduledFor ? { scheduledFor: values.scheduledFor } : {}),
        notifySubscribers: values.notifySubscribers,
      });
      // Success: the controller closes the editor (selectedChangelogKey → null).
    } catch (error) {
      toast.error({
        title: "Publish failed",
        description: errorMessage(error, "The changelog could not be published. Try again."),
      });
      setPublishing(false);
    }
  }

  function applyCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setBody(editorRef.current?.innerHTML ?? "");
  }

  function requestClose() {
    // Everything auto-saves; flush any pending edit so nothing is lost on the
    // way out (the mutation completes even after this component unmounts).
    flushSave();
    onClose();
  }

  const lastSavedLabel = lastSavedAt === null ? null : formatSavedAgo(lastSavedAt, nowTick);

  if (reviewing) {
    return (
      <DashboardWorkspaceSurface contentClassName="overflow-hidden">
        <ChangelogPublishReview
          title={title}
          category={category}
          tags={tags}
          version={version}
          canPublish={Boolean(title.trim())}
          publishing={publishing}
          workspaceSlug={workspaceSlug}
          initialSummary={deriveSummary(bodyText, title.trim())}
          initialCoverUrl={entry.coverImageUrl ?? null}
          initialCoverStorageId={entry.coverImageStorageId ?? null}
          initialMetaDescription={entry.metaDescription ?? ""}
          onBack={() => setReviewing(false)}
          onCommit={(values) => void publishFromReview(values)}
        />
      </DashboardWorkspaceSurface>
    );
  }

  return (
    <DashboardWorkspaceSurface contentClassName="overflow-hidden">
      <form
        className="flex h-full min-h-0 flex-1 flex-col"
        onKeyDown={(event: ReactKeyboardEvent<HTMLFormElement>) => {
          if (event.key === "Escape") {
            event.preventDefault();
            requestClose();
          }
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            flushSave();
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          flushSave();
        }}
      >
        <ChangelogEditorHeader
          authorInitials={authorInitials(entry)}
          autoSaveStatus={autoSaveStatus}
          category={category}
          hasUnsavedChanges={hasUnsavedChanges}
          isNew={isNew}
          lastSavedLabel={lastSavedLabel}
          needsTitle={needsTitle}
          onCategoryChange={setCategory}
          onOpenPublish={openPublish}
          onRequestClose={requestClose}
          onRetrySave={flushSave}
          onVersionChange={setVersion}
          status={status}
          version={version}
        />

        <div className="flex min-h-0 flex-1 flex-col">
          <ChangelogEditorMain
            availableTags={availableTags}
            category={category}
            charCount={stats.chars}
            editorRef={editorRef}
            isEmpty={!bodyText}
            onAddTag={(tag) => setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))}
            onBodyChange={setBody}
            onCategoryChange={setCategory}
            onCommand={applyCommand}
            onCreateTag={handleCreateTag}
            onRemoveTag={(tag) => setTags((prev) => prev.filter((value) => value !== tag))}
            onTitleChange={setTitle}
            readMinutes={stats.readMinutes}
            tags={tags}
            title={title}
            wordCount={stats.words}
          />
        </div>
      </form>
    </DashboardWorkspaceSurface>
  );
}
