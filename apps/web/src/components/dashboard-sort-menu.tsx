/**
 * The list views' sort control — one consistent dropdown in the header actions,
 * beside Search, on Feedback · Roadmap · Changelog. Styled to match the search
 * input (same height, rounded, hairline ring) so the two read as one cluster.
 */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@amend/ui/components/dropdown-menu";

import type { SortOption } from "@/components/dashboard-sort";
import { Check, ChevronsUpDown } from "@/lib/icons";

export function SortMenu({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
}) {
  if (options.length === 0) return null;
  const active = options.find((option) => option.value === value) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#151518] px-3 text-sm font-semibold text-muted-foreground outline-none ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/25 active:opacity-75 data-[popup-open]:bg-[#1a1a1d] data-[popup-open]:text-foreground"
          />
        }
      >
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        {active?.label}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-44 rounded-xl bg-popover p-1.5 shadow-[0_18px_60px_rgb(0_0_0/0.55)] ring-1 ring-white/[0.06]"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="justify-between gap-6 rounded-lg px-2 py-2 text-sm focus:bg-accent"
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.value === active?.value ? <Check className="size-4 text-foreground" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
