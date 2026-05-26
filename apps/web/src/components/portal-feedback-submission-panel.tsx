import { Button, buttonVariants } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Lightbulb } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { FeedbackMode } from "@/components/public-portal-types";
import { portalRedirectTo } from "@/lib/auth-redirects";
import { authClient } from "@/lib/auth-client";

const feedbackMutation = makeFunctionReference<"mutation">("amend:createFeedback");

export function FeedbackSubmissionPanel({
  feedbackMode,
  workspaceSlug,
}: {
  feedbackMode: FeedbackMode;
  workspaceSlug: string;
}) {
  const session = authClient.useSession();
  const isAuthenticated = Boolean(session.data?.user);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "submitting">("idle");
  const [error, setError] = useState("");
  const disabled =
    feedbackMode === "closed" || (feedbackMode === "authenticated" && !isAuthenticated);
  const createFeedback = useMutation(feedbackMutation);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }
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

  if (feedbackMode === "closed") {
    return (
      <section className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Feedback is closed for this workspace, but shipped records remain visible.
      </section>
    );
  }

  if (feedbackMode === "authenticated" && !isAuthenticated) {
    return (
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Got an idea?</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to submit feedback and receive shipped updates.
        </p>
        <Link
          to="/sign-in"
          search={{ redirectTo: portalRedirectTo(workspaceSlug, "feedback") }}
          className={cn(buttonVariants({ size: "sm" }), "mt-4 h-9 w-full")}
        >
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={submitFeedback} className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Got an idea?</h2>
      </div>
      <div className="mt-4 grid gap-2">
        <Input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Request title"
        />
        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={session.data?.user.email ?? "Email for updates"}
          type="email"
        />
        <textarea
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What should change?"
          className="min-h-24 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>
      <Button type="submit" className="mt-3 w-full" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting" : "Submit a post"}
      </Button>
      <div className="mt-2 min-h-4 text-xs text-muted-foreground">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : state === "sent" ? (
          "Request sent for triage."
        ) : null}
      </div>
    </form>
  );
}
