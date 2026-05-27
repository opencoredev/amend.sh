import { FieldGroup } from "@amend/ui/components/field";
import { useForm } from "@tanstack/react-form";
import { Link, useSearch } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { lazy, Suspense, useState } from "react";
import z from "zod";

import {
  AuthFormError,
  AuthFormHeader,
  AuthSubmitButton,
  AuthTextField,
} from "@/components/auth-form-primitives";
import {
  joinSeededDemoWorkspaceMutation,
  localDemoWorkspaceSlug,
} from "@/components/dev-demo-sign-in-model";
import { parsePortalRedirectTo } from "@/lib/auth-redirects";
import { authErrorMessage } from "@/lib/auth-errors";
import { authClient } from "@/lib/auth-client";
import { demoWorkspaceSlug } from "@/lib/demo-workspace";
import { capturePostHogEvent, identifyAndCapturePostHogEvent } from "@/lib/posthog";
import { toast } from "@/lib/toast";

const DevDemoSignInButton = import.meta.env.DEV
  ? lazy(async () => ({
      default: (await import("@/components/dev-demo-sign-in-button")).DevDemoSignInButton,
    }))
  : null;

const previewAuthEnabled = import.meta.env.VITE_AMEND_PREVIEW_AUTH === "true";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp?: () => void }) {
  const [formError, setFormError] = useState("");
  const search = useSearch({ from: "/sign-in" }) as { redirectTo?: string };
  const portalRedirect = parsePortalRedirectTo(search.redirectTo);
  const joinSeededDemoWorkspace = useMutation(joinSeededDemoWorkspaceMutation);

  function navigateToDashboardAfterSignIn(workspace = demoWorkspaceSlug) {
    window.location.assign(`/dashboard/proactivation?workspace=${encodeURIComponent(workspace)}`);
  }

  function navigateAfterEmailSignIn() {
    if (portalRedirect) {
      const hash = portalRedirect.section ? `#${encodeURIComponent(portalRedirect.section)}` : "";
      window.location.assign(`/portal/${encodeURIComponent(portalRedirect.workspaceSlug)}${hash}`);
      return;
    }

    navigateToDashboardAfterSignIn();
  }

  async function createPreviewAccount(value: { email: string; password: string }) {
    return await new Promise<{ message?: string; ok: boolean }>((resolve) => {
      void authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: previewNameFromEmail(value.email),
        },
        {
          onSuccess: () => {
            void identifyAndCapturePostHogEvent({
              event: "user_signed_up",
              identity: { email: value.email, name: previewNameFromEmail(value.email) },
              properties: {
                method: "email",
                preview_auth_enabled: previewAuthEnabled,
                surface: "sign_in_preview_fallback",
              },
            });
            resolve({ ok: true });
          },
          onError: (error) =>
            resolve({
              ok: false,
              message: authErrorMessage(error, "This preview is private."),
            }),
        },
      );
    });
  }

  async function joinPreviewWorkspace(email: string) {
    if (!previewAuthEnabled) {
      return;
    }

    await joinSeededDemoWorkspace({
      email,
      name: previewNameFromEmail(email),
      workspaceSlug: localDemoWorkspaceSlug,
    });
  }

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      void capturePostHogEvent("sign_in_submitted", {
        method: "email",
        preview_auth_enabled: previewAuthEnabled,
        surface: portalRedirect ? "portal_redirect" : "sign_in_page",
      });
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: async () => {
            void identifyAndCapturePostHogEvent({
              event: "user_signed_in",
              identity: { email: value.email },
              properties: {
                method: "email",
                preview_auth_enabled: previewAuthEnabled,
                surface: portalRedirect ? "portal_redirect" : "sign_in_page",
              },
            });
            await joinPreviewWorkspace(value.email);
            navigateAfterEmailSignIn();
            toast.success("Sign in successful");
          },
          onError: async (error) => {
            if (previewAuthEnabled) {
              const signUpResult = await createPreviewAccount(value);
              if (signUpResult.ok) {
                await joinPreviewWorkspace(value.email);
                void identifyAndCapturePostHogEvent({
                  event: "user_signed_in",
                  identity: { email: value.email },
                  properties: {
                    method: "email",
                    preview_auth_enabled: previewAuthEnabled,
                    surface: "sign_in_preview_fallback",
                  },
                });
                navigateAfterEmailSignIn();
                toast.success("Preview account ready");
                return;
              }

              const message = signUpResult.message ?? "This preview is private.";
              void capturePostHogEvent("sign_up_failed", {
                method: "email",
                preview_auth_enabled: previewAuthEnabled,
                surface: "sign_in_preview_fallback",
              });
              setFormError(message);
              toast.error({
                title: "Preview account was not created",
                description: message,
              });
              return;
            }

            const message = authErrorMessage(
              error,
              "Sign in failed because the email or password was not accepted. Check both fields and try again.",
            );
            void capturePostHogEvent("sign_in_failed", {
              method: "email",
              preview_auth_enabled: previewAuthEnabled,
              surface: portalRedirect ? "portal_redirect" : "sign_in_page",
            });
            setFormError(message);
            toast.error({
              title: "Sign in failed",
              description: message,
            });
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <div className="w-full">
      <AuthFormHeader
        title="Sign in to Amend"
        description={
          previewAuthEnabled
            ? "This preview is private. Use an allowlisted email to open the seeded workspace."
            : "Enter your email and password to open your workspace."
        }
        action={
          previewAuthEnabled ? (
            <>
              No account?{" "}
              <Link
                to="/sign-up"
                onClick={(event) => {
                  if (!onSwitchToSignUp) return;
                  event.preventDefault();
                  onSwitchToSignUp();
                }}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign up for a new account
              </Link>
            </>
          ) : (
            <>
              No account? <span className="text-foreground">Production access is private.</span>
            </>
          )
        }
      />

      {DevDemoSignInButton ? (
        <Suspense fallback={null}>
          <DevDemoSignInButton onError={setFormError} onSuccess={navigateToDashboardAfterSignIn} />
        </Suspense>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => (
              <AuthTextField
                id={field.name}
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                errors={field.state.meta.errors}
              />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <AuthTextField
                id={field.name}
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                errors={field.state.meta.errors}
                action={
                  <a
                    href="mailto:support@amend.sh?subject=Amend.sh%20password%20reset"
                    className="text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                }
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <AuthSubmitButton
                disabled={!canSubmit || isSubmitting}
                pending={isSubmitting}
                pendingLabel="Signing in..."
              >
                Sign in
              </AuthSubmitButton>
            )}
          </form.Subscribe>

          <AuthFormError message={formError} />
        </FieldGroup>
      </form>
    </div>
  );
}

function previewNameFromEmail(email: string) {
  const name = email
    .split("@")[0]
    ?.replace(/[._-]+/g, " ")
    .trim();
  return name || "Preview user";
}
