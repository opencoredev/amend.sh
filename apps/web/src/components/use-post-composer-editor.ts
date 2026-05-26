import { useRef, useState } from "react";

import { escapeHtml, highlightCode } from "./post-composer-format";
import type { EditorPanel } from "./post-composer-model";

export function usePostComposerEditor({
  onMetadataPanelClose,
}: {
  onMetadataPanelClose: () => void;
}) {
  const [descriptionText, setDescriptionText] = useState("");
  const [selectionTools, setSelectionTools] = useState(false);
  const [editorPanel, setEditorPanel] = useState<EditorPanel>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("tsx");
  const [codeValue, setCodeValue] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const toolPanelRef = useRef<HTMLDivElement | null>(null);

  function resetEditor() {
    setDescriptionText("");
    setSelectionTools(false);
    setEditorPanel(null);
    setLinkUrl("");
    setLinkText("");
    setCodeValue("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
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

  function openEditorPanel(nextPanel: EditorPanel) {
    const selectedText = window.getSelection()?.toString() ?? "";
    if (hasEditorSelection()) saveEditorSelection();
    if (nextPanel === "link" && selectedText.trim() && !linkText.trim()) {
      setLinkText(selectedText.trim());
    }
    onMetadataPanelClose();
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

  return {
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
    resetEditor,
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
  };
}

export type PostComposerEditorController = ReturnType<typeof usePostComposerEditor>;
