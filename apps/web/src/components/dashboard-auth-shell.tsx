import { Link } from "@tanstack/react-router";

import AmendLogo from "@/components/amend-logo";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

type DashboardAuthShellProps = {
  showSignIn: boolean;
};

export default function DashboardAuthShell({ showSignIn }: DashboardAuthShellProps) {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <section className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <AmendLogo markVariant="mono" size="md" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{showSignIn ? <SignInForm /> : <SignUpForm />}</div>
        </div>
      </section>
      <section className="relative hidden bg-white lg:block">
        <img
          src="/auth-cover.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </section>
    </main>
  );
}
