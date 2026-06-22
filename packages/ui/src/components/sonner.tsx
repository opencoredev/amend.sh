"use client";

import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert } from "@amend/ui/components/icons";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      icons={{
        success: <CircleCheck className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <OctagonX className="size-4" />,
        loading: <Loader2 className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          // Hover tokens for the close (X) button — without these sonner's
          // dark `:hover` rule resolves to an empty value and the button goes
          // transparent. Keep the lift subtle to match the rounded surface theme.
          "--normal-bg-hover": "color-mix(in oklab, var(--popover), #fff 8%)",
          "--normal-border-hover": "color-mix(in oklab, var(--border), #fff 14%)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
