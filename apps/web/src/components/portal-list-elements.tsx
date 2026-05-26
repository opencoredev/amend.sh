import { cn } from "@amend/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

import AmendLogo from "@/components/amend-logo";

export function PortalSkeleton({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <main className="min-h-svh bg-background px-4 py-5 text-foreground sm:px-6">
      <div className="mx-auto max-w-5xl">
        <AmendLogo size="md" markVariant="soft" />
        <div className="grid gap-4 py-20">
          <p className="text-sm text-muted-foreground">{workspaceSlug}.amend.sh</p>
          <div className="h-10 max-w-md rounded-lg bg-muted" />
          <div className="h-4 max-w-xl rounded-lg bg-muted" />
          <div className="h-56 rounded-lg border bg-card" />
        </div>
      </div>
    </main>
  );
}

export function BoardRow({
  active,
  count,
  href,
  label,
}: {
  active?: boolean;
  count: number;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors duration-150 ease-linear hover:bg-muted/70 hover:text-foreground",
        active ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground",
      )}
    >
      <span className={cn("size-2 rounded-full", active ? "bg-primary" : "bg-muted-foreground")} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="rounded-full border bg-background px-2 text-xs">{count}</span>
    </a>
  );
}

export function EmptyState({
  icon: Icon,
  text,
  title,
}: {
  icon: LucideIcon;
  text: string;
  title: string;
}) {
  return (
    <div className="grid place-items-center px-4 py-14 text-center">
      <span className="grid size-16 place-items-center rounded-full border bg-muted/40">
        <Icon className="size-8 text-muted-foreground" />
      </span>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
