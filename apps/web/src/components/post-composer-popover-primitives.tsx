import { cn } from "@amend/ui/lib/utils";
import type { ReactNode } from "react";

export function SearchRow({ placeholder }: { placeholder: string }) {
  return (
    <input
      className="h-11 w-full border-b border-border bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      placeholder={placeholder}
    />
  );
}

export function Popover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "absolute z-50 overflow-hidden border border-border bg-popover text-popover-foreground shadow-[0_18px_55px_rgb(0_0_0/0.48)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 will-change-transform",
        className,
      )}
    >
      {children}
    </div>
  );
}
