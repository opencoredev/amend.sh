import { Button } from "@amend/ui/components/button";
import { ArrowRight, Bot, Globe, MessageSquare, Newspaper, Route } from "@/lib/icons";
import type { ComponentType } from "react";

const SURFACES: Array<{
  icon: ComponentType<{ className?: string }>;
  name: string;
  copy: string;
}> = [
  { icon: Newspaper, name: "Changelog", copy: "Publish source-linked product updates." },
  { icon: Route, name: "Roadmap", copy: "Show what's planned, in progress, and shipped." },
  { icon: MessageSquare, name: "Feedback", copy: "Collect requests and let customers vote." },
  { icon: Bot, name: "Automation", copy: "Let Amend draft updates as work ships." },
  { icon: Globe, name: "Portal", copy: "Give customers a public place to follow along." },
];

export function OnboardingShowcasePanel({
  projectName,
  onEnter,
}: {
  projectName: string;
  onEnter: () => void;
}) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-emerald-400">
        Your workspace is ready
      </p>
      <h1 className="mt-3 text-2xl font-semibold leading-tight text-foreground">
        {projectName} is live.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Here&rsquo;s what you can do now. We&rsquo;ve started a checklist in your dashboard to walk
        you through the rest.
      </p>

      <ul className="mt-6 grid divide-y divide-white/[0.05]">
        {SURFACES.map(({ icon: Icon, name, copy }) => (
          <li key={name} className="flex items-start gap-3 py-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{copy}</p>
            </div>
          </li>
        ))}
      </ul>

      <Button type="button" className="mt-7 h-10 w-full" onClick={onEnter}>
        Enter your workspace
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
