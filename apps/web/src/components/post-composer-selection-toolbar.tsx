import { cn } from "@amend/ui/lib/utils";
import { Bold, Code2, Italic, Link2, Strikethrough, Underline } from "lucide-react";

import { ToolbarButton } from "./post-composer-toolbar-button";

export function SelectionToolbar({
  onCode,
  onLink,
  visible,
}: {
  onCode: () => void;
  onLink: () => void;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -top-11 left-0 z-30 flex items-center border border-border bg-popover text-popover-foreground opacity-0 shadow-[0_18px_50px_rgb(0_0_0/0.45)] transition-[opacity,transform] duration-200",
        visible && "pointer-events-auto translate-y-0 opacity-100",
        !visible && "translate-y-2",
      )}
    >
      <ToolbarButton label="Bold" onClick={() => document.execCommand("bold")}>
        <Bold />
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => document.execCommand("italic")}>
        <Italic />
      </ToolbarButton>
      <ToolbarButton label="Underline" onClick={() => document.execCommand("underline")}>
        <Underline />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" onClick={() => document.execCommand("strikeThrough")}>
        <Strikethrough />
      </ToolbarButton>
      <ToolbarButton label="Code block" onClick={onCode}>
        <Code2 />
      </ToolbarButton>
      <ToolbarButton label="Link" onClick={onLink}>
        <Link2 />
      </ToolbarButton>
    </div>
  );
}
