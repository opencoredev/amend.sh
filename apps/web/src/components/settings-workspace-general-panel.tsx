import { cn } from "@amend/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronDown, Globe, Link2, Loader2, Plus, X } from "@/lib/icons";
import { useState } from "react";
import type { KeyboardEvent, ReactNode, RefObject } from "react";

import { portalSlugFromUrl } from "@/components/public-portal-types";

import type { ProjectMenuItem, WorkspaceSettingsData } from "@/components/amend-dashboard-types";
import { ProjectLogo } from "@/components/project-logo";
import {
  SettingsInput,
  SettingsRow,
  SettingsSection,
  settingsSecondaryButtonClass,
} from "@/components/settings-workspace-panel-primitives";
import type { LogoActionState } from "@/components/settings-workspace-panel-types";
import {
  amendRuntimeCommit,
  amendRuntimeVersion,
  amendUpdateCheckState,
} from "@/components/settings-workspace-runtime";

/** Host shown in the "Use favicon from …" action, e.g. "email-sdk.dev". */
function faviconHost(websiteUrl: string): string | null {
  const trimmed = websiteUrl.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`).host.replace(
      /^www\./,
      "",
    );
  } catch {
    return null;
  }
}

function LogoMenuItem({
  children,
  danger,
  icon,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors duration-150 ease-linear [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        danger
          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive [&_svg]:hover:text-destructive"
          : "text-foreground/90 hover:bg-white/[0.05] hover:text-foreground",
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

/**
 * Single logo control: a clickable avatar (the quick upload path) plus a
 * "Change" menu for the rest. "From website" becomes a contextual
 * "Use favicon from {host}" item, and a pasted URL lives behind an inline
 * editor — so the raw logo URL is never shown as a separate, redundant field.
 */
function LogoField({
  canSave,
  logoAction,
  logoFileInputRef,
  logoUrl,
  onLoadLogoFromWebsite,
  onLogoFileChange,
  setLogoUrl,
  websiteUrl,
}: {
  canSave: boolean;
  logoAction: LogoActionState;
  logoFileInputRef: RefObject<HTMLInputElement | null>;
  logoUrl: string;
  onLoadLogoFromWebsite: () => void;
  onLogoFileChange: (file: File | undefined) => void;
  setLogoUrl: (value: string) => void;
  websiteUrl: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [urlDraft, setUrlDraft] = useState<string | null>(null);
  const host = faviconHost(websiteUrl);
  const busy = logoAction !== null;

  function commitUrl() {
    if (urlDraft !== null) setLogoUrl(urlDraft.trim());
    setUrlDraft(null);
  }

  function onUrlKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitUrl();
    }
    if (event.key === "Escape") setUrlDraft(null);
  }

  const hiddenInput = (
    <input
      ref={logoFileInputRef}
      accept="image/*"
      className="sr-only"
      type="file"
      onChange={(event) => onLogoFileChange(event.target.files?.[0])}
    />
  );

  if (urlDraft !== null) {
    return (
      <div className="flex items-center gap-2">
        <SettingsInput
          autoFocus
          className="sm:w-64"
          placeholder="https://example.com/logo.png"
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          onKeyDown={onUrlKeyDown}
        />
        <button
          type="button"
          aria-label="Apply logo URL"
          className={settingsSecondaryButtonClass}
          onClick={commitUrl}
        >
          <Check />
        </button>
        <button
          type="button"
          aria-label="Cancel"
          className={settingsSecondaryButtonClass}
          onClick={() => setUrlDraft(null)}
        >
          <X />
        </button>
        {hiddenInput}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        title="Upload a logo"
        disabled={!canSave || busy}
        onClick={() => logoFileInputRef.current?.click()}
        className="group relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#151518] ring-1 ring-white/[0.06] ring-inset transition-[box-shadow] duration-150 ease-linear hover:ring-white/[0.2] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ProjectLogo
          className="size-full"
          fallbackIconClassName="size-5"
          logoUrl={logoUrl}
          websiteUrl={websiteUrl}
        />
        <span
          className={cn(
            "absolute inset-0 grid place-items-center bg-black/55 text-white transition-opacity duration-150 ease-linear [&_svg]:size-4",
            busy ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Plus />}
        </span>
      </button>

      <div className="relative">
        <button
          type="button"
          aria-expanded={menuOpen}
          disabled={!canSave || busy}
          onClick={() => setMenuOpen((open) => !open)}
          className={settingsSecondaryButtonClass}
        >
          {logoAction === "upload"
            ? "Uploading…"
            : logoAction === "website"
              ? "Fetching…"
              : "Change"}
          <ChevronDown
            className={cn("transition-transform duration-150", menuOpen && "rotate-180")}
          />
        </button>

        {menuOpen ? (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenuOpen(false)}
            />
            <div className="t-pop is-open absolute left-0 top-11 z-20 w-60 rounded-xl border border-white/[0.08] bg-card p-1.5 shadow-[0_18px_60px_rgb(0_0_0/0.5)] sm:left-auto sm:right-0">
              <LogoMenuItem
                icon={<Plus />}
                onClick={() => {
                  setMenuOpen(false);
                  logoFileInputRef.current?.click();
                }}
              >
                Upload image…
              </LogoMenuItem>
              {host ? (
                <LogoMenuItem
                  icon={<Globe />}
                  onClick={() => {
                    setMenuOpen(false);
                    onLoadLogoFromWebsite();
                  }}
                >
                  Use favicon from <span className="text-foreground">{host}</span>
                </LogoMenuItem>
              ) : null}
              <LogoMenuItem
                icon={<Link2 />}
                onClick={() => {
                  setMenuOpen(false);
                  setUrlDraft(logoUrl);
                }}
              >
                Paste image URL…
              </LogoMenuItem>
              {logoUrl ? (
                <LogoMenuItem
                  danger
                  icon={<X />}
                  onClick={() => {
                    setMenuOpen(false);
                    setLogoUrl("");
                  }}
                >
                  Remove logo
                </LogoMenuItem>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {hiddenInput}
    </div>
  );
}

export function GeneralSettingsPanel({
  activeProject,
  canSave,
  description,
  logoAction,
  logoFileInputRef,
  logoUrl,
  name,
  onLoadLogoFromWebsite,
  onLogoFileChange,
  setDescription,
  setLogoUrl,
  setName,
  setWebsiteUrl,
  settings,
  websiteUrl,
}: {
  activeProject: ProjectMenuItem;
  canSave: boolean;
  description: string;
  logoAction: LogoActionState;
  logoFileInputRef: RefObject<HTMLInputElement | null>;
  logoUrl: string;
  name: string;
  onLoadLogoFromWebsite: () => void;
  onLogoFileChange: (file: File | undefined) => void;
  setDescription: (value: string) => void;
  setLogoUrl: (value: string) => void;
  setName: (value: string) => void;
  setWebsiteUrl: (value: string) => void;
  settings: WorkspaceSettingsData | undefined;
  websiteUrl: string;
}) {
  const websiteLookup = settings?.rateLimits?.projectWebsiteLookup;

  return (
    <div className="space-y-12">
      <SettingsSection
        description="Identity used across the dashboard, the public portal, and agent updates."
        title="Project"
      >
        <SettingsRow label="Logo" description="PNG or SVG, square works best.">
          <LogoField
            canSave={canSave}
            logoAction={logoAction}
            logoFileInputRef={logoFileInputRef}
            logoUrl={logoUrl}
            onLoadLogoFromWebsite={onLoadLogoFromWebsite}
            onLogoFileChange={onLogoFileChange}
            setLogoUrl={setLogoUrl}
            websiteUrl={websiteUrl}
          />
        </SettingsRow>

        <SettingsRow label="Project name">
          <SettingsInput
            className="sm:w-72"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </SettingsRow>

        <SettingsRow label="Description" description="A short line about what this product is.">
          <SettingsInput
            className="sm:w-80"
            placeholder="What this product is and who it serves."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </SettingsRow>

        <SettingsRow label="Website URL">
          <SettingsInput
            className="sm:w-72"
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection description="Read-only build and limit details." title="System">
        <SettingsRow
          label="Public portal"
          description={activeProject.portal}
          control={
            <Link
              to="/portal/$workspaceSlug"
              params={{ workspaceSlug: portalSlugFromUrl(activeProject.portal) }}
              target="_blank"
              className={settingsSecondaryButtonClass}
            >
              <ArrowUpRight />
              Open
            </Link>
          }
        />
        <SettingsRow
          label="App version"
          control={
            <span className="font-mono text-xs tabular-nums text-foreground/80">
              {amendRuntimeVersion}
            </span>
          }
        />
        <SettingsRow
          label="Build"
          control={
            <span className="font-mono text-xs tabular-nums text-foreground/80">
              {amendRuntimeCommit}
            </span>
          }
        />
        <SettingsRow
          label="Update checks"
          control={<span className="text-xs text-foreground/80">{amendUpdateCheckState}</span>}
        />
        <SettingsRow
          label="Website lookup limit"
          description="Rate applied when Amend fetches metadata from a project website."
          control={
            <span className="font-mono text-xs tabular-nums text-foreground/80">
              {websiteLookup
                ? `${websiteLookup.rate}/${websiteLookup.period} · burst ${websiteLookup.capacity}`
                : "12/minute · burst 4"}
            </span>
          }
        />
      </SettingsSection>
    </div>
  );
}
