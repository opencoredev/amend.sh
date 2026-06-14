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

// The closing dot completes the loop. Warm signal on the solid mark, otherwise
// it stays monochrome so the logo reads cleanly on any surface.
const dotFillClasses: Record<BrandMarkVariant, string> = {
  solid: "fill-amend-warm",
  soft: "fill-current",
  ghost: "fill-current",
  mono: "fill-current",
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
      {/* The loop: a ring left open, about to close. */}
      <path
        d="M50.5 39.5A20 20 0 1 1 50.5 24.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="6"
      />
      {/* The signal returning to its origin, closing the loop. */}
      <circle cx="52" cy="32" r="4.4" className={dotFillClasses[variant]} />
    </svg>
  );
}

export default BrandMark;
