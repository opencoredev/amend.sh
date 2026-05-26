import { FieldGroup } from "@amend/ui/components/field";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { toast } from "@/lib/toast";

const previewAuthEnabled = import.meta.env.VITE_AMEND_PREVIEW_AUTH === "true";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  if (!previewAuthEnabled) {
    return <GatedSignUpForm onSwitchToSignIn={onSwitchToSignIn} />;
  }

  return <PreviewSignUpForm onSwitchToSignIn={onSwitchToSignIn} />;
}

function GatedSignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  return (
    <div className="w-full">
      <AuthFormHeader
        title="Private access"
        description="Amend is not accepting public sign-ups on this production instance."
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
      await authClient.signUp.email(
        {
          email: value.email,
          name: value.name,
          password: value.password,
        },
        {
          onSuccess: () => {
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
