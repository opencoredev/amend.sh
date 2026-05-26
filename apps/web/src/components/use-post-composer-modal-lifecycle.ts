import { useEffect } from "react";
import type { RefObject } from "react";

import type { BoardItem, ComposerPanel, EditorPanel, StatusItem } from "./post-composer-model";

export function usePostComposerModalLifecycle({
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
}: {
  confirmClose: boolean;
  editorPanel: EditorPanel;
  initialBoard: BoardItem;
  initialStatus: StatusItem;
  open: boolean;
  panel: ComposerPanel;
  requestClose: () => void;
  setBoard: (board: BoardItem) => void;
  setConfirmClose: (confirmClose: boolean) => void;
  setEditorPanel: (panel: EditorPanel) => void;
  setPanel: (panel: ComposerPanel) => void;
  setSelectionTools: (selectionTools: boolean) => void;
  setStatus: (status: StatusItem) => void;
  submitPost: () => Promise<void> | void;
  titleRef: RefObject<HTMLInputElement | null>;
}) {
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

    return () => window.clearTimeout(focusTimer);
  }, [
    initialBoard,
    initialStatus,
    open,
    setBoard,
    setConfirmClose,
    setEditorPanel,
    setPanel,
    setSelectionTools,
    setStatus,
    titleRef,
  ]);

  useEffect(() => {
    if (!open) return;

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
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [
    confirmClose,
    editorPanel,
    open,
    panel,
    requestClose,
    setConfirmClose,
    setEditorPanel,
    setPanel,
    submitPost,
  ]);
}
