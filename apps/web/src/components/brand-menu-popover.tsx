import { Code2, Copy, Download, ExternalLink } from "lucide-react";

import { copySvg, downloadBrandAssets } from "@/components/brand-menu-actions";
import { amendMarkSvg, amendWordmarkSvg } from "@/lib/brand-assets";

export function BrandMenuPopover({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="menu"
      aria-label="Amend brand assets"
      className="absolute left-0 top-[calc(100%+0.75rem)] z-[70] min-w-72 border border-border bg-background p-2 shadow-2xl"
    >
      <BrandMenuItem
        icon={<Copy className="text-muted-foreground" />}
        label="Copy logo as SVG"
        onClick={() => {
          copySvg(amendMarkSvg);
          onClose();
        }}
      />
      <BrandMenuItem
        icon={<Code2 className="text-muted-foreground" />}
        label="Copy wordmark as SVG"
        onClick={() => {
          copySvg(amendWordmarkSvg);
          onClose();
        }}
      />
      <BrandMenuItem
        icon={<Download className="text-muted-foreground" />}
        label="Download brand assets"
        onClick={() => {
          downloadBrandAssets();
          onClose();
        }}
      />
      <div className="-mx-2 my-2 border-t border-border" />
      <BrandMenuItem
        icon={<ExternalLink className="text-muted-foreground" />}
        label="Visit brand guidelines"
        onClick={() => {
          onClose();
          window.location.href = "/brand";
        }}
      />
    </div>
  );
}

function BrandMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-foreground transition-[background-color,color] duration-200 hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background focus-visible:outline-none [&_svg]:size-4"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
