import type { ProjectSuggestion } from "@/components/amend-dashboard-types";
import { ProjectLogo } from "@/components/project-logo";

export function ProjectSetupPreviewPanel({ suggestion }: { suggestion: ProjectSuggestion | null }) {
  if (suggestion) {
    return (
      <div className="border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center overflow-hidden border border-border bg-muted">
            <ProjectLogo
              className="size-full"
              fallbackIconClassName="size-5"
              logoUrl={suggestion.logoUrl}
              websiteUrl={suggestion.websiteUrl}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{suggestion.name}</p>
            <p className="truncate text-xs text-muted-foreground">{suggestion.websiteUrl}</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          {suggestion.description ??
            "A source-linked Amend project with feedback, roadmap, changelog, and widgets."}
        </p>
      </div>
    );
  }

  return (
    <>
      {[
        ["Project identity", "From website"],
        ["Feedback board", "Created after save"],
        ["Roadmap", "Ready for source links"],
        ["Changelog", "Review first"],
        ["GitHub sync", "Connect next"],
      ].map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between border border-border bg-muted/20 p-4"
        >
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs text-muted-foreground">{value}</span>
        </div>
      ))}
    </>
  );
}
