import { FieldGroup } from "@amend/ui/components/field";
import { useForm } from "@tanstack/react-form";
import { Link, useSearch } from "@tanstack/react-router";
import { useConvex } from "convex/react";
import { lazy, Suspense, useState } from "react";
import z from "zod";

import {
  AuthFormError,
  AuthFormHeader,
  AuthSubmitButton,
  AuthTextField,
} from "@/components/auth-form-primitives";
import { authEmailSearch } from "@/lib/auth-email-search";
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
  const [passwordResetEmail, setPasswordResetEmail] = useState<string | null>(null);
  const search = useSearch({ from: "/sign-in" }) as { email?: string; redirectTo?: string };
  const portalRedirect = parsePortalRedirectTo(search.redirectTo);
  const convex = useConvex();

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

    const { joinSeededDemoWorkspaceMutation } = await import("@/components/dev-demo-sign-in-model");

    await convex.mutation(joinSeededDemoWorkspaceMutation, {
      email,
      name: previewNameFromEmail(email),
      workspaceSlug: demoWorkspaceSlug,
    });
  }

  const form = useForm({
    defaultValues: {
      email: search.email ?? "",
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

  if (passwordResetEmail !== null) {
    return (
      <ForgotPasswordForm
        initialEmail={passwordResetEmail}
        onBack={() => setPasswordResetEmail(null)}
      />
    );
  }

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
            <form.Subscribe selector={(state) => state.values.email}>
              {(email) => (
                <>
                  No account?{" "}
                  <Link
                    to="/sign-up"
                    search={authEmailSearch(email)}
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
              )}
            </form.Subscribe>
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
                  <form.Subscribe selector={(state) => state.values.email}>
                    {(email) => (
                      <button
                        type="button"
                        onClick={() => setPasswordResetEmail(email)}
                        className="text-sm text-foreground underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </form.Subscribe>
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

function ForgotPasswordForm({
  initialEmail,
  onBack,
}: {
  initialEmail: string;
  onBack: () => void;
}) {
  const [formError, setFormError] = useState("");
  const [resetRequested, setResetRequested] = useState(false);
  const form = useForm({
    defaultValues: {
      email: initialEmail,
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      setResetRequested(false);
      try {
        const response = await fetch("/api/auth/request-password-reset", {
          body: JSON.stringify({
            email: value.email,
            redirectTo: `${window.location.origin}/reset-password`,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            typeof payload.message === "string"
              ? payload.message
              : "The reset email could not be sent.",
          );
        }
        setResetRequested(true);
        toast.success("Reset requested");
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "The reset email could not send.";
        setFormError(message);
        toast.error({
          title: "Reset email failed",
          description: message,
        });
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  return (
    <div className="w-full">
      <AuthFormHeader
        title="Reset your password"
        description="Enter your account email and we will request a reset link."
        action={
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </button>
        }
      />

      {resetRequested ? (
        <div className="mb-6 border border-border bg-card/40 p-3 text-center text-sm text-muted-foreground">
          If the address is registered and email delivery is available, a reset link will arrive
          shortly.
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
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
                placeholder="you@company.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                errors={field.state.meta.errors}
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
                pendingLabel="Sending reset link..."
              >
                Send reset link
              </AuthSubmitButton>
            )}
          </form.Subscribe>

          <AuthFormError message={formError} />
        </FieldGroup>
      </form>
    </div>
  );
}
