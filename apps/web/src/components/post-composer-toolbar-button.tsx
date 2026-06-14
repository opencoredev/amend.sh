import type { ReactNode } from "react";

export function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 ease-linear hover:bg-white/[0.06] hover:text-foreground active:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 [&_svg]:size-4"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
