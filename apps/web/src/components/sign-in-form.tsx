import { Button } from "@amend/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@amend/ui/components/field";
import { Input } from "@amend/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp?: () => void }) {
  const [formError, setFormError] = useState("");
  const navigate = useNavigate({
    from: "/",
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              params: { view: "agent" },
              search: {},
              to: "/dashboard/$view",
            });
            toast.success("Sign in successful");
          },
          onError: (error) => {
            const message =
              error.error.message ||
              error.error.statusText ||
              "Sign in failed because the email or password was not accepted. Check both fields and try again.";
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
      <div className="mb-6 flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Sign in to Amend</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Enter your email and password to open your workspace.
        </p>
        <p className="text-sm text-muted-foreground">
          No account?{" "}
          <Link
            to="/sign-up"
            onClick={(event) => {
              if (!onSwitchToSignUp) return;
              event.preventDefault();
              onSwitchToSignUp();
            }}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up for a new account
          </Link>
        </p>
      </div>

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
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="Enter your email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <a
                    href="mailto:support@amend.sh?subject=Amend.sh%20password%20reset"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="Enter your password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Field>
                <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </Field>
            )}
          </form.Subscribe>

          {formError ? (
            <Field data-invalid>
              <FieldDescription
                role="alert"
                className="border border-destructive/30 bg-destructive/10 p-3 text-destructive"
              >
                {formError}
              </FieldDescription>
            </Field>
          ) : null}
        </FieldGroup>
      </form>
    </div>
  );
}
