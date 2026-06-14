import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import { Check, Globe, Sparkles } from "@/lib/icons";

import { SettingsPanel } from "@/components/amend-dashboard-shared";
import {
  SettingsField,
  SettingsSaveButton,
} from "@/components/settings-workspace-panel-primitives";
import type { SettingsSavingState } from "@/components/settings-workspace-panel-types";
import {
  CUSTOM_PORTAL_THEME_ID,
  getPortalThemePreset,
  parseThemeCss,
  PORTAL_THEME_PRESETS,
  type PortalThemeAppearance,
  type ResolvedPortalTheme,
  portalThemeStyleVars,
  portalThemeSwatch,
  resolvePortalTheme,
} from "@/lib/portal-themes";

export function PortalSettingsPanel({
  canSave,
  customThemeCss,
  headline,
  intro,
  onPortalSave,
  saving,
  setCustomThemeCss,
  setHeadline,
  setIntro,
  setThemeAppearance,
  setThemePreset,
  themeAppearance,
  themePreset,
}: {
  canSave: boolean;
  customThemeCss: string;
  headline: string;
  intro: string;
  onPortalSave: () => void;
  saving: SettingsSavingState;
  setCustomThemeCss: (value: string) => void;
  setHeadline: (value: string) => void;
  setIntro: (value: string) => void;
  setThemeAppearance: (value: PortalThemeAppearance) => void;
  setThemePreset: (value: string) => void;
  themeAppearance: PortalThemeAppearance;
  themePreset: string;
}) {
  const isCustom = themePreset === CUSTOM_PORTAL_THEME_ID;
  // Parse the custom CSS once and share it with the preview resolver, instead
  // of letting resolvePortalTheme re-parse the same string on every keystroke.
  const customParse = isCustom ? parseThemeCss(customThemeCss) : null;
  const preview = resolvePortalTheme(
    { customThemeCss, themeAppearance, themePreset },
    customParse ?? undefined,
  );

  function selectPreset(id: string) {
    setThemePreset(id);
    const preset = getPortalThemePreset(id);
    if (preset) {
      setThemeAppearance(preset.defaultAppearance);
    }
  }

  return (
    <SettingsPanel
      action={
        <SettingsSaveButton disabled={!canSave || saving === "portal"} onClick={onPortalSave} />
      }
      icon={<Globe />}
      title="Public portal"
    >
      <SettingsField label="Theme">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PORTAL_THEME_PRESETS.map((preset) => {
            const swatch = portalThemeSwatch(preset);
            const selected = themePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectPreset(preset.id)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border text-left transition-colors duration-150 ease-linear",
                  selected
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border hover:border-foreground/40",
                )}
              >
                <span
                  className="flex h-12 items-end gap-1.5 p-2"
                  style={{ backgroundColor: swatch.background }}
                >
                  <span
                    className="h-5 flex-1 rounded-md"
                    style={{ backgroundColor: swatch.card, border: `1px solid ${swatch.border}` }}
                  />
                  <span
                    className="size-5 rounded-full"
                    style={{ backgroundColor: swatch.primary }}
                  />
                </span>
                <span className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                  <span className="truncate text-xs font-medium">{preset.label}</span>
                  {selected ? <Check className="size-3.5 shrink-0 text-foreground" /> : null}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={isCustom}
            onClick={() => setThemePreset(CUSTOM_PORTAL_THEME_ID)}
            className={cn(
              "flex min-h-[4.75rem] flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center transition-colors duration-150 ease-linear",
              isCustom
                ? "border-foreground text-foreground ring-1 ring-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            <Sparkles className="size-4" />
            <span className="text-xs font-medium">Custom</span>
          </button>
        </div>
      </SettingsField>

      <SettingsField label="Appearance">
        <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
          {(["light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={themeAppearance === mode}
              onClick={() => setThemeAppearance(mode)}
              className={cn(
                "h-8 rounded-md px-4 text-xs font-semibold capitalize transition-colors duration-150 ease-linear",
                themeAppearance === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </SettingsField>

      <SettingsField label="Preview">
        <PortalThemePreview theme={preview} />
      </SettingsField>

      {isCustom ? (
        <SettingsField label="Custom theme CSS">
          <textarea
            value={customThemeCss}
            onChange={(event) => setCustomThemeCss(event.target.value)}
            spellCheck={false}
            placeholder={
              ":root {\n  --background: oklch(...);\n  --primary: oklch(...);\n}\n.dark {\n  --background: oklch(...);\n}"
            }
            className="min-h-40 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs leading-5 outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {customThemeCss.trim() ? (
              customParse?.light || customParse?.dark ? (
                <span className="text-emerald-500">
                  Detected{" "}
                  {[customParse.light && "light", customParse.dark && "dark"]
                    .filter(Boolean)
                    .join(" + ")}{" "}
                  · {countTokens(customParse)} variables
                </span>
              ) : (
                <span className="text-destructive">
                  No CSS variables found — paste a shadcn export with{" "}
                  <code className="font-mono">:root</code> or{" "}
                  <code className="font-mono">.dark</code> blocks.
                </span>
              )
            ) : (
              <>
                Paste a shadcn token export — we read the <code className="font-mono">:root</code>{" "}
                and <code className="font-mono">.dark</code> color variables.
              </>
            )}
          </p>
        </SettingsField>
      ) : null}

      <SettingsField label="Headline">
        <Input
          className="h-10 rounded-lg bg-background text-sm"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
        />
      </SettingsField>
      <SettingsField label="Intro">
        <Input
          className="h-10 rounded-lg bg-background text-sm"
          value={intro}
          onChange={(event) => setIntro(event.target.value)}
        />
      </SettingsField>
    </SettingsPanel>
  );
}

function countTokens(parsed: { dark?: Record<string, string>; light?: Record<string, string> }) {
  return new Set([...Object.keys(parsed.light ?? {}), ...Object.keys(parsed.dark ?? {})]).size;
}

/** A miniature portal mock rendered with the resolved theme so owners see it before saving. */
function PortalThemePreview({ theme }: { theme: ResolvedPortalTheme }) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border", theme.isDark && "dark")}
      style={portalThemeStyleVars(theme.vars)}
    >
      <div className="bg-background p-3 text-foreground">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="size-5 rounded-md bg-primary" />
            <span className="text-xs font-semibold">Portal preview</span>
          </div>
          <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
            Roadmap
          </span>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-card p-2.5 text-card-foreground">
          <div className="h-2 w-2/3 rounded-full bg-foreground/80" />
          <div className="mt-1.5 h-2 w-full rounded-full bg-muted-foreground/40" />
          <div className="mt-2.5 flex items-center gap-2">
            <span className="rounded-md bg-primary px-2 py-1 text-[0.625rem] font-semibold text-primary-foreground">
              Submit
            </span>
            <span className="rounded-md border border-border bg-muted px-2 py-1 text-[0.625rem] font-medium text-muted-foreground">
              12 votes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
