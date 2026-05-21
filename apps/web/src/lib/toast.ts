import { sileo, type SileoOptions } from "sileo";

type ToastInput = string | SileoOptions;

const defaultStyles = {
  badge: "bg-white/10",
  button: "bg-white/10 text-white hover:bg-white/15",
  description: "text-white/70",
  title: "text-white",
};

function normalizeToast(input: ToastInput, fallbackTitle: string): SileoOptions {
  if (typeof input === "string") {
    return { title: input || fallbackTitle };
  }
  return { title: fallbackTitle, ...input };
}

function withDefaults(options: SileoOptions): SileoOptions {
  const { styles, ...rest } = options;
  return {
    duration: 5200,
    fill: "#111111",
    roundness: 12,
    ...rest,
    styles: {
      ...defaultStyles,
      ...styles,
    },
  };
}

export function errorMessage(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!raw.trim()) {
    return fallback;
  }

  if (raw.includes("Project not found in this workspace")) {
    return fallback;
  }

  const uncaught = raw.match(/Uncaught Error:\s*([\s\S]*?)(?:\s+at\s|\s+Called by client|$)/);
  const message = (uncaught?.[1] ?? raw)
    .replace(/\[CONVEX[^\]]*]\s*/g, "")
    .replace(/\[Request ID:[^\]]*]\s*/g, "")
    .replace(/Server Error\s*/g, "")
    .replace(/Called by client\s*/g, "")
    .trim();

  if (
    !message ||
    message.includes("../convex/") ||
    message.includes("Request ID") ||
    message.length > 240
  ) {
    return fallback;
  }

  return message;
}

export const toast = {
  success(input: ToastInput) {
    return sileo.success(withDefaults(normalizeToast(input, "Done")));
  },
  error(input: ToastInput) {
    return sileo.error(
      withDefaults({
        duration: 8000,
        ...normalizeToast(input, "Action failed"),
      }),
    );
  },
  info(input: ToastInput) {
    return sileo.info(withDefaults(normalizeToast(input, "Heads up")));
  },
  warning(input: ToastInput) {
    return sileo.warning(withDefaults(normalizeToast(input, "Needs attention")));
  },
  clear() {
    sileo.clear();
  },
};
