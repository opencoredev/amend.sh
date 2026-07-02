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

// Solid uses the hero-orange splice. Muted variants collapse to one color so
// the mark still works in dense chrome and disabled/muted UI contexts.
const spliceFillClasses: Record<BrandMarkVariant, string> = {
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
      <path
        clipRule="evenodd"
        d="M8 56 26.6 8h10.8L56 56H44.15l-3.6-9.7h-17.1l-3.6 9.7H8Zm20.35-20.2h7.3L32 24.6l-3.65 11.2Z"
        className="fill-current"
        fillRule="evenodd"
      />
      <path
        d="M21.6 39.2h23.8L41.9 48H18.1l3.5-8.8Z"
        className={spliceFillClasses[variant]}
      />
    </svg>
  );
}

export default BrandMark;
