import { useCallback, useEffect, useRef, useState } from "react";

export function useWorkspaceMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const workspaceMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileWorkspaceMenuRef = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !workspaceMenuRef.current?.contains(target) &&
        !mobileWorkspaceMenuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return {
    mobileWorkspaceMenuRef,
    open,
    query,
    reset,
    setOpen,
    setQuery,
    workspaceMenuRef,
  };
}
