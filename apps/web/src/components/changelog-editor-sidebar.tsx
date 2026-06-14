import { cn } from "@amend/ui/lib/utils";
import { useState } from "react";

import { CalendarClock, FileText, Plus, Send, Sparkles, Tag, Type } from "@/lib/icons";

type RailMessage = { id: number; role: "assistant" | "user"; text: string };

const QUICK_ACTIONS = [
  { icon: Sparkles, label: "Improve writing", prompt: "Improve the writing in this changelog." },
  { icon: FileText, label: "Add summary", prompt: "Write a one-line summary for this update." },
  { icon: Type, label: "Fix formatting", prompt: "Clean up the formatting of this changelog." },
  { icon: Tag, label: "Suggest tags", prompt: "Suggest tags for this changelog." },
  { icon: CalendarClock, label: "Schedule post", prompt: "When should I publish this update?" },
] as const;

const GREETING: RailMessage = {
  id: 0,
  role: "assistant",
  text: "Hello! How can I help you with your changelog today?",
};

export function ChangelogAssistantRail() {
  const [messages, setMessages] = useState<RailMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: "user", text: value },
      {
        id: prev.length + 1,
        role: "assistant",
        text: "The AI assistant isn’t connected to a model yet — wire up a provider to enable suggestions.",
      },
    ]);
    setDraft("");
  }

  return (
    <aside className="hidden min-h-0 flex-col border-l border-white/[0.05] bg-card/30 lg:flex">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.05] px-4">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-foreground/[0.07] text-foreground ring-1 ring-white/[0.06]">
            <Sparkles className="size-3.5" />
          </span>
          <h2 className="text-sm font-semibold">AI assistant</h2>
        </div>
        <button
          type="button"
          aria-label="New chat"
          className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75"
          onClick={() => {
            setMessages([GREETING]);
            setDraft("");
          }}
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[85%] text-pretty rounded-2xl px-3 py-2 text-[0.82rem] leading-6",
              message.role === "assistant"
                ? "self-start bg-foreground/[0.05] text-foreground/90"
                : "self-end bg-foreground text-background",
            )}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="shrink-0 space-y-2 border-t border-white/[0.05] px-4 py-3">
        <div className="grid gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-background/60 px-3 py-2 text-left text-[0.82rem] font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:border-white/[0.12] hover:text-foreground active:opacity-75"
              onClick={() => setDraft(action.prompt)}
            >
              <action.icon className="size-3.5 shrink-0 opacity-70" />
              {action.label}
            </button>
          ))}
        </div>

        <form
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <textarea
            rows={2}
            value={draft}
            placeholder="Type your message…"
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-background/70 px-3 py-2.5 pr-11 text-[0.82rem] leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(draft);
              }
            }}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim()}
            className="absolute bottom-2.5 right-2.5 grid size-7 place-items-center rounded-lg bg-foreground text-background transition-opacity duration-150 ease-linear hover:opacity-85 active:opacity-75 disabled:opacity-30"
          >
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}
