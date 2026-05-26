import { useRef, useState } from "react";

import type {
  BoardItem,
  ComposerPanel,
  ComposerSubmitPayload,
  StatusItem,
  TagItem,
} from "./post-composer-model";
import { usePostComposerEditor } from "./use-post-composer-editor";
import { usePostComposerModalLifecycle } from "./use-post-composer-modal-lifecycle";

export function usePostComposerModalController({
  initialBoard,
  initialStatus,
  onClose,
  onSubmit,
  open,
}: {
  initialBoard: BoardItem;
  initialStatus: StatusItem;
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
  const [titleError, setTitleError] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const editor = usePostComposerEditor({ onMetadataPanelClose: () => setPanel(null) });
  const {
    descriptionText,
    editorPanel,
    resetEditor,
    setDescriptionText,
    setEditorPanel,
    setSelectionTools,
  } = editor;
  const isDirty = title.trim().length > 0 || descriptionText.trim().length > 0;

  usePostComposerModalLifecycle({
    confirmClose,
    editorPanel,
    initialBoard,
    initialStatus,
    open,
    panel,
    requestClose,
    setBoard,
    setConfirmClose,
    setEditorPanel,
    setPanel,
    setSelectionTools,
    setStatus,
    submitPost,
    titleRef,
  });

  return {
    assignee,
    board,
    closeMetadataPanel,
    closeComposer,
    confirmClose,
    createMore,
    dueDate,
    editor,
    panel,
    panelRef,
    requestClose,
    selectBoard,
    setAssignee,
    setConfirmClose,
    setCreateMore,
    setDueDate,
    setStatus,
    setTag,
    setTitleFromInput,
    status,
    submitPost,
    submitError,
    submitting,
    tag,
    title,
    titleError,
    titleRef,
    toggleMetadataPanel,
  };

  function resetForm() {
    setTitle("");
    setDescriptionText("");
    setBoard(initialBoard);
    setStatus(initialStatus);
    setTitleError(false);
    setConfirmClose(false);
    setSubmitError("");
    setPanel(null);
    resetEditor();
  }

  function closeComposer() {
    resetForm();
    onClose();
  }

  function closeMetadataPanel() {
    setPanel(null);
  }

  function requestClose() {
    if (isDirty) {
      setConfirmClose(true);
      setPanel(null);
      return;
    }
    closeComposer();
  }

  function selectBoard(item: BoardItem) {
    setBoard(item);
    setPanel(null);
  }

  function setTitleFromInput(nextTitle: string) {
    setTitle(nextTitle);
    if (nextTitle.trim()) setTitleError(false);
  }

  function toggleMetadataPanel(nextPanel: Exclude<ComposerPanel, null>) {
    setEditorPanel(null);
    setSelectionTools(false);
    setPanel(panel === nextPanel ? null : nextPanel);
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
}
