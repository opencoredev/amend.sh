import { makeFunctionReference } from "convex/server";

import { authErrorMessage } from "@/lib/auth-errors";
import { demoWorkspaceSlug } from "@/lib/demo-workspace";
import { authClient } from "@/lib/auth-client";

export const localDemoWorkspaceSlug = demoWorkspaceSlug;
export const seedDemoDataMutation = makeFunctionReference<"mutation">("amend:seedDemoData");
export const joinSeededDemoWorkspaceMutation = makeFunctionReference<"mutation">(
  "amend:joinSeededDemoWorkspace",
);

export const devDemoAccount = {
  email: "developer@amend.sh",
  name: "Amend Demo Developer",
  password: "amend-demo-local",
};

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
