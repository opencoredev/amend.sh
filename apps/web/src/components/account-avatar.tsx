import { cn } from "@amend/ui/lib/utils";

import { UserRound } from "@/lib/icons";

/** Two-letter monogram from a name (falls back to email), e.g. "Amend Dev" → "AD". */
export function initialsFromIdentity(name: string | undefined, email: string | undefined) {
  const source = (name ?? email ?? "").trim();
  if (!source) return "";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/** The signed-in person's avatar: image when present, else a monogram, else a glyph. */
export function AccountAvatar({
  className,
  image,
  initials,
}: {
  className?: string;
  image?: string | null;
  initials: string;
}) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-background/75 text-xs font-semibold text-foreground ring-1 ring-white/[0.06]",
        className,
      )}
    >
      {image ? (
        <img alt="" className="size-full object-cover" src={image} />
      ) : initials ? (
        initials
      ) : (
        <UserRound className="size-4 text-muted-foreground" />
      )}
    </span>
  );
}
