"use client";

import { type ComponentProps, type SyntheticEvent, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Send, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { buttonVariants } from "../ui/button";
import { useAISearchContext, useChatContext } from "./search-context";

const StorageKeyInput = "__ai_search_input";

export function AISearchPanelHeader({ className, ...props }: ComponentProps<"div">) {
  const { setOpen } = useAISearchContext();

  return (
    <div
      className={cn(
        "sticky top-0 flex items-start gap-2 border rounded-xl bg-fd-secondary text-fd-secondary-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="px-3 py-2 flex-1">
        <p className="text-sm font-medium mb-2">AI Chat</p>
        <p className="text-xs text-fd-muted-foreground">
          AI can be inaccurate, please verify the answers.
        </p>
      </div>

      <button
        aria-label="Close"
        tabIndex={-1}
        className={cn(
          buttonVariants({
            size: "icon-sm",
            color: "ghost",
            className: "text-fd-muted-foreground rounded-full",
          }),
        )}
        onClick={() => setOpen(false)}
      >
        <X />
      </button>
    </div>
  );
}

export function AISearchInputActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === "streaming";

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === "assistant" && (
        <button
          type="button"
          className={cn(
            buttonVariants({
              color: "secondary",
              size: "sm",
              className: "rounded-full gap-1.5",
            }),
          )}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          Retry
        </button>
      )}
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: "secondary",
            size: "sm",
            className: "rounded-full",
          }),
        )}
        onClick={() => setMessages([])}
      >
        Clear Chat
      </button>
    </>
  );
}

export function AISearchInput(props: ComponentProps<"form">) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState(() => localStorage.getItem(StorageKeyInput) ?? "");
  const isLoading = status === "streaming" || status === "submitted";
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const message = input.trim();
    if (message.length === 0) return;

    void sendMessage({
      role: "user",
      parts: [
        {
          type: "data-client",
          data: {
            location: location.href,
          },
        },
        {
          type: "text",
          text: message,
        },
      ],
    });
    setInput("");
    localStorage.removeItem(StorageKeyInput);
  };

  useEffect(() => {
    if (isLoading) document.getElementById("nd-ai-input")?.focus();
  }, [isLoading]);

  return (
    <form {...props} className={cn("flex items-start pe-2", props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={isLoading ? "AI is answering..." : "Ask a question"}
        autoFocus
        className="p-3"
        disabled={status === "streaming" || status === "submitted"}
        onChange={(e) => {
          setInput(e.target.value);
          localStorage.setItem(StorageKeyInput, e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === "Enter") {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className={cn(
            buttonVariants({
              color: "secondary",
              className: "transition-all rounded-full mt-2 gap-2",
            }),
          )}
          onClick={stop}
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          Abort Answer
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className={cn(
            buttonVariants({
              color: "primary",
              className: "transition-all rounded-full mt-2",
            }),
          )}
          disabled={input.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function Input(props: ComponentProps<"textarea">) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn("col-start-1 row-start-1", props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          "resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none",
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, "break-all invisible")}>
        {`${props.value?.toString() ?? ""}\n`}
      </div>
    </div>
  );
}
