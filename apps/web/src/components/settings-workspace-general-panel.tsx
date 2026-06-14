import { Button } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus, Settings, Sparkles } from "@/lib/icons";
import type { RefObject } from "react";

import { portalSlugFromUrl } from "@/components/public-portal-types";

import { SettingsPanel } from "@/components/amend-dashboard-shared";
import type { ProjectMenuItem } from "@/components/amend-dashboard-types";
import {
  SettingsField,
  SettingsSaveButton,
} from "@/components/settings-workspace-panel-primitives";
import type {
  LogoActionState,
  SettingsSavingState,
} from "@/components/settings-workspace-panel-types";

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
  onProjectSave,
  saving,
  setDescription,
  setLogoUrl,
  setName,
  setWebsiteUrl,
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
  onProjectSave: () => void;
  saving: SettingsSavingState;
  setDescription: (value: string) => void;
  setLogoUrl: (value: string) => void;
  setName: (value: string) => void;
  setWebsiteUrl: (value: string) => void;
  websiteUrl: string;
}) {
  return (
    <SettingsPanel
      action={
        <SettingsSaveButton disabled={!canSave || saving === "project"} onClick={onProjectSave} />
      }
      icon={<Settings />}
      title="General"
    >
      <SettingsField label="Project name">
        <Input
          className="h-10 rounded-lg border-transparent bg-[#151518] text-sm ring-1 ring-white/[0.055] focus-visible:ring-white/[0.16]"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </SettingsField>
      <SettingsField label="Project description">
        <Input
          className="h-10 rounded-lg border-transparent bg-[#151518] text-sm ring-1 ring-white/[0.055] focus-visible:ring-white/[0.16]"
          placeholder="What this product is and who it serves."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </SettingsField>
      <div className="grid gap-3 md:grid-cols-2">
        <SettingsField label="Website URL">
          <Input
            className="h-10 rounded-lg border-transparent bg-[#151518] text-sm ring-1 ring-white/[0.055] focus-visible:ring-white/[0.16]"
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
          />
        </SettingsField>
        <SettingsField label="Logo URL">
          <div className="grid gap-2">
            <Input
              className="h-10 rounded-lg border-transparent bg-[#151518] text-sm ring-1 ring-white/[0.055] focus-visible:ring-white/[0.16]"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
            />
            <input
              ref={logoFileInputRef}
              accept="image/*"
              className="sr-only"
              type="file"
              onChange={(event) => onLogoFileChange(event.target.files?.[0])}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                className="h-9 rounded-lg bg-[#151518] px-3 text-xs text-muted-foreground ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] hover:text-foreground active:opacity-75"
                disabled={!canSave || logoAction !== null}
                onClick={() => logoFileInputRef.current?.click()}
              >
                <Plus className="size-3.5" />
                {logoAction === "upload" ? "Uploading..." : "Upload logo"}
              </Button>
              <Button
                className="h-9 rounded-lg bg-[#151518] px-3 text-xs text-muted-foreground ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] hover:text-foreground active:opacity-75"
                disabled={!canSave || logoAction !== null}
                onClick={onLoadLogoFromWebsite}
              >
                <Sparkles className="size-3.5" />
                {logoAction === "website" ? "Loading..." : "Load from website"}
              </Button>
            </div>
          </div>
        </SettingsField>
      </div>
      <SettingsField label="Portal URL">
        <div className="flex items-center gap-2">
          <Input
            className="h-10 flex-1 rounded-lg border-transparent bg-[#151518] text-sm ring-1 ring-white/[0.055] focus-visible:ring-white/[0.16]"
            readOnly
            value={activeProject.portal}
          />
          <Link
            to="/portal/$workspaceSlug"
            params={{ workspaceSlug: portalSlugFromUrl(activeProject.portal) }}
            target="_blank"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#151518] px-3 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] hover:text-foreground active:opacity-75"
          >
            <ArrowUpRight className="size-3.5" />
            Open portal
          </Link>
        </div>
      </SettingsField>
    </SettingsPanel>
  );
}
