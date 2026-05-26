import { PostComposerDiscardDialog } from "./post-composer-discard-dialog";
import { PostComposerFooter } from "./post-composer-footer";
import { PostComposerEditorBody, PostComposerHeader } from "./post-composer-modal-sections";
import type { BoardItem, ComposerSubmitPayload, StatusItem } from "./post-composer-model";
import { usePostComposerModalController } from "./use-post-composer-modal-controller";

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
  const composer = usePostComposerModalController({
    initialBoard,
    initialStatus,
    onClose,
    onSubmit,
    open,
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/72 p-4 backdrop-blur-[3px] animate-in fade-in-0 duration-300"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          composer.requestClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Create post"
        className="t-modal is-open relative grid h-[min(68vh,30rem)] w-full max-w-[56rem] grid-rows-[auto_minmax(0,1fr)_auto] overflow-visible rounded-xl border border-border bg-card text-card-foreground shadow-[0_22px_90px_rgb(0_0_0/0.55)]"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerDownCapture={(event) => {
          if (composer.panel && !composer.panelRef.current?.contains(event.target as Node)) {
            composer.closeMetadataPanel();
          }
          if (
            composer.editor.editorPanel &&
            !composer.editor.toolPanelRef.current?.contains(event.target as Node)
          ) {
            composer.editor.setEditorPanel(null);
          }
        }}
      >
        <PostComposerHeader
          board={composer.board}
          onBoardSelect={composer.selectBoard}
          onClose={composer.requestClose}
          onPanelToggle={composer.toggleMetadataPanel}
          panel={composer.panel}
          panelRef={composer.panelRef}
        />

        <PostComposerEditorBody
          editor={composer.editor}
          onTitleChange={composer.setTitleFromInput}
          submitError={composer.submitError}
          title={composer.title}
          titleError={composer.titleError}
          titleRef={composer.titleRef}
        />

        <PostComposerFooter
          assignee={composer.assignee}
          createMore={composer.createMore}
          dueDate={composer.dueDate}
          onAssigneeSelect={composer.setAssignee}
          onCreateMoreChange={composer.setCreateMore}
          onDateSelect={composer.setDueDate}
          onPanelToggle={composer.toggleMetadataPanel}
          onStatusSelect={composer.setStatus}
          onSubmit={() => void composer.submitPost()}
          onTagSelect={composer.setTag}
          panel={composer.panel}
          panelRef={composer.panelRef}
          status={composer.status}
          submitting={composer.submitting}
          tag={composer.tag}
        />

        {composer.confirmClose ? (
          <PostComposerDiscardDialog
            onCancel={() => composer.setConfirmClose(false)}
            onDiscard={composer.closeComposer}
          />
        ) : null}
      </section>
    </div>
  );
}
