import { Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useEffect, useState, type FormEvent } from "react";

import type { FeedbackMode } from "@/components/public-portal-types";
import { authClient } from "@/lib/auth-client";
import { portalRedirectTo } from "@/lib/auth-redirects";
import { Check, X } from "@/lib/icons";

const feedbackMutation = makeFunctionReference<"mutation">("amend:createFeedback");

export function PortalComposeDialog({
  feedbackMode,
  onClose,
  open,
  workspaceSlug,
}: {
  feedbackMode: FeedbackMode;
  onClose: () => void;
  open: boolean;
  workspaceSlug: string;
}) {
  const session = authClient.useSession();
  const isAuthenticated = Boolean(session.data?.user);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "submitting">("idle");
  const [error, setError] = useState("");
  const createFeedback = useMutation(feedbackMutation);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");
    try {
      await createFeedback({
        authorEmail: session.data?.user.email ?? (email || undefined),
        authorName: session.data?.user.name ?? undefined,
        body,
        sourceUrl: window.location.href,
        title,
        workspaceSlug,
      });
      setTitle("");
      setBody("");
      setEmail("");
      setState("sent");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Feedback request failed");
      setState("idle");
    }
  }

  const requiresSignIn = feedbackMode === "authenticated" && !isAuthenticated;
  const isClosed = feedbackMode === "closed";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-popover shadow-[0_24px_80px_rgb(0_0_0/0.55)] ring-1 ring-white/[0.08]">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold">Suggest a feature</h2>
            <p className="text-xs text-muted-foreground">Tell {workspaceSlug} what to build next</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75"
          >
            <X className="size-4" />
          </button>
        </div>

        {isClosed ? (
          <p className="p-5 text-sm leading-6 text-muted-foreground">
            Feedback is closed for this workspace right now, but the roadmap and shipped updates
            stay visible.
          </p>
        ) : requiresSignIn ? (
          <div className="p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in to share an idea and get notified when it ships.
            </p>
            <Link
              to="/sign-in"
              search={{ redirectTo: portalRedirectTo(workspaceSlug, "feedback") }}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-foreground bg-foreground text-sm font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/85"
            >
              Sign in to post
            </Link>
          </div>
        ) : state === "sent" ? (
          <div className="grid place-items-center gap-3 px-5 py-8 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-amend-success/15 text-amend-success ring-1 ring-amend-success/25">
              <Check className="size-6" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Thanks — it's in</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Your request was sent for triage. We'll follow the work and update you when it
                ships.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setState("idle")}
                className="inline-flex h-9 items-center rounded-lg bg-foreground/[0.06] px-4 text-sm font-medium ring-1 ring-white/[0.07] transition-colors duration-150 ease-linear hover:bg-foreground/[0.09]"
              >
                Submit another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center rounded-lg border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/85"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="grid gap-1 px-5 py-4">
              <input
                autoFocus
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Submission title"
                className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground/70"
              />
              <textarea
                required
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Add details — what should change, and why does it matter?"
                className="min-h-28 w-full resize-y bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
              />
              {!isAuthenticated ? (
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email for updates (optional)"
                  type="email"
                  className="mt-1 h-9 w-full rounded-lg border-transparent bg-[#151518] px-3 text-sm ring-1 ring-white/[0.055] outline-none transition-[box-shadow] duration-150 ease-linear placeholder:text-muted-foreground focus-visible:ring-white/[0.16]"
                />
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-3">
              <span className="text-xs text-destructive">{error}</span>
              <button
                type="submit"
                disabled={state === "submitting"}
                className="inline-flex h-9 items-center rounded-lg border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/85 disabled:opacity-40"
              >
                {state === "submitting" ? "Submitting…" : "Create"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
