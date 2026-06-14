import type { ComponentType } from "react";

import AmendLogo from "@/components/amend-logo";

/** Elevated content surface — pure shadcn tokens so any portal theme themes it. */
export const PORTAL_SURFACE =
  "rounded-xl border border-border bg-card text-card-foreground shadow-sm";

/** Compact status chip built from theme tokens. */
export const PORTAL_CHIP =
  "shrink-0 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground";

export function PortalSkeleton({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <main className="dark min-h-svh bg-background p-3 text-foreground">
      <div className="min-h-[calc(100svh-1.5rem)] rounded-2xl border border-border bg-background px-5 py-6 shadow-2xl sm:px-8">
        <AmendLogo size="md" markVariant="soft" />
        <div className="mx-auto grid max-w-3xl gap-4 py-16">
          <p className="text-sm text-muted-foreground">{workspaceSlug}.amend.sh</p>
          <div className="h-9 max-w-md animate-pulse rounded-lg bg-muted" />
          <div className="h-4 max-w-xl animate-pulse rounded-lg bg-muted" />
          <div className={`h-56 ${PORTAL_SURFACE}`} />
        </div>
      </div>
    </main>
  );
}

export function EmptyState({
  icon: Icon,
  text,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
  title: string;
}) {
  return (
    <div className="grid place-items-center px-4 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-border bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </span>
      <h3 className="mt-5 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
