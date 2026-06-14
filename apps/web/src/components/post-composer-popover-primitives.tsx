import { cn } from "@amend/ui/lib/utils";
import type { ReactNode } from "react";

export function SearchRow({ placeholder }: { placeholder: string }) {
  return (
    <input
      className="h-11 w-full border-b border-white/[0.06] bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      placeholder={placeholder}
    />
  );
}

export function Popover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "absolute z-50 overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-[0_18px_55px_rgb(0_0_0/0.5)] ring-1 ring-white/[0.07] animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 will-change-transform",
        className,
      )}
    >
      {children}
    </div>
  );
}
