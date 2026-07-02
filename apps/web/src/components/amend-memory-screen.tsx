/**
 * PHASE 5 — Memory ("what Amend learned"). Polish-critical.
 *
 * Wears the same chrome as Feedback/Roadmap/Changelog: the full dashboard header
 * bar, a toolbar of kind filters, then the shared workspace surface holding the
 * rules as a clean divided list. Each row leads with the rule itself (the plain-
 * language sentence the agent now follows); a quiet meta line carries its kind,
 * who taught it, and when. Reach ("~212/mo", warm when high enough to re-check),
 * the pause toggle, and a hover-only Forget sit on the right — the Canny/Linear
 * rules pattern, not a wall of switches.
 */
import { cn } from "@amend/ui/lib/utils";
import { type ReactNode, useState } from "react";

import { EmptyState, ErrorState, IconButton, SkeletonBar } from "@/components/amend-agent-shared";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { ToolbarBar, ToolbarGroup, ToolbarPill } from "@/components/dashboard-toolbar";
import { PageHeader } from "@/components/amend-agent-chrome";
import type { MemoryRule, MemoryRuleKind } from "@/lib/amend-contract";
import { relativeFromNow } from "@/lib/amend-agent-format";
import { useMemoryRules, useToggleRule, useUndoRule } from "@/lib/amend-data";
import {
  AiMagic,
  Brain,
  Check,
  Copy,
  Filter,
  Info,
  ShieldCheck,
  Sparkles,
  Undo2,
  type LucideIcon,
} from "@/lib/icons";
import { toast } from "@/lib/toast";

const KIND_ORDER: MemoryRuleKind[] = ["noise", "dedupe", "addressed", "allowlist", "pattern"];

const kindMeta: Record<
  MemoryRuleKind,
  { label: string; short: string; Icon: LucideIcon; verb: string }
> = {
  noise: { label: "Noise it skips", short: "Noise", Icon: Filter, verb: "hides" },
  dedupe: { label: "Things it merges", short: "Merges", Icon: Copy, verb: "merges" },
  addressed: { label: "Already handled", short: "Handled", Icon: Check, verb: "hides" },
  allowlist: { label: "Always surface", short: "Always", Icon: ShieldCheck, verb: "always shows" },
  pattern: { label: "Patterns it watches", short: "Patterns", Icon: AiMagic, verb: "tags" },
};

const AUDIT_THRESHOLD = 150;

function blastPhrase(rule: MemoryRule): string {
  return `${kindMeta[rule.kind].verb} ~${rule.blastRadius}/mo`;
}

/** Quiet right-aligned toggle — pause/resume a rule without a loud green anchor. */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ease-linear outline-none focus-visible:ring-2 focus-visible:ring-ring/45",
        checked ? "bg-amend-success" : "bg-white/[0.16]",
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

function RuleRow({ rule }: { rule: MemoryRule }) {
  const { short, label, Icon } = kindMeta[rule.kind];
  const needsAudit =
    rule.enabled && rule.blastRadius >= AUDIT_THRESHOLD && rule.kind !== "allowlist";
  const toggleRule = useToggleRule();
  const undoRule = useUndoRule();

  function onForget() {
    void undoRule(rule.id);
    toast.success({
      title: "Unlearned",
      description: "Amend dropped this rule and won't apply it anymore.",
    });
  }

  return (
    <article className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 transition-colors duration-150 ease-linear hover:bg-foreground/[0.04] md:px-6">
      {/* The rule itself is the hero — lead with the sentence, not a control. */}
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm leading-snug",
            rule.enabled ? "text-foreground/90" : "text-muted-foreground/55",
          )}
        >
          {rule.text}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {/* Bare kind glyph — no chip, no box. */}
          <span className="inline-flex items-center gap-1.5" title={label}>
            <Icon className="size-3.5 opacity-60" />
            {short}
          </span>
          <span className="opacity-30">·</span>
          <span>
            taught by <span className="text-foreground/65">{rule.taughtBy}</span>
          </span>
          <span className="opacity-30">·</span>
          <span>{relativeFromNow(rule.taughtAt)}</span>
        </div>
      </div>

      {/* Right rail: impact stat, the quiet pause toggle, and a hover-only Forget. */}
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={cn(
            "hidden items-center gap-1 font-mono text-xs tabular-nums sm:inline-flex",
            needsAudit ? "text-amend-warm" : "text-muted-foreground/55",
          )}
          title={needsAudit ? "High reach — worth re-checking this still fits" : blastPhrase(rule)}
        >
          {needsAudit ? <Info className="size-3" /> : null}~{rule.blastRadius}
          <span className="opacity-50">/mo</span>
        </span>
        <Switch
          checked={rule.enabled}
          onChange={(next) => void toggleRule(rule.id, next)}
          label={`${rule.enabled ? "Pause" : "Resume"} rule: ${rule.text}`}
        />
        <IconButton
          className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
          aria-label="Forget this rule"
          title="Forget — make Amend unlearn this"
          onClick={onForget}
        >
          <Undo2 />
        </IconButton>
      </div>
    </article>
  );
}

