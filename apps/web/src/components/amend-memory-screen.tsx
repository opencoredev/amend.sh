/**
 * PHASE 5 — Memory ("what Amend learned"). Polish-critical.
 *
 * Every rule is a plain-language sentence the agent now follows, grouped by what
 * it does (skips / merges / already-handled / always-surface / patterns). Each
 * shows who taught it, when, and its blast radius ("hides ~212/mo"), with a
 * toggle and an undo. High-blast filters get an audit nudge so a quiet rule
 * can't silently swallow the wrong things forever.
 */
import { cn } from "@amend/ui/lib/utils";
import { useState } from "react";

import {
  AgentMark,
  EmptyState,
  ErrorState,
  IconButton,
  SkeletonBar,
} from "@/components/amend-agent-shared";
import { PageHeader, PageScroll } from "@/components/amend-agent-chrome";
import type { MemoryRule, MemoryRuleKind } from "@/lib/amend-contract";
import { relativeFromNow } from "@/lib/amend-agent-format";
import { toggleRule, undoRule, useMemoryRules } from "@/lib/mock-amend";
import {
  AiMagic,
  Brain,
  Check,
  Copy,
  Filter,
  Info,
  ShieldCheck,
  Undo2,
  type LucideIcon,
} from "@/lib/icons";
import { toast } from "@/lib/toast";

const KIND_ORDER: MemoryRuleKind[] = ["noise", "dedupe", "addressed", "allowlist", "pattern"];

const kindMeta: Record<
  MemoryRuleKind,
  { label: string; hint: string; Icon: LucideIcon; verb: string }
> = {
  noise: {
    label: "Noise it skips",
    hint: "Signals the agent stays quiet about",
    Icon: Filter,
    verb: "hides",
  },
  dedupe: {
    label: "Things it merges",
    hint: "Different words, one need",
    Icon: Copy,
    verb: "merges",
  },
  addressed: {
    label: "Already handled",
    hint: "Won't resurface what you've shipped",
    Icon: Check,
    verb: "hides",
  },
  allowlist: {
    label: "Always surface",
    hint: "Never filtered, even a one-liner",
    Icon: ShieldCheck,
    verb: "always shows",
  },
  pattern: {
    label: "Patterns it watches",
    hint: "Tags and raises priority",
    Icon: AiMagic,
    verb: "tags",
  },
};

function blastPhrase(rule: MemoryRule): string {
  return `${kindMeta[rule.kind].verb} ~${rule.blastRadius}/mo`;
}

const AUDIT_THRESHOLD = 150;

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

function AuditNudge({ rule }: { rule: MemoryRule }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg bg-amend-warm/[0.06] px-2.5 py-2 ring-1 ring-amend-warm/15 ring-inset">
      <Info className="mt-px size-3.5 shrink-0 text-amend-warm" />
      <p className="text-[0.7rem] leading-relaxed text-foreground/75">
        This rule {kindMeta[rule.kind].verb}{" "}
        <span className="font-mono font-semibold tabular-nums text-amend-warm">
          ~{rule.blastRadius}
        </span>{" "}
        items a month — still right?
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-auto shrink-0 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        It's right
      </button>
    </div>
  );
}

