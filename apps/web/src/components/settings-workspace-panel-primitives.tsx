import { Button } from "@amend/ui/components/button";
import type { ReactNode } from "react";

export function SettingsSaveButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      className="h-9 rounded-lg bg-foreground px-3.5 text-xs text-background hover:bg-background hover:text-foreground"
      disabled={disabled}
      onClick={onClick}
    >
      Save
    </Button>
  );
}

export function SettingsField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
