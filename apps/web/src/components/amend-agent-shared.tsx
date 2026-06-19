/**
 * Shared primitives for the proactive-agent console.
 *
 * One small design system, locked to the existing Amend dark theme: rounded
 * surfaces, hairline white rings, mono for data, a single warm accent for
 * "paying" and a single success accent for "ready". Status color does the
 * semantic work; everything else stays grayscale on purpose.
 */
import { cn } from "@amend/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

import {
  AlertCircle,
  Discord,
  Github,
  GitMerge,
  Globe,
  LifeBuoy,
  Loader2,
  Sparkles,
  type LucideIcon,
} from "@/lib/icons";
import type {
  ConfidenceBucket,
  Proof,
  ProofStrength,
  ShipLink,
  SourceChannel,
} from "@/lib/amend-contract";
import { formatDayMonth, strengthLabel, strengthSegments } from "@/lib/amend-agent-format";

// ---------------------------------------------------------------------------
// Source channels
// ---------------------------------------------------------------------------

export const channelMeta: Record<SourceChannel, { label: string; Icon: LucideIcon }> = {
  discord: { label: "Discord", Icon: Discord },
  support: { label: "Support", Icon: LifeBuoy },
  github: { label: "GitHub", Icon: Github },
  embed: { label: "Embed", Icon: Globe },
};

export function ChannelGlyph({
  channel,
  className,
}: {
  channel: SourceChannel;
  className?: string;
}) {
  const { Icon, label } = channelMeta[channel];
  return <Icon aria-label={label} className={cn("size-3.5", className)} />;
}

/** Neutral source chip with a mono count — color stays reserved for status. */
export function SourceChip({ channel, count }: { channel: SourceChannel; count: number }) {
  const { label } = channelMeta[channel];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] py-1 pl-1.5 pr-2 text-[0.7rem] text-muted-foreground ring-1 ring-white/[0.06] ring-inset">
      <ChannelGlyph channel={channel} className="opacity-80" />
      <span className="font-medium">{label}</span>
      <span className="font-mono tabular-nums text-foreground/55">{count}</span>
    </span>
  );
}

export function SourceChips({
  sources,
  className,
}: {
  sources: { channel: SourceChannel; count: number }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {sources.map((s) => (
        <SourceChip key={s.channel} channel={s.channel} count={s.count} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Proof: strength meter + because-line
// ---------------------------------------------------------------------------

const strengthFill: Record<ProofStrength, string> = {
  thin: "bg-muted-foreground/45",
  building: "bg-foreground/70",
  strong: "bg-amend-success",
};

export function StrengthMeter({
  strength,
  withLabel = true,
  className,
}: {
  strength: ProofStrength;
  withLabel?: boolean;
  className?: string;
}) {
  const filled = strengthSegments(strength);
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="flex items-center gap-1"
        role="img"
        aria-label={`Proof strength: ${strengthLabel(strength)}`}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-5 rounded-full transition-colors",
              i < filled ? strengthFill[strength] : "bg-white/[0.09]",
            )}
          />
        ))}
      </span>
      {withLabel ? (
        <span
          className={cn(
            "text-[0.72rem] font-semibold",
            strength === "strong" ? "text-amend-success" : "text-muted-foreground",
          )}
        >
          {strengthLabel(strength)}
        </span>
      ) : null}
    </span>
  );
}

/** "12 people · 3 paying · across 3 sources" — paying carries the warm accent. */
export function ProofLine({ proof, className }: { proof: Proof; className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      <span className="font-mono font-semibold tabular-nums text-foreground">{proof.people}</span>{" "}
      people
      {proof.payingPeople > 0 ? (
        <>
          {" · "}
          <span className="font-mono font-semibold tabular-nums text-amend-warm">
            {proof.payingPeople} paying
          </span>
        </>
      ) : null}
      {" · across "}
      <span className="font-mono font-semibold tabular-nums text-foreground">
        {proof.sources.length}
      </span>{" "}
      {proof.sources.length === 1 ? "source" : "sources"}
    </p>
  );
}

// ---------------------------------------------------------------------------
// People spine — avatars
// ---------------------------------------------------------------------------