function RuleRow({ rule }: { rule: MemoryRule }) {
  const needsAudit =
    rule.enabled && rule.blastRadius >= AUDIT_THRESHOLD && rule.kind !== "allowlist";

  function onToggle(next: boolean) {
    toggleRule(rule.id, next);
    toast.info({
      title: next ? "Rule on" : "Rule paused",
      description: next
        ? "The agent will apply it again."
        : "The agent will stop applying it until you switch it back.",
    });
  }

  function onUndo() {
    undoRule(rule.id);
    toast.success({
      title: "Unlearned",
      description: "Amend dropped this rule and won't apply it anymore.",
    });
  }

  return (
    <div className="flex items-start gap-3 py-3.5">
      <div className="pt-0.5">
        <Switch checked={rule.enabled} onChange={onToggle} label={`Toggle: ${rule.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-relaxed",
            rule.enabled ? "text-foreground/90" : "text-muted-foreground",
          )}
        >
          {rule.text}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-muted-foreground">
          <span>
            Taught by <span className="text-foreground/70">{rule.taughtBy}</span>
          </span>
          <span className="opacity-40">·</span>
          <span>{relativeFromNow(rule.taughtAt)}</span>
          <span className="opacity-40">·</span>
          <span className="font-mono tabular-nums text-foreground/60">{blastPhrase(rule)}</span>
          {!rule.enabled ? (
            <span className="rounded bg-white/[0.05] px-1.5 py-px text-[0.62rem] font-medium text-muted-foreground">
              Off
            </span>
          ) : null}
        </div>
        {needsAudit ? <AuditNudge rule={rule} /> : null}
      </div>
      <IconButton
        aria-label="Undo this rule"
        title="Undo — make Amend forget this"
        onClick={onUndo}
      >
        <Undo2 />
      </IconButton>
    </div>
  );
}

function RuleGroup({ kind, rules }: { kind: MemoryRuleKind; rules: MemoryRule[] }) {
  const { label, hint, Icon } = kindMeta[kind];
  return (
    <section>
      <div className="mb-2 flex items-center gap-2.5">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.06] ring-inset [&_svg]:size-3.5">
          <Icon />
        </span>
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground/45">
          {rules.length}
        </span>
        <span className="ml-1 hidden text-[0.72rem] text-muted-foreground/70 sm:inline">
          {hint}
        </span>
      </div>
      <div className="divide-y divide-white/[0.04] rounded-2xl bg-white/[0.015] px-4 ring-1 ring-white/[0.05] ring-inset">
        {rules.map((rule) => (
          <RuleRow key={rule.id} rule={rule} />
        ))}
      </div>
    </section>
  );
}

function MemorySkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonBar className="h-20 rounded-2xl" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBar className="h-4 w-40" />
          <SkeletonBar className="h-28 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

export function AmendMemoryScreen() {
  const { data, isLoading, isError } = useMemoryRules();
  const rules = data ?? [];

  const enabled = rules.filter((r) => r.enabled);
  const filteredPerMonth = enabled
    .filter((r) => r.kind === "noise" || r.kind === "dedupe" || r.kind === "addressed")
    .reduce((sum, r) => sum + r.blastRadius, 0);

  const groups = KIND_ORDER.map((kind) => ({
    kind,
    rules: rules.filter((r) => r.kind === kind),
  })).filter((g) => g.rules.length > 0);

  return (
    <>
      <PageHeader
        icon={Brain}
        title="Memory"
        subtitle="What Amend has learned from your decisions"
      />
      <PageScroll routeKey="memory" className="max-w-3xl space-y-8">
        {isError ? (
          <ErrorState />
        ) : isLoading ? (
          <MemorySkeleton />
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="Amend hasn't learned anything yet"
            hint="Every time you kill a ghost or correct the agent, it remembers — and those rules show up here, in plain language, for you to audit."
          />
        ) : (
          <>
            <section className="rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/[0.05] ring-inset sm:p-5">
              <div className="flex items-start gap-3">
                <AgentMark />
                <p className="text-sm leading-relaxed text-foreground/90">
                  Amend is quietly filtering{" "}
                  <span className="font-mono font-semibold tabular-nums">~{filteredPerMonth}</span>{" "}
                  items a month so the board only shows what matters — from{" "}
                  <span className="font-mono font-semibold tabular-nums">{enabled.length}</span>{" "}
                  {enabled.length === 1 ? "rule" : "rules"} you taught it. Toggle or undo any of
                  them.
                </p>
              </div>
            </section>

            {groups.map((g) => (
              <RuleGroup key={g.kind} kind={g.kind} rules={g.rules} />
            ))}
          </>
        )}
      </PageScroll>
    </>
  );
}
