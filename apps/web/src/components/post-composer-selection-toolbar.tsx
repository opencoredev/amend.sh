import { cn } from "@amend/ui/lib/utils";
import { Bold, Code2, Italic, Link2, Strikethrough, Underline } from "@/lib/icons";

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
        "pointer-events-none absolute -top-12 left-0 z-30 flex items-center gap-0.5 rounded-xl bg-popover p-1 text-popover-foreground opacity-0 shadow-[0_18px_50px_rgb(0_0_0/0.45)] ring-1 ring-white/[0.07] transition-[opacity,transform] duration-200",
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