export function initialsOf(name: string): string {
  const clean = name
    .replace(/^@/, "")
    .replace(/[·•|].*/, "")
    .trim();
  const parts = clean.split(/[\s_\-./]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase() || "?";
}

const avatarSize = {
  sm: "size-6 text-[0.58rem]",
  md: "size-7 text-[0.62rem]",
  lg: "size-9 text-[0.7rem]",
} as const;

export function Avatar({
  name,
  size = "md",
  className,
  title,
}: {
  name: string;
  size?: keyof typeof avatarSize;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title ?? name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-semibold text-muted-foreground ring-1 ring-white/[0.1] ring-inset select-none",
        avatarSize[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

export function AvatarStack({
  names,
  max = 5,
  size = "md",
}: {
  names: string[];
  max?: number;
  size?: keyof typeof avatarSize;
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <Avatar
          key={`${name}-${i}`}
          name={name}
          size={size}
          className={cn("ring-2 ring-[#151518]", i > 0 && "-ml-2")}
        />
      ))}
      {extra > 0 ? (
        <span
          className={cn(
            "-ml-2 inline-flex items-center justify-center rounded-full bg-white/[0.05] font-mono font-medium text-muted-foreground ring-2 ring-[#151518]",
            avatarSize[size],
          )}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ship proof (SHA)
// ---------------------------------------------------------------------------

export function ShaChip({ ship, className }: { ship: ShipLink; className?: string }) {
  return (
    <a
      href={ship.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group/sha inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] py-1 pl-1.5 pr-2 font-mono text-[0.7rem] ring-1 ring-white/[0.07] ring-inset transition-colors hover:bg-white/[0.07]",
        className,
      )}
    >
      <GitMerge className="size-3 text-amend-success" />
      <span className="font-semibold text-foreground">#{ship.prNumber}</span>
      <span className="text-muted-foreground/70 group-hover/sha:text-muted-foreground">
        {ship.sha}
      </span>
      {ship.releaseTag ? (
        <span className="rounded bg-white/[0.06] px-1 py-px text-[0.62rem] text-muted-foreground">
          {ship.releaseTag}
        </span>
      ) : null}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

export const confidenceMeta: Record<ConfidenceBucket, { label: string; dot: string }> = {
  clear: { label: "Clear", dot: "bg-foreground" },
  "worth-a-look": { label: "Worth a look", dot: "bg-muted-foreground" },
  unsure: { label: "Unsure", dot: "bg-transparent ring-1 ring-muted-foreground/55 ring-inset" },
};

export function ConfidenceTag({ bucket }: { bucket: ConfidenceBucket }) {
  const { label, dot } = confidenceMeta[bucket];
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Agent identity mark
// ---------------------------------------------------------------------------

export function AgentMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg bg-amend-success/12 text-amend-success ring-1 ring-amend-success/20 ring-inset",
        className,
      )}
    >
      <Sparkles className="size-4" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Buttons (rounded theme — the square @amend/ui Button is legacy)
// ---------------------------------------------------------------------------

type ActionVariant = "primary" | "secondary" | "ghost" | "success" | "danger";
type ActionSize = "sm" | "md";

const actionBase =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition-colors duration-150 ease-linear outline-none select-none active:opacity-75 disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring/45 [&_svg]:shrink-0";

const actionVariant: Record<ActionVariant, string> = {
  primary: "border border-foreground bg-foreground text-background hover:bg-foreground/85",
  secondary:
    "bg-white/[0.04] text-foreground ring-1 ring-white/[0.09] ring-inset hover:bg-white/[0.07]",
  ghost: "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
  success:
    "border border-amend-success/25 bg-amend-success/12 text-amend-success hover:bg-amend-success/[0.18]",
  danger: "text-muted-foreground hover:bg-destructive/12 hover:text-destructive",
};

const actionSize: Record<ActionSize, string> = {
  sm: "h-7 px-2.5 text-[0.72rem] [&_svg]:size-3.5",
  md: "h-8 px-3 text-xs [&_svg]:size-4",
};

export function agentButtonClass(
  variant: ActionVariant = "secondary",
  size: ActionSize = "md",
  className?: string,
) {
  return cn(actionBase, actionVariant[variant], actionSize[size], className);
}

export function ActionButton({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ActionVariant; size?: ActionSize }) {
  return <button className={agentButtonClass(variant, size, className)} {...props} />;
}

export function IconButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 ease-linear hover:bg-white/[0.06] hover:text-foreground active:opacity-75 disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring/45 [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Surfaces, labels, states
// ---------------------------------------------------------------------------

export function SectionLabel({
  children,
  count,
  className,
}: {
  children: ReactNode;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/55">
        {children}
      </h2>
      {typeof count === "number" ? (
        <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground/40">
          {count}
        </span>
      ) : null}
    </div>
  );
}

export function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.05]", className)} />;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  hint,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.012] px-6 py-14 text-center">
      <span className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.07] ring-inset">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {hint ? <p className="mt-1 max-w-sm text-xs text-muted-foreground">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/25 bg-destructive/[0.04] px-6 py-14 text-center">
      <span className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/20 ring-inset">
        <AlertCircle className="size-5" />
      </span>
      <p className="text-sm font-semibold text-foreground">Couldn't load this just now</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        The agent is reachable but this view hit an error. It'll retry on its own.
      </p>
      {onRetry ? (
        <ActionButton variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <Loader2 className="size-3.5" />
          Try again
        </ActionButton>
      ) : null}
    </div>
  );
}

/** Shared date helper re-export so screens don't import format + shared both. */
export { formatDayMonth };
