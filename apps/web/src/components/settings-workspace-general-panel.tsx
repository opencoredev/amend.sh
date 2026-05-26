import { Button } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import { Plus, Settings, Sparkles } from "lucide-react";
import type { RefObject } from "react";

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
          className="h-10 bg-background text-sm"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </SettingsField>
      <SettingsField label="Project description">
        <Input
          className="h-10 bg-background text-sm"
          placeholder="What this product is and who it serves."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </SettingsField>
      <div className="grid gap-3 md:grid-cols-2">
        <SettingsField label="Website URL">
          <Input
            className="h-10 bg-background text-sm"
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
          />
        </SettingsField>
        <SettingsField label="Logo URL">
          <div className="grid gap-2">
            <Input
              className="h-10 bg-background text-sm"
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
                className="h-9 border border-border bg-background px-3 text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                disabled={!canSave || logoAction !== null}
                onClick={() => logoFileInputRef.current?.click()}
              >
                <Plus className="size-3.5" />
                {logoAction === "upload" ? "Uploading..." : "Upload logo"}
              </Button>
              <Button
                className="h-9 border border-border bg-background px-3 text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground"
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
        <Input className="h-10 bg-background text-sm" readOnly value={activeProject.portal} />
      </SettingsField>
    </SettingsPanel>
  );
}
