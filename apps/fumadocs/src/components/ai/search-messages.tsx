"use client";

import { type ComponentProps, useEffect, useRef } from "react";
import { MessageCircleIcon, SearchIcon } from "lucide-react";
import type { Tool, UIToolInvocation } from "ai";
import { cn } from "../../lib/cn";
import { Markdown } from "../markdown";
import type { ChatUIMessage, SearchTool } from "../../app/api/chat/route";
import { useChatContext } from "./search-context";

const roleName: Record<string, string> = {
  user: "you",
  assistant: "fumadocs",
};

export function AISearchPanelList({ className, style, ...props }: ComponentProps<"div">) {
  const chat = useChatContext();
  const messages = chat.messages.filter((msg) => msg.role !== "system");

  return (
    <List
      className={cn("py-4 overscroll-contain", className)}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)",
        ...style,
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <div className="text-sm text-fd-muted-foreground/80 size-full flex flex-col items-center justify-center text-center gap-2">
          <MessageCircleIcon fill="currentColor" stroke="none" />
          <p onClick={(e) => e.stopPropagation()}>Start a new chat below.</p>
        </div>
      ) : (
        <div className="flex flex-col px-3 gap-4">
          {chat.error && (
            <div className="p-2 bg-fd-secondary text-fd-secondary-foreground border rounded-lg">
              <p className="text-xs text-fd-muted-foreground mb-1">
                Request Failed: {chat.error.name}
              </p>
              <p className="text-sm">{chat.error.message}</p>
            </div>
          )}
          {messages.map((item) => (
            <Message key={item.id} message={item} />
          ))}
        </div>
      )}
    </List>
  );
}

function List(props: Omit<ComponentProps<"div">, "dir">) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "instant",
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn("fd-scroll-container overflow-y-auto min-w-0 flex flex-col", props.className)}
    >
      {props.children}
    </div>
  );
}

function Message({ message, ...props }: { message: ChatUIMessage } & ComponentProps<"div">) {
  let markdown = "";
  const searchCalls: UIToolInvocation<SearchTool>[] = [];

  for (const part of message.parts ?? []) {
    if (part.type === "text") {
      markdown += part.text;
      continue;
    }

    if (part.type.startsWith("tool-")) {
      const toolName = part.type.slice("tool-".length);
      const p = part as UIToolInvocation<Tool>;

      if (toolName !== "search" || !p.toolCallId) continue;
      searchCalls.push(p);
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()} {...props}>
      <p
        className={cn(
          "mb-1 text-sm font-medium text-fd-muted-foreground",
          message.role === "assistant" && "text-fd-primary",
        )}
      >
        {roleName[message.role] ?? "unknown"}
      </p>
      <div className="prose text-sm">
        <Markdown text={markdown} />
      </div>

      {searchCalls.map((call) => {
        return (
          <div
            key={call.toolCallId}
            className="flex flex-row gap-2 items-center mt-3 rounded-lg border bg-fd-secondary text-fd-muted-foreground text-xs p-2"
          >
            <SearchIcon className="size-4" />
            {call.state === "output-error" || call.state === "output-denied" ? (
              <p className="text-fd-error">{call.errorText ?? "Failed to search"}</p>
            ) : (
              <p>{!call.output ? "Searching..." : `${call.output.length} search results`}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
