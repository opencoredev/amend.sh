/**
 * Icon set for the shared UI primitives — Hugeicons behind lucide-compatible
 * names, mirroring the app-level wrapper in `apps/web/src/lib/icons.tsx`. The
 * whole project uses Hugeicons only; never import `lucide-react`.
 */
import {
  Alert02Icon,
  ArrowRight01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { type ComponentPropsWithoutRef, type ComponentType, forwardRef } from "react";

export type IconProps = Omit<ComponentPropsWithoutRef<typeof HugeiconsIcon>, "icon">;
export type LucideIcon = ComponentType<IconProps>;

function icon(svg: IconSvgElement, displayName: string) {
  const Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <HugeiconsIcon ref={ref} icon={svg} strokeWidth={2} {...props} />
  ));
  Icon.displayName = displayName;
  return Icon;
}

export const Check = icon(Tick02Icon, "Check");
export const ChevronRight = icon(ArrowRight01Icon, "ChevronRight");
export const CircleCheck = icon(CheckmarkCircle02Icon, "CircleCheck");
export const Info = icon(InformationCircleIcon, "Info");
export const TriangleAlert = icon(Alert02Icon, "TriangleAlert");
export const OctagonX = icon(CancelCircleIcon, "OctagonX");
export const Loader2 = icon(Loading03Icon, "Loader2");
