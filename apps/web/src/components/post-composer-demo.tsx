import { Button } from "@amend/ui/components/button";
import { cn } from "@amend/ui/lib/utils";
import { Plus } from "@/lib/icons";
import { useState } from "react";

import { ComposerModal } from "./post-composer-modal";

export { ComposerModal } from "./post-composer-modal";
export type { BoardItem, ComposerSubmitPayload, StatusItem } from "./post-composer-model";

export default function PostComposerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <main className="dark relative min-h-svh overflow-hidden bg-background font-mono text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "4.5rem 4.5rem",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-foreground/5 blur-3xl"
      />

      <div
        className={cn(
          "relative z-10 grid min-h-svh place-items-center px-6 transition-[filter,opacity,transform] duration-500",
          open && "scale-[0.985] opacity-40 blur-sm",
        )}
      >
        <Button
          type="button"
          size="lg"
          className="h-12 border border-foreground bg-foreground px-6 text-sm font-semibold text-background hover:bg-background hover:text-foreground"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" />
          Create new post
        </Button>
      </div>

      <ComposerModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
