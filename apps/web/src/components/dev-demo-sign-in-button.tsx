import { Button } from "@amend/ui/components/button";
import { useMutation } from "convex/react";
import { KeyRound } from "lucide-react";
import { useState } from "react";

import {
  devDemoAccount,
  joinSeededDemoWorkspaceMutation,
  localDemoWorkspaceSlug,
  seedDemoDataMutation,
  signInEmail,
  signUpEmail,
} from "@/components/dev-demo-sign-in-model";
import { toast } from "@/lib/toast";

type DevDemoSignInButtonProps = {
  onError: (message: string) => void;
  onSuccess: (workspaceSlug: string) => void;
};

export function DevDemoSignInButton({ onError, onSuccess }: DevDemoSignInButtonProps) {
  const [pending, setPending] = useState(false);
  const seedDemoData = useMutation(seedDemoDataMutation);
  const joinSeededDemoWorkspace = useMutation(joinSeededDemoWorkspaceMutation);

  async function signInWithSeededDemo() {
    onError("");
    setPending(true);
    try {
      await seedDemoData({ workspaceSlug: localDemoWorkspaceSlug });
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

      await joinSeededDemoWorkspace({
        email: devDemoAccount.email,
        name: devDemoAccount.name,
        workspaceSlug: localDemoWorkspaceSlug,
      });
      onSuccess(localDemoWorkspaceSlug);
      toast.success("Seeded demo workspace ready");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The local demo sign-in could not start. Make sure the local dev stack is running.";
      onError(message);
      toast.error({
        title: "Demo sign-in failed",
        description: message,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-6">
      <Button
        type="button"
        className="w-full border border-border bg-background text-foreground hover:border-foreground hover:bg-muted"
        disabled={pending}
        onClick={() => {
          void signInWithSeededDemo();
        }}
      >
        <KeyRound className="size-4" aria-hidden="true" />
        {pending ? "Preparing seeded demo..." : "Continue with local demo"}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Development only. Seeds the Amend demo workspace and opens the agent command center.
      </p>
      <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>Email sign in</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
