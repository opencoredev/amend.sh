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
        className="w-full max-w-xs rounded-2xl bg-popover p-5 text-popover-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_18px_55px_rgb(0_0_0/0.5)] ring-1 ring-white/[0.07] animate-in fade-in-0 zoom-in-95 duration-150"
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
            className="h-8 rounded-lg px-3 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.06] transition-colors duration-150 ease-linear hover:bg-white/[0.06] hover:text-foreground active:opacity-75"
            onClick={onCancel}
          >
            Keep editing
          </button>
          <button
            type="button"
            className="h-8 rounded-lg border border-foreground bg-foreground px-3.5 text-xs font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75"
            onClick={onDiscard}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
