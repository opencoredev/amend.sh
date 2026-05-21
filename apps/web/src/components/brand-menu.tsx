import { Code2, Copy, Download, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import AmendLogo from "@/components/amend-logo";
import { amendMarkSvg, amendWordmarkSvg, brandAssetDownloads } from "@/lib/brand-assets";

function copySvg(svg: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(svg);
    return;
  }
  const input = document.createElement("textarea");
  input.value = svg;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function downloadSvg(filename: string, svg: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadBrandAssets() {
  brandAssetDownloads.forEach(([filename, svg], index) => {
    window.setTimeout(() => downloadSvg(filename, svg), index * 80);
  });
}

export function BrandMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clickTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  function clearClickTimer() {
    if (clickTimerRef.current === null) return;
    window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = null;
  }

  function clearCloseTimer() {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function closeBrandMenu() {
    clearClickTimer();
    clearCloseTimer();
    setOpen(false);
  }

  function openBrandMenu() {
    clearClickTimer();
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 260);
  }

  useEffect(() => {
    return () => {
      clearClickTimer();
      clearCloseTimer();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeBrandMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeBrandMenu();
      }
    }

    function handlePageExit() {
      closeBrandMenu();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handlePageExit);
    window.addEventListener("scroll", handlePageExit, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handlePageExit);
      window.removeEventListener("scroll", handlePageExit, true);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative z-[60]"
      onPointerEnter={clearCloseTimer}
      onPointerLeave={scheduleClose}
    >
      <button
        type="button"
        className="-m-2 flex items-center p-2 text-sm text-foreground transition-[opacity] duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open Amend brand assets"
        title="Click for home, double-click for brand assets"
        onClick={(event) => {
          event.preventDefault();
          clearClickTimer();

          if (open) {
            closeBrandMenu();
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
            return;
          }

          clickTimerRef.current = window.setTimeout(() => {
            window.location.href = "/";
          }, 180);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          openBrandMenu();
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          openBrandMenu();
        }}
      >
        <AmendLogo markVariant="mono" size="sm" className="gap-2" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Amend brand assets"
          className="absolute left-0 top-[calc(100%+0.75rem)] z-[70] min-w-72 border border-border bg-background p-2 shadow-2xl"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-foreground transition-[background-color,color] duration-200 hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background focus-visible:outline-none [&_svg]:size-4"
            onClick={() => {
              copySvg(amendMarkSvg);
              closeBrandMenu();
            }}
          >
            <Copy className="text-muted-foreground" />
            Copy logo as SVG
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-foreground transition-[background-color,color] duration-200 hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background focus-visible:outline-none [&_svg]:size-4"
            onClick={() => {
              copySvg(amendWordmarkSvg);
              closeBrandMenu();
            }}
          >
            <Code2 className="text-muted-foreground" />
            Copy wordmark as SVG
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-foreground transition-[background-color,color] duration-200 hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background focus-visible:outline-none [&_svg]:size-4"
            onClick={() => {
              downloadBrandAssets();
              closeBrandMenu();
            }}
          >
            <Download className="text-muted-foreground" />
            Download brand assets
          </button>
          <div className="-mx-2 my-2 border-t border-border" />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-foreground transition-[background-color,color] duration-200 hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background focus-visible:outline-none [&_svg]:size-4"
            onClick={() => {
              closeBrandMenu();
              window.location.href = "/brand";
            }}
          >
            <ExternalLink className="text-muted-foreground" />
            Visit brand guidelines
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default BrandMenu;
