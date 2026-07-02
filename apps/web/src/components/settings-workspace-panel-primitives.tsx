import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

/**
 * Shared settings design system — an airy, hairline-divided list à la Linear /
 * Notion. Quiet section headings sit above rows of `label + description` ↔
 * control, divided by full-width hairlines. No boxed cards, no Save buttons:
 * the page auto-saves and reports status in the toolbar.
 */

/** Inset field surface used by every editable settings input. */
export const settingsFieldClass =
  "h-9 rounded-lg border-transparent bg-amend-inset text-sm text-foreground ring-1 ring-white/[0.055] transition-[box-shadow,background-color] duration-150 ease-linear placeholder:text-muted-foreground/70 focus-visible:ring-white/[0.18]";

/** Dark, ring-bordered secondary action (upload, load, open…). */
export const settingsSecondaryButtonClass =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 text-xs font-medium text-muted-foreground ring-1 ring-white/[0.08] ring-inset transition-colors duration-150 ease-linear hover:bg-white/[0.07] hover:text-foreground active:opacity-75 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0";

export function SettingsInput({ className, ...props }: ComponentProps<typeof Input>) {
  return <Input className={cn(settingsFieldClass, className)} {...props} />;
}

/** A titled section: quiet heading over a hairline-divided list of rows. */
export function SettingsSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: ReactNode;
  title: string;
}) {
  return (
    <section>
      <div className="pb-1">
        <h2 className="text-[0.95rem] font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="divide-y divide-white/[0.06]">{children}</div>
    </section>
  );
}

/** Compact-control row: label + description on the left, a control on the right. */
export function SettingsRow({
  children,
  control,
  description,
  label,
}: {
  children?: ReactNode;
  control?: ReactNode;
  description?: ReactNode;
  label: ReactNode;
}) {
  const right = control ?? children;
  return (
    <div className="flex flex-col gap-2.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0 sm:max-w-md">
        <div className="text-sm font-medium leading-snug text-foreground">{label}</div>
        {description ? (
          <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {right ? (
        <div className="flex shrink-0 items-center gap-2 sm:justify-end">{right}</div>
      ) : null}
    </div>
  );
}

/** Wide-control field: label + description stacked above a full-width control. */
export function SettingsField({
  children,
  description,
  label,
}: {
  children: ReactNode;
  description?: ReactNode;
  label: string;
}) {
  return (
    <div className="py-4">
      <div className="pb-3">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description ? (
          <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Toggle switch — promoted from the Memory screen so settings can reuse it. */
export function SettingsSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange?: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange ? () => onChange(!checked) : undefined}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ease-linear outline-none focus-visible:ring-2 focus-visible:ring-ring/45",
        checked ? "bg-amend-success" : "bg-white/[0.14]",
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out",
          checked ? "translate-x-[1.15rem]" : "translate-x-[0.15rem]",
        )}
      />
    </button>
  );
}

type PillTone = "info" | "neutral" | "success" | "warm";

const pillTones: Record<PillTone, string> = {
  info: "bg-amend-info/12 text-amend-info ring-amend-info/25",
  neutral: "bg-white/[0.05] text-muted-foreground ring-white/[0.08]",
  success: "bg-amend-success/12 text-amend-success ring-amend-success/20",
  warm: "bg-amend-warm/12 text-amend-warm ring-amend-warm/20",
};

/** Small status pill for service / connection state. */
export function StatePill({
  children,
  dot = false,
  tone = "neutral",
}: {
  children: ReactNode;
  dot?: boolean;
  tone?: PillTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ring-1 ring-inset",
        pillTones[tone],
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

function initialsFrom(name: string | undefined, email: string) {
  const base = (name ?? "").trim();
  if (base) {
    const parts = base.split(/\s+/);
    const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.trim();
    return (initials || base.slice(0, 2)).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

/** Initials avatar for member rows. */
export function SettingsAvatar({ email, name }: { email: string; name?: string }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.05] text-xs font-semibold text-foreground ring-1 ring-white/[0.08] ring-inset">
      {initialsFrom(name, email)}
    </span>
  );
}