/** Memory's domain signal — how much noise the active rules filter each month —
 *  sits in the header actions slot, where Feedback/Roadmap keep Search + Sort. */
function FilteringStat({ filteredPerMonth }: { filteredPerMonth: number }) {
  if (filteredPerMonth <= 0) return null;
  return (
    <div className="hidden h-10 items-center gap-2 rounded-xl bg-amend-inset px-3.5 text-sm ring-1 ring-white/[0.055] sm:flex">
      <Sparkles className="size-3.5 text-amend-success" />
      <span className="text-muted-foreground">Filtering</span>
      <span className="font-mono font-semibold tabular-nums text-foreground">
        ~{filteredPerMonth}
      </span>
      <span className="text-muted-foreground">/ mo</span>
    </div>
  );
}

function MemoryToolbar({
  activeKind,
  onKindChange,
  presentKinds,
  rules,
}: {
  activeKind: MemoryRuleKind | "all";
  onKindChange: (kind: MemoryRuleKind | "all") => void;
  presentKinds: MemoryRuleKind[];
  rules: MemoryRule[];
}) {
  return (
    <ToolbarBar>
      <ToolbarGroup>
        <ToolbarPill
          active={activeKind === "all"}
          count={rules.length}
          onClick={() => onKindChange("all")}
        >
          All
        </ToolbarPill>
        {presentKinds.map((kind) => (
          <ToolbarPill
            key={kind}
            active={activeKind === kind}
            count={rules.filter((rule) => rule.kind === kind).length}
            onClick={() => onKindChange(kind)}
          >
            {kindMeta[kind].short}
          </ToolbarPill>
        ))}
      </ToolbarGroup>
    </ToolbarBar>
  );
}

function CenteredSurface({ children }: { children: ReactNode }) {
  return <div className="grid min-h-0 flex-1 place-items-center p-6">{children}</div>;
}

function MemorySkeleton() {
  return (
    <div className="grid divide-y divide-white/[0.045]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 md:px-6"
        >
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-3/4" />
            <SkeletonBar className="h-3 w-1/2" />
          </div>
          <SkeletonBar className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function AmendMemoryScreen() {
  const { data, isLoading, isError } = useMemoryRules();
  const [activeKind, setActiveKind] = useState<MemoryRuleKind | "all">("all");
  const rules = data ?? [];

  const enabled = rules.filter((r) => r.enabled);
  const filteredPerMonth = enabled
    .filter((r) => r.kind === "noise" || r.kind === "dedupe" || r.kind === "addressed")
    .reduce((sum, r) => sum + r.blastRadius, 0);

  const presentKinds = KIND_ORDER.filter((kind) => rules.some((r) => r.kind === kind));
  const effectiveKind =
    activeKind !== "all" && presentKinds.includes(activeKind) ? activeKind : "all";
  // Show in kind order so a filtered or "all" list always reads top-to-bottom the
  // same way the toolbar pills do.
  const visible = KIND_ORDER.flatMap((kind) =>
    effectiveKind === "all" || effectiveKind === kind ? rules.filter((r) => r.kind === kind) : [],
  );

  const hasRules = !isLoading && !isError && rules.length > 0;

  return (
    <>
      <PageHeader
        className="relative z-20 bg-background"
        icon={Brain}
        title="Memory"
        actions={<FilteringStat filteredPerMonth={filteredPerMonth} />}
        filters={
          hasRules ? (
            <MemoryToolbar
              activeKind={effectiveKind}
              onKindChange={setActiveKind}
              presentKinds={presentKinds}
              rules={rules}
            />
          ) : undefined
        }
      />

      <DashboardWorkspaceSurface>
        {isError ? (
          <CenteredSurface>
            <ErrorState />
          </CenteredSurface>
        ) : isLoading ? (
          <MemorySkeleton />
        ) : rules.length === 0 ? (
          <CenteredSurface>
            <EmptyState
              icon={Brain}
              title="Amend hasn't learned anything yet"
              hint="Every time you kill a ghost or correct the agent, it remembers — and those rules show up here, in plain language, for you to audit."
            />
          </CenteredSurface>
        ) : (
          <div className="grid divide-y divide-white/[0.045]">
            {visible.map((rule) => (
              <RuleRow key={rule.id} rule={rule} />
            ))}
          </div>
        )}
      </DashboardWorkspaceSurface>
    </>
  );
}
