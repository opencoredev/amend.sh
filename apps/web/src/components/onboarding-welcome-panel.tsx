import { Button } from "@amend/ui/components/button";
import { ArrowRight, GitPullRequestArrow, Globe, Megaphone } from "@/lib/icons";
import type { ComponentType } from "react";

const VALUE_PROPS: Array<{ icon: ComponentType<{ className?: string }>; text: string }> = [
  { icon: GitPullRequestArrow, text: "Sync what ships straight from GitHub" },
  { icon: Megaphone, text: "Draft changelog and roadmap updates automatically" },
  { icon: Globe, text: "Close the loop with customers on a public portal" },
];

export function OnboardingWelcomePanel({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Welcome to Amend
      </p>
      <h1 className="mt-3 text-2xl font-semibold leading-tight text-foreground">
        Turn shipped work into customer updates.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Amend connects GitHub, your changelog, roadmap, and feedback into one mostly-automatic loop.
        Let&rsquo;s set up your first project — it takes about a minute.
      </p>

      <ul className="mt-7 grid gap-3.5">
        {VALUE_PROPS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground/[0.06] text-foreground ring-1 ring-white/[0.06]">
              <Icon className="size-4" />
            </span>
            <span className="text-sm text-foreground/90">{text}</span>
          </li>
        ))}
      </ul>

      <Button type="button" className="mt-9 h-10 w-full" onClick={onStart}>
        Set up your first project
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
