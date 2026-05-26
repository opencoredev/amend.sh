export function PostComposerDiscardDialog({
  onCancel,
  onDiscard,
}: {
  onCancel: () => void;
  onDiscard: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-40 grid place-items-center bg-background/68 p-4 backdrop-blur-[2px] animate-in fade-in-0 duration-150"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
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
            onClick={onCancel}
          >
            Keep editing
          </button>
          <button
            type="button"
            className="h-8 border border-foreground bg-foreground px-3 text-xs font-semibold text-background hover:bg-background hover:text-foreground"
            onClick={onDiscard}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
