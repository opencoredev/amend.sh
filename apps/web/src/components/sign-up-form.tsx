import { FieldGroup } from "@amend/ui/components/field";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useState } from "react";
import z from "zod";

import {
  AuthFormError,
  AuthFormHeader,
  AuthSubmitButton,
  AuthTextField,
} from "@/components/auth-form-primitives";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { demoWorkspaceSlug } from "@/lib/demo-workspace";
import { capturePostHogEvent, identifyAndCapturePostHogEvent } from "@/lib/posthog";
import { toast } from "@/lib/toast";

const previewAuthEnabled = import.meta.env.VITE_AMEND_PREVIEW_AUTH === "true";
const requestWaitlistCodeAction = makeFunctionReference<"action">("waitlist:requestCode");
const verifyWaitlistCodeAction = makeFunctionReference<"action">("waitlist:verifyCode");

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  if (!previewAuthEnabled) {
    return <WaitlistSignUpForm onSwitchToSignIn={onSwitchToSignIn} />;
  }

  return <PreviewSignUpForm onSwitchToSignIn={onSwitchToSignIn} />;
}

function WaitlistSignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  const [formError, setFormError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const requestWaitlistCode = useAction(requestWaitlistCodeAction);
  const verifyWaitlistCode = useAction(verifyWaitlistCodeAction);
  const requestForm = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const email = value.email.trim().toLowerCase();
      setFormError("");
      setVerifiedEmail("");
      try {
        await requestWaitlistCode({ email });
        setPendingEmail(email);
        toast.success("Verification code sent");
      } catch (error) {
        const message = waitlistErrorMessage(
          error,
          "The waitlist email could not be sent. Try again in a minute.",
        );
        setFormError(message);
        toast.error({
          title: "Code was not sent",
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
  const verifyForm = useForm({
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      try {
        const result = await verifyWaitlistCode({
          code: value.code,
          email: pendingEmail,
        });
        setVerifiedEmail(result.email);
        toast.success("Email verified");
      } catch (error) {
        const message = waitlistErrorMessage(
          error,
          "That code is invalid or expired. Request a new code and try again.",
        );
        setFormError(message);
        toast.error({
          title: "Email was not verified",
          description: message,
        });
      }
    },
    validators: {
      onSubmit: z.object({
        code: z.string().regex(/^\d{6}$/, "Enter the six-digit code"),
      }),
    },
  });

  return (
    <div className="w-full">
      <AuthFormHeader
        title="Join the Amend waitlist"
        description="Verify your email for private access review. This does not create an account or open the workspace."
        action={
          <>
            Already invited?{" "}
            <Link
              to="/sign-in"
              onClick={(event) => {
                if (!onSwitchToSignIn) return;
                event.preventDefault();
                onSwitchToSignIn();
              }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          requestForm.handleSubmit();
        }}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <requestForm.Field name="email">
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
          </requestForm.Field>

          <requestForm.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <AuthSubmitButton
                disabled={!canSubmit || isSubmitting}
                pending={isSubmitting}
                pendingLabel="Sending code..."
              >
                Send verification code
              </AuthSubmitButton>
            )}
          </requestForm.Subscribe>
        </FieldGroup>
      </form>

      {pendingEmail ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            verifyForm.handleSubmit();
          }}
          className="mt-6 flex flex-col gap-6 border-t border-border pt-6"
        >
          <FieldGroup>
            <verifyForm.Field name="code">
              {(field) => (
                <AuthTextField
                  id={field.name}
                  label="Verification code"
                  type="text"
                  placeholder="000000"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(value) => field.handleChange(value.replace(/\D/g, "").slice(0, 6))}
                  errors={field.state.meta.errors}
                />
              )}
            </verifyForm.Field>

            <verifyForm.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <AuthSubmitButton
                  disabled={!canSubmit || isSubmitting || Boolean(verifiedEmail)}
                  pending={isSubmitting}
                  pendingLabel="Verifying..."
                >
                  Verify email
                </AuthSubmitButton>
              )}
            </verifyForm.Subscribe>
          </FieldGroup>
        </form>
      ) : null}

      {verifiedEmail ? (
        <p className="mt-4 border border-foreground/20 bg-foreground/5 p-3 text-center text-sm text-muted-foreground">
          {verifiedEmail} is verified for the waitlist. We will reach out when access is ready.
        </p>
      ) : null}

      <AuthFormError message={formError} />
    </div>
  );
}

function PreviewSignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  const [formError, setFormError] = useState("");
  const navigate = useNavigate({ from: "/" });
  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      void capturePostHogEvent("sign_up_submitted", {
        method: "email",
        preview_auth_enabled: previewAuthEnabled,
        surface: "sign_up_page",
      });
      await authClient.signUp.email(
        {
          email: value.email,
          name: value.name,
          password: value.password,
        },
        {
          onSuccess: () => {
            void identifyAndCapturePostHogEvent({
              event: "user_signed_up",
              identity: { email: value.email, name: value.name },
              properties: {
                method: "email",
                preview_auth_enabled: previewAuthEnabled,
                surface: "sign_up_page",
              },
            });
            toast.success("Account created");
            navigate({
              params: { view: "setup" },
              search: { workspace: demoWorkspaceSlug },
              to: "/dashboard/$view",
            });
          },
          onError: (error) => {
            const message = authErrorMessage(
              error,
              "Sign up failed because the account could not be created. Check the fields and try again.",
            );
            void capturePostHogEvent("sign_up_failed", {
              method: "email",
              preview_auth_enabled: previewAuthEnabled,
              surface: "sign_up_page",
            });
            setFormError(message);
            toast.error({
              title: "Sign up failed",
              description: message,
            });
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        name: z.string().min(2, "Name must be at least 2 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <div className="w-full">
      <AuthFormHeader
        title="Create your Amend account"
        description="Start a workspace for feedback, roadmap, changelog, agent runs, and analytics."
        action={
          <>
            Already have an account?{" "}
            <Link
              to="/sign-in"
              onClick={(event) => {
                if (!onSwitchToSignIn) return;
                event.preventDefault();
                onSwitchToSignIn();
              }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <form.Field name="name">
            {(field) => (
              <AuthTextField
                id={field.name}
                label="Name"
                placeholder="Ada Lovelace"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                errors={field.state.meta.errors}
              />
            )}
          </form.Field>

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

          <form.Field name="password">
            {(field) => (
              <AuthTextField
                id={field.name}
                label="Password"
                type="password"
                placeholder="Create a password"
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
                pendingLabel="Creating account..."
              >
                Create account
              </AuthSubmitButton>
            )}
          </form.Subscribe>

          <AuthFormError message={formError} />
        </FieldGroup>
      </form>
    </div>
  );
}

function waitlistErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
}
