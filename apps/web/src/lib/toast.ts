import { toast as sonnerToast } from "sonner";

type ToastAction = { title: string; onClick: () => void };

type ToastOptions = {
  title?: string;
  description?: string;
  duration?: number;
  button?: ToastAction;
};

type ToastInput = string | ToastOptions;

function sonnerOptions(options: ToastOptions) {
  return {
    ...(options.description ? { description: options.description } : {}),
    ...(options.duration ? { duration: options.duration } : {}),
    ...(options.button
      ? { action: { label: options.button.title, onClick: options.button.onClick } }
      : {}),
  };
}

function split(input: ToastInput, fallbackTitle: string) {
  if (typeof input === "string") {
    return { title: input || fallbackTitle, options: {} };
  }
  return { title: input.title ?? fallbackTitle, options: sonnerOptions(input) };
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
    const { title, options } = split(input, "Done");
    return sonnerToast.success(title, options);
  },
  error(input: ToastInput) {
    const { title, options } = split(input, "Action failed");
    return sonnerToast.error(title, { duration: 8000, ...options });
  },
  info(input: ToastInput) {
    const { title, options } = split(input, "Heads up");
    return sonnerToast.info(title, options);
  },
  warning(input: ToastInput) {
    const { title, options } = split(input, "Needs attention");
    return sonnerToast.warning(title, options);
  },
  clear() {
    sonnerToast.dismiss();
  },
};
