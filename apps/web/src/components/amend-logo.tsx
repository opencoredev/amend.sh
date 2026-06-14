import { cn } from "@amend/ui/lib/utils";
import type { HTMLAttributes } from "react";

import { BrandMark, type BrandMarkProps } from "@/components/brand-mark";

type AmendLogoSize = "sm" | "md" | "lg";
type AmendLogoTone = "default" | "muted" | "inverse";

const logoSizeClasses: Record<AmendLogoSize, string> = {
  sm: "gap-2 text-[0.875rem]",
  md: "gap-2.5 text-base",
  lg: "gap-3 text-xl",
};

const logoMarkSizes: Record<AmendLogoSize, BrandMarkProps["size"]> = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const logoToneClasses: Record<AmendLogoTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  inverse: "text-white",
};

export type AmendLogoProps = HTMLAttributes<HTMLDivElement> & {
  markVariant?: BrandMarkProps["variant"];
  showMark?: boolean;
  showSuffix?: boolean;
  size?: AmendLogoSize;
  tone?: AmendLogoTone;
};

export function AmendLogo({
  className,
  markVariant = "solid",
  showMark = true,
  showSuffix = true,
  size = "md",
  tone = "default",
  ...props
}: AmendLogoProps) {
  return (
    <div
      aria-label={showSuffix ? "amend.sh" : "Amend"}
      className={cn(
        "inline-flex items-center whitespace-nowrap font-semibold leading-none tracking-[-0.01em]",
        logoSizeClasses[size],
        logoToneClasses[tone],
        className,
      )}
      {...props}
    >
      {showMark ? <BrandMark decorative size={logoMarkSizes[size]} variant={markVariant} /> : null}
      <span className="inline-flex items-baseline">
        <span>amend</span>
        {showSuffix ? <span className="text-muted-foreground">.sh</span> : null}
      </span>
    </div>
  );
}

export default AmendLogo;
