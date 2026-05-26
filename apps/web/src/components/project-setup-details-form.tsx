import { Button } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import type { ReactNode } from "react";

import type { ProjectMenuItem } from "@/components/amend-dashboard-types";

export function ProjectSetupDetailsForm({
  canCreate,
  description,
  existingProject,
  isRepairingProject,
  message,
  onDescriptionChange,
  onNameChange,
  onSave,
  onSlugChange,
  onVisibilityChange,
  onWebsiteUrlChange,
  projectName,
  projectSlug,
  saving,
  sourceChoice,
  visibility,
  websiteUrl,
}: {
  canCreate: boolean;
  description: string;
  existingProject?: ProjectMenuItem;
  isRepairingProject: boolean;
  message: string;
  onDescriptionChange: (description: string) => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onSlugChange: (slug: string) => void;
  onVisibilityChange: (visibility: "private" | "public") => void;
  onWebsiteUrlChange: (url: string) => void;
  projectName: string;
  projectSlug: string;
  saving: boolean;
  sourceChoice: ReactNode;
  visibility: "private" | "public";
  websiteUrl: string;
}) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project setup</p>
      <h1 className="mt-4 text-3xl font-semibold leading-tight">
        {isRepairingProject ? "Connect a first source." : "Create a project."}
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {isRepairingProject
          ? `${existingProject?.name ?? "This project"} needs GitHub or feedback before the agent command center can run.`
          : "Set up the product the agent will watch."}
      </p>
      <div className="mt-8 grid gap-4">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Website URL</span>
          <Input
            className="mt-2 h-11 bg-background text-sm"
            onChange={(event) => onWebsiteUrlChange(event.target.value)}
            placeholder="https://yourproduct.com"
            value={websiteUrl}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Project name</span>
          <Input
            className="mt-2 h-11 bg-background text-sm"
            disabled={isRepairingProject}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Patchbay"
            value={projectName}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Project slug</span>
          <Input
            className="mt-2 h-11 bg-background text-sm"
            disabled={isRepairingProject}
            onChange={(event) => onSlugChange(event.target.value)}
            placeholder="patchbay"
            value={projectSlug}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Description</span>
          <textarea
            className="mt-2 min-h-20 w-full resize-none border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            disabled={isRepairingProject}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="What this project ships and who it serves."
            value={description}
          />
        </label>
        <div>
          <span className="text-xs font-semibold text-muted-foreground">Portal visibility</span>
          <div className="mt-2 grid grid-cols-2 border border-border">
            {(["private", "public"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "h-10 text-sm font-semibold capitalize transition-[background-color,color]",
                  visibility === option
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:text-foreground",
                )}
                onClick={() => onVisibilityChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {sourceChoice}
      </div>
      <p className="mt-3 min-h-5 text-xs text-muted-foreground">{message}</p>
      <Button
        className="mt-5 h-10 w-full bg-foreground text-background hover:bg-background hover:text-foreground"
        disabled={!canCreate}
        onClick={onSave}
      >
        {saving
          ? isRepairingProject
            ? "Saving..."
            : "Creating..."
          : isRepairingProject
            ? "Save source"
            : "Create project"}
      </Button>
    </>
  );
}
