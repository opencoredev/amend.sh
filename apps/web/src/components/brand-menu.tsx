import { useEffect, useRef, useState } from "react";

import AmendLogo from "@/components/amend-logo";
import { BrandMenuPopover } from "@/components/brand-menu-popover";

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
        title="Click for home, right-click for brand assets"
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
      >
        <AmendLogo markVariant="mono" size="sm" className="gap-2" />
      </button>

      {open ? <BrandMenuPopover onClose={closeBrandMenu} /> : null}
    </div>
  );
}

export default BrandMenu;
