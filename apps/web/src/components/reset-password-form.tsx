import { FieldGroup } from "@amend/ui/components/field";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

import {
  AuthFormError,
  AuthFormHeader,
  AuthSubmitButton,
  AuthTextField,
} from "@/components/auth-form-primitives";
import { toast } from "@/lib/toast";

export default function ResetPasswordForm() {
  const [formError, setFormError] = useState("");
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/reset-password" }) as { error?: string; token?: string };
  const token = typeof search.token === "string" ? search.token : "";
  const invalidToken = search.error === "INVALID_TOKEN";
  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      try {
        const response = await fetch("/api/auth/reset-password", {
          body: JSON.stringify({
            newPassword: value.password,
            token,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            typeof payload.message === "string"
              ? payload.message
              : "The reset link is invalid or expired.",
          );
        }
        setResetComplete(true);
        toast.success("Password updated");
        setTimeout(() => {
          void navigate({ to: "/sign-in" });
        }, 700);
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "The password could not be updated.";
        setFormError(message);
        toast.error({
          title: "Password reset failed",
          description: message,
        });
      }
    },
    validators: {
      onSubmit: z.object({
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (invalidToken || !token) {
    return (
      <div className="w-full">
        <AuthFormHeader
          title="Reset link expired"
          description="Request a new password reset link from the sign-in screen."
          action={
            <Link
              to="/sign-in"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <AuthFormHeader
        title="Choose a new password"
        description="Enter a new password for your Amend account."
        action={
          <Link
            to="/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        }
      />

      {resetComplete ? (
        <div className="mb-6 border border-border bg-card/40 p-3 text-center text-sm text-muted-foreground">
          Password updated. Sending you back to sign in.
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
          <form.Field name="password">
            {(field) => (
              <AuthTextField
                id={field.name}
                label="New password"
                type="password"
                placeholder="Create a new password"
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
                disabled={!canSubmit || isSubmitting || resetComplete}
                pending={isSubmitting}
                pendingLabel="Updating password..."
              >
                Update password
              </AuthSubmitButton>
            )}
          </form.Subscribe>

          <AuthFormError message={formError} />
        </FieldGroup>
      </form>
    </div>
  );
}
