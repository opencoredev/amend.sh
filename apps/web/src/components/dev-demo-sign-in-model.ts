import { api } from "@amend/backend/convex/_generated/api";

import { authErrorMessage } from "@/lib/auth-errors";
import { demoWorkspaceSlug } from "@/lib/demo-workspace";
import { authClient } from "@/lib/auth-client";

export const localDemoWorkspaceSlug = demoWorkspaceSlug;
export const seedDemoDataMutation = api.amend.seedDemoData;
export const joinSeededDemoWorkspaceMutation = api.amend.joinSeededDemoWorkspace;

// Convex mutations queue indefinitely while the client cannot reach the
// deployment (for example when a per-worktree dev deployment expired), so
// bound demo calls instead of letting the button spin forever.
export async function withDemoTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new Error(
          `${label} timed out. The Convex deployment in apps/web/.env may be unreachable or expired — restart the dev stack or run bun scripts/setup-agentic-convex.ts.`,
        ),
      );
    }, 15_000);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export const devDemoAccount = {
  email: "developer@amend.sh",
  name: "Amend Demo Developer",
  password: "amend-demo-local",
};

// The onboarding demo signs into a brand-new throwaway account each time so it
// always lands with zero projects and walks the full first-run onboarding. A
// timestamped local-part guarantees a fresh, project-less identity per run.
export function freshDemoCredentials() {
  return {
    email: `founder+${Date.now().toString(36)}@amend.sh`,
    name: "Amend Founder",
    password: "amend-demo-local",
  };
}

export async function signInEmail(email: string, password: string) {
  return await new Promise<{ message?: string; ok: boolean }>((resolve) => {
    void authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => resolve({ ok: true }),
        onError: (error) =>
          resolve({
            ok: false,
            message: authErrorMessage(error, "The seeded demo account could not sign in."),
          }),
      },
    );
  });
}

export async function signUpEmail(email: string, password: string, name: string) {
  return await new Promise<{ message?: string; ok: boolean }>((resolve) => {
    void authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onSuccess: () => resolve({ ok: true }),
        onError: (error) =>
          resolve({
            ok: false,
            message: authErrorMessage(error, "The seeded demo account could not be created."),
          }),
      },
    );
  });
}
