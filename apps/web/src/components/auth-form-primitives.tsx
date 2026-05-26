import { Button } from "@amend/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@amend/ui/components/field";
import { Input } from "@amend/ui/components/input";
import type { ComponentProps, ReactNode } from "react";

type AuthFormHeaderProps = {
  action: ReactNode;
  description: string;
  title: string;
};

type AuthFormErrorProps = {
  message: string;
};

type AuthSubmitButtonProps = {
  children: ReactNode;
  disabled: boolean;
  pending: boolean;
  pendingLabel: string;
};

type AuthTextFieldProps = {
  action?: ReactNode;
  errors?: Array<{ message?: string } | undefined>;
  id: string;
  label: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  type?: ComponentProps<"input">["type"];
  value: string;
};

const authSubmitButtonClass =
  "w-full border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground";

export function AuthFormHeader({ action, description, title }: AuthFormHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-center gap-1 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-balance text-muted-foreground">{description}</p>
      <p className="text-sm text-muted-foreground">{action}</p>
    </div>
  );
}

export function AuthSubmitButton({
  children,
  disabled,
  pending,
  pendingLabel,
}: AuthSubmitButtonProps) {
  return (
    <Field>
      <Button type="submit" className={authSubmitButtonClass} disabled={disabled}>
        {pending ? pendingLabel : children}
      </Button>
    </Field>
  );
}

export function AuthTextField({
  action,
  errors,
  id,
  label,
  onBlur,
  onChange,
  placeholder,
  type,
  value,
}: AuthTextFieldProps) {
  const invalid = Boolean(errors?.length);

  return (
    <Field data-invalid={invalid}>
      {action ? (
        <div className="flex items-center justify-between gap-3">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {action}
        </div>
      ) : (
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      )}
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
      />
      <FieldError errors={errors} />
    </Field>
  );
}

export function AuthFormError({ message }: AuthFormErrorProps) {
  if (!message) return null;

  return (
    <Field data-invalid>
      <FieldDescription
        role="alert"
        className="border border-destructive/30 bg-destructive/10 p-3 text-destructive"
      >
        {message}
      </FieldDescription>
    </Field>
  );
}
