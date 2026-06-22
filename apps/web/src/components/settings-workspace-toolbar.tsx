import { Check, Loader2 } from "@/lib/icons";

import type { SettingsSection } from "@/components/amend-dashboard-types";
import { ToolbarBar, ToolbarGroup, ToolbarPill } from "@/components/dashboard-toolbar";
import type { AutoSaveStatus } from "@/components/use-settings-autosave";

const SECTIONS: Array<{ id: SettingsSection; label: string }> = [
  { id: "general", label: "General" },
  { id: "services", label: "Connected services" },
  { id: "portal", label: "Public portal" },
  { id: "tags", label: "Tags" },
  { id: "automation", label: "Automation" },
  { id: "accounts", label: "Accounts" },
];

/** Section sub-nav, rendered in the page header above the settings surface. */
export function SettingsSectionNav({
  activeSection,
  onSectionChange,
}: {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}) {
  return (
    <ToolbarBar>
      <ToolbarGroup>
        {SECTIONS.map((section) => (
          <ToolbarPill
            key={section.id}
            active={activeSection === section.id}
            onClick={() => onSectionChange(section.id)}
          >
            {section.label}
          </ToolbarPill>
        ))}
      </ToolbarGroup>
    </ToolbarBar>
  );
}

/**
 * Calm, always-present auto-save status — the changelog editor's affordance,
 * brought to settings: a spinner + "Saving…" while a write is pending, a tidy
 * "Saved" at rest, and a one-tap retry on failure. Sits beside the project
 * identity now that the section nav lives in the header.
 */
export function SettingsAutoSaveIndicator({
  canSave,
  isDirty,
  onRetry,
  status,
}: {
  canSave: boolean;
  isDirty: boolean;
  onRetry: () => void;
  status: AutoSaveStatus;
}) {
  if (!canSave) return null;

  const base =
    "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-white/[0.03] px-2.5 text-xs font-medium ring-1 ring-inset transition-colors duration-150 ease-linear";

  if (status === "error") {
    return (
      <span className={`${base} text-amber-300 ring-amber-400/25`}>
        Couldn’t save
        <button
          type="button"
          className="font-semibold text-foreground underline-offset-2 transition-colors hover:underline active:opacity-75"
          onClick={onRetry}
        >
          Retry
        </button>
      </span>
    );
  }

  if (status === "saving" || isDirty) {
    return (
      <span aria-live="polite" className={`${base} text-muted-foreground ring-white/[0.07]`}>
        <Loader2 className="size-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  return (
    <span aria-live="polite" className={`${base} text-muted-foreground ring-white/[0.07]`}>
      <Check className="size-3.5 text-emerald-400" />
      Saved
    </span>
  );
}
