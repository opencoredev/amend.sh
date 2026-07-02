import { cn } from "@amend/ui/lib/utils";
import type { ReactNode, RefObject } from "react";

export function FooterControl({
  active,
  children,
  label,
  onClick,
  panelRef,
  popover,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
  panelRef?: RefObject<HTMLDivElement | null>;
  popover: ReactNode;
}) {
  return (
    <div className="relative" ref={panelRef} data-composer-panel-root>
      <button
        type="button"
        title={label}
        className={cn(
          "flex h-8 min-w-[8.75rem] items-center gap-2 rounded-lg bg-amend-inset px-2.5 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] hover:text-foreground active:opacity-75",
          active && "bg-accent text-foreground ring-white/[0.09]",
        )}
        onClick={onClick}
      >
        {children}
        <span className="whitespace-nowrap">{label}</span>
      </button>
      {popover}
    </div>
  );
}

export function IconControl({
  active,
  children,
  label,
  onClick,
  panelRef,
  popover,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
  panelRef?: RefObject<HTMLDivElement | null>;
  popover: ReactNode;
}) {
  return (
    <div className="relative" ref={panelRef} data-composer-panel-root>
      <button
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "flex h-8 min-w-8 items-center justify-center gap-2 rounded-lg bg-amend-inset px-2 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] hover:text-foreground active:opacity-75 [&_svg]:size-4",
          active && "bg-accent text-foreground ring-white/[0.09]",
        )}
        onClick={onClick}
      >
        {children}
      </button>
      {popover}
    </div>
  );
}
