import { FieldGroup } from "@amend/ui/components/field";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useState } from "react";
import z from "zod";

import {
  AuthFormError,
  AuthFormHeader,
  AuthSubmitButton,
  AuthTextField,
} from "@/components/auth-form-primitives";
import { authEmailSearch } from "@/lib/auth-email-search";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { demoWorkspaceSlug } from "@/lib/demo-workspace";
import { capturePostHogEvent, identifyAndCapturePostHogEvent } from "@/lib/posthog";
import { toast } from "@/lib/toast";

const previewAuthEnabled = import.meta.env.VITE_AMEND_PREVIEW_AUTH === "true";
const joinWaitlistMutation = makeFunctionReference<"mutation">("amend:joinWaitlist");

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  if (!previewAuthEnabled) {
    return <GatedSignUpForm onSwitchToSignIn={onSwitchToSignIn} />;
  }

  return <PreviewSignUpForm onSwitchToSignIn={onSwitchToSignIn} />;
}

function GatedSignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  const [formError, setFormError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const search = useSearch({ from: "/sign-up" }) as { email?: string };
  const joinWaitlist = useMutation(joinWaitlistMutation);
  const form = useForm({
    defaultValues: {
      company: "",
      email: search.email ?? "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      try {
        await joinWaitlist({
          company: value.company || undefined,
          email: value.email,
          name: value.name || undefined,
          source: "production-sign-up",
        });
        setSubmittedEmail(value.email);
        toast.success("You're on the waitlist");
        form.reset();
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "The waitlist request could not be saved. Try again.";
        setFormError(message);
        toast.error({
          title: "Waitlist request failed",
          description: message,
        });
      }
    },
    validators: {
      onSubmit: z.object({
        company: z.string(),
        email: z.email("Invalid email address"),
        name: z.string(),
      }),
    },
  });

  return (
    <div className="w-full">
      <AuthFormHeader
        title="Join the Amend waitlist"
        description="Leave your email and we will let you know when production access opens."
        action={
          <form.Subscribe selector={(state) => state.values.email}>
            {(email) => (
              <>
                Already have an account?{" "}
                <Link
                  to="/sign-in"
                  search={authEmailSearch(email)}
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
            )}
          </form.Subscribe>
        }
      />

      {submittedEmail ? (
        <div className="mb-6 border border-border bg-card/40 p-3 text-center text-sm text-muted-foreground">
          <span className="text-foreground">{submittedEmail}</span> is on the waitlist.
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

          <form.Field name="company">
            {(field) => (
              <AuthTextField
                id={field.name}
                label="Company"
                placeholder="Your company"
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
                pendingLabel="Joining waitlist..."
              >
                Join waitlist
              </AuthSubmitButton>
            )}
          </form.Subscribe>

          <AuthFormError message={formError} />
        </FieldGroup>
      </form>
    </div>
  );
}

function PreviewSignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  const [formError, setFormError] = useState("");
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/sign-up" }) as { email?: string };
  const form = useForm({
    defaultValues: {
      email: search.email ?? "",
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
          <form.Subscribe selector={(state) => state.values.email}>
            {(email) => (
              <>
                Already have an account?{" "}
                <Link
                  to="/sign-in"
                  search={authEmailSearch(email)}
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
            )}
          </form.Subscribe>
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
