/**
 * Company brand marks for the Connections page.
 *
 * Real, recognizable logos — pulled from `simple-icons` (CC0) and rendered as a
 * single `currentColor` path so they sit calmly in the dark theme like the rest
 * of the icon set. Slack was removed from simple-icons over its brand
 * guidelines, so its mark is inlined verbatim below.
 */
import { cn } from "@amend/ui/lib/utils";
import {
  siDiscord,
  siGithub,
  siGitlab,
  siIntercom,
  siLinear,
  siNotion,
  siPosthog,
  siVercel,
  siX,
  siZendesk,
} from "simple-icons";

type IconData = { title: string; path: string };

// Slack's official mark (8-piece pinwheel) — simple-icons dropped it on request.
const slack: IconData = {
  title: "Slack",
  path: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z",
};

export type BrandKey =
  | "github"
  | "discord"
  | "slack"
  | "linear"
  | "vercel"
  | "intercom"
  | "gitlab"
  | "zendesk"
  | "x"
  | "notion"
  | "posthog";

const BRANDS: Record<BrandKey, IconData> = {
  github: siGithub,
  discord: siDiscord,
  slack,
  linear: siLinear,
  vercel: siVercel,
  intercom: siIntercom,
  gitlab: siGitlab,
  zendesk: siZendesk,
  x: siX,
  notion: siNotion,
  posthog: siPosthog,
};

export function BrandIcon({ brand, className }: { brand: BrandKey; className?: string }) {
  const icon = BRANDS[brand];
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={icon.title}
      className={cn("size-full", className)}
    >
      <path d={icon.path} />
    </svg>
  );
}
