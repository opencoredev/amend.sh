import { cn } from "@amend/ui/lib/utils";
import { Globe } from "@/lib/icons";
import { useEffect, useMemo, useState } from "react";

import { duckDuckGoFaviconUrl, googleFaviconUrl } from "@/components/amend-dashboard-utils";

export function ProjectLogo({
  className,
  fallbackIconClassName,
  logoUrl,
  websiteUrl,
}: {
  className: string;
  fallbackIconClassName: string;
  logoUrl?: string;
  websiteUrl?: string;
}) {
  const sources = useMemo(() => {
    const candidates = [
      logoUrl,
      websiteUrl ? googleFaviconUrl(websiteUrl) : undefined,
      websiteUrl ? duckDuckGoFaviconUrl(websiteUrl) : undefined,
    ];
    return candidates.filter((source, index): source is string => {
      return Boolean(source) && candidates.indexOf(source) === index;
    });
  }, [logoUrl, websiteUrl]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sources]);

  const source = sources[sourceIndex];
  if (!source) {
    return <Globe className={cn(fallbackIconClassName, "text-muted-foreground")} />;
  }

  return (
    <img
      alt=""
      className={cn(className, "object-cover")}
      onError={() => setSourceIndex((index) => index + 1)}
      src={source}
    />
  );
}
