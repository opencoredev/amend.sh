import { Button } from "@amend/ui/components/button";
import { useMutation } from "convex/react";
import { KeyRound, Sparkles } from "@/lib/icons";
import { useState } from "react";

import {
  devDemoAccount,
  freshDemoCredentials,
  joinSeededDemoWorkspaceMutation,
  localDemoWorkspaceSlug,
  signInEmail,
  signUpEmail,
  withDemoTimeout,
} from "@/components/dev-demo-sign-in-model";
import { toast } from "@/lib/toast";

type DevDemoSignInButtonProps = {
  onError: (message: string) => void;
  onFreshOnboarding: () => void;
  onSuccess: (workspaceSlug: string) => void;
};

type DemoMode = "seeded" | "fresh";

export function DevDemoSignInButton({
  onError,
  onFreshOnboarding,
  onSuccess,
}: DevDemoSignInButtonProps) {
  const [pending, setPending] = useState<DemoMode | null>(null);
  const joinSeededDemoWorkspace = useMutation(joinSeededDemoWorkspaceMutation);

  async function signInWithSeededDemo() {
    onError("");
    setPending("seeded");
    try {
      // Auth first, then a single seed-and-join round trip. joinSeededDemoWorkspace
      // already seeds the workspace via ensureDemoDataForWorkspace, so a separate
      // seedDemoData call would just duplicate the same work over the network.
      const signInResult = await signInEmail(devDemoAccount.email, devDemoAccount.password);
      if (!signInResult.ok) {
        const signUpResult = await signUpEmail(
          devDemoAccount.email,
          devDemoAccount.password,
          devDemoAccount.name,
        );
        if (!signUpResult.ok) {
          throw new Error(signUpResult.message || signInResult.message || "Demo sign-in failed.");
        }
      }

      await withDemoTimeout(
        joinSeededDemoWorkspace({
          email: devDemoAccount.email,
          name: devDemoAccount.name,
          workspaceSlug: localDemoWorkspaceSlug,
        }),
        "Joining the demo workspace",
      );
      onSuccess(localDemoWorkspaceSlug);
      toast.success("Seeded demo workspace ready");
    } catch (error) {
      reportFailure(error, "The local demo sign-in could not start.");
    } finally {
      setPending(null);
    }
  }

  async function startFreshOnboardingDemo() {
    onError("");
    setPending("fresh");
    try {
      const { email, name, password } = freshDemoCredentials();
      const signUpResult = await signUpEmail(email, password, name);
      if (!signUpResult.ok) {
        // Extremely unlikely with a timestamped email, but fall back to sign-in.
        const signInResult = await signInEmail(email, password);
        if (!signInResult.ok) {
          throw new Error(
            signUpResult.message || signInResult.message || "Fresh demo sign-up failed.",
          );
        }
      }
      onFreshOnboarding();
      toast.success("Fresh demo ready — starting onboarding");
    } catch (error) {
      reportFailure(error, "The onboarding demo could not start.");
    } finally {
      setPending(null);
    }
  }

  function reportFailure(error: unknown, fallback: string) {
    const message =
      error instanceof Error
        ? error.message
        : `${fallback} Make sure the local dev stack is running.`;
    onError(message);
    toast.error({ title: "Demo sign-in failed", description: message });
  }

  const busy = pending !== null;

  return (
    <div className="mb-6">
      <div className="grid gap-2">
        <Button
          type="button"
          className="w-full border border-border bg-background text-foreground hover:border-foreground hover:bg-muted"
          disabled={busy}
          onClick={() => {
            void signInWithSeededDemo();
          }}
        >
          <KeyRound className="size-4" aria-hidden="true" />
          {pending === "seeded" ? "Preparing seeded demo..." : "Open seeded demo workspace"}
        </Button>
        <Button
          type="button"
          className="w-full border border-border bg-background text-foreground hover:border-foreground hover:bg-muted"
          disabled={busy}
          onClick={() => {
            void startFreshOnboardingDemo();
          }}
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {pending === "fresh" ? "Starting onboarding..." : "Start a fresh demo (onboarding)"}
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Development only. Seeded opens the populated workspace; fresh starts a new account so you
        can walk the onboarding.
      </p>
      <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>Email sign in</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
