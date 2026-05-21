import { useId, type SVGProps } from "react";

import { cn } from "@amend/ui/lib/utils";

type BrandMarkSize = "xs" | "sm" | "md" | "lg" | "xl";
type BrandMarkVariant = "solid" | "soft" | "ghost" | "mono";

export type BrandMarkProps = Omit<SVGProps<SVGSVGElement>, "color"> & {
  decorative?: boolean;
  size?: BrandMarkSize;
  title?: string;
  variant?: BrandMarkVariant;
};

const markSizeClasses: Record<BrandMarkSize, string> = {
  xs: "size-4",
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-14",
};

const markVariantClasses: Record<BrandMarkVariant, string> = {
  solid: "text-foreground",
  soft: "text-muted-foreground",
  ghost: "text-muted-foreground",
  mono: "text-foreground",
};

export function BrandMark({
  className,
  decorative = false,
  size = "md",
  title = "Amend",
  variant = "solid",
  ...props
}: BrandMarkProps) {
  const generatedTitleId = useId();
  const titleId = decorative ? undefined : (props["aria-labelledby"] ?? generatedTitleId);

  return (
    <svg
      aria-hidden={decorative || undefined}
      aria-labelledby={titleId}
      className={cn(
        "shrink-0 overflow-visible transition-[color,opacity] duration-200",
        markSizeClasses[size],
        markVariantClasses[variant],
        className,
      )}
      fill="none"
      focusable="false"
      role={decorative ? undefined : "img"}
      shapeRendering="geometricPrecision"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {decorative ? null : <title id={titleId}>{title}</title>}
      <path
        d="M22 16H42M48 22V31H39M25 33H16V42"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="4"
        className={cn(variant === "solid" || variant === "mono" ? "opacity-55" : "opacity-35")}
      />
      <rect
        x="8"
        y="8"
        width="16"
        height="16"
        rx="2"
        className={cn(variant === "ghost" ? "fill-transparent" : "fill-current")}
        stroke="currentColor"
        strokeWidth={variant === "ghost" ? 4 : 0}
      />
      <rect x="40" y="8" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="4" />
      <rect x="24" y="24" width="16" height="16" rx="2" className="fill-current opacity-80" />
      <rect x="8" y="40" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

export default BrandMark;
