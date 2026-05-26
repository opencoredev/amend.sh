"use client";

import type { ComponentProps } from "react";
import { Presence } from "@radix-ui/react-presence";
import { cn } from "../../lib/cn";
import { AISearchInput, AISearchInputActions, AISearchPanelHeader } from "./search-controls";
import { useAISearchContext, useHotKey } from "./search-context";
import { AISearchPanelList } from "./search-messages";

export function AISearchTrigger({
  position = "default",
  className,
  ...props
}: ComponentProps<"button"> & { position?: "default" | "float" }) {
  const { open, setOpen } = useAISearchContext();

  return (
    <button
      data-state={open ? "open" : "closed"}
      className={cn(
        position === "float" && [
          "fixed bottom-4 gap-3 w-24 inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] shadow-lg z-20 transition-[translate,opacity]",
          open && "translate-y-10 opacity-0",
        ],
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext();
  useHotKey();

  return (
    <>
      <style>
        {`
        @keyframes ask-ai-open {
          from {
            translate: 100% 0;
          }
          to {
            translate: 0 0;
          }
        }
        @keyframes ask-ai-close {
          from {
            width: var(--ai-chat-width);
          }
          to {
            width: 0px;
          }
        }`}
      </style>
      <Presence present={open}>
        <div
          className={cn(
            "fixed inset-0 z-30 backdrop-blur-xs bg-fd-overlay lg:hidden",
            open ? "animate-fd-fade-in" : "animate-fd-fade-out",
          )}
          onClick={() => setOpen(false)}
        />
      </Presence>
      <Presence present={open}>
        <div
          className={cn(
            "overflow-hidden z-30 bg-fd-card text-fd-card-foreground [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]",
            "max-lg:fixed max-lg:inset-x-2 max-lg:inset-y-4 max-lg:border max-lg:rounded-2xl max-lg:shadow-xl",
            "lg:sticky lg:top-0 lg:h-dvh lg:border-s lg:ms-auto lg:in-[#nd-docs-layout]:[grid-area:toc] lg:in-[#nd-notebook-layout]:row-span-full lg:in-[#nd-notebook-layout]:col-start-5",
            open
              ? "animate-fd-dialog-in lg:animate-[ask-ai-open_200ms]"
              : "animate-fd-dialog-out lg:animate-[ask-ai-close_200ms]",
          )}
        >
          <div className="flex flex-col size-full p-2 lg:p-3 lg:w-(--ai-chat-width)">
            <AISearchPanelHeader />
            <AISearchPanelList className="flex-1" />
            <div className="rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm has-focus-visible:shadow-md">
              <AISearchInput />
              <div className="flex items-center gap-1.5 p-1 empty:hidden">
                <AISearchInputActions />
              </div>
            </div>
          </div>
        </div>
      </Presence>
    </>
  );
}
