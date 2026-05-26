import { Button } from "@amend/ui/components/button";
import { ChevronDown } from "lucide-react";

import { formatState } from "@/components/amend-dashboard-utils";

export function ChangelogEditorHeader({
  canSave,
  confirmClose,
  onCancelClose,
  onClose,
  onDiscard,
  onRequestClose,
  saving,
  status,
  title,
}: {
  canSave: boolean;
  confirmClose: boolean;
  onCancelClose: () => void;
  onClose: () => void;
  onDiscard: () => void;
  onRequestClose: () => void;
  saving: boolean;
  status: string;
  title: string;
}) {
  return (
    <header className="border-b border-border bg-background/70 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-[color,scale] duration-200 hover:text-foreground active:scale-[0.96]"
            onClick={onRequestClose}
          >
            <ChevronDown className="size-3 rotate-90" />
            Back to changelog
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span>Changelog</span>
            <span>/</span>
            <span>{title.trim() || "Untitled"}</span>
            <span>/</span>
            <span>{formatState(status)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="h-10 border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
            type="button"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            id="amend-changelog-save"
            className="h-10 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-[background-color,color,scale] hover:bg-background hover:text-foreground active:scale-[0.96]"
            disabled={saving || !canSave}
            type="submit"
          >
            {saving ? "Saving..." : "Save changelog"}
          </Button>
        </div>
      </div>

      {confirmClose ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/20 p-3">
          <p className="text-sm text-muted-foreground">Discard unsaved changelog edits?</p>
          <div className="flex items-center gap-2">
            <Button
              className="h-9 border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
              type="button"
              onClick={onCancelClose}
            >
              Keep editing
            </Button>
            <Button
              className="h-9 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-[background-color,color,scale] hover:bg-background hover:text-foreground active:scale-[0.96]"
              type="button"
              onClick={onDiscard}
            >
              Discard
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
