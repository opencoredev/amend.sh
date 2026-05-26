import { Link } from "@tanstack/react-router";

import { AuthFormHeader } from "@/components/auth-form-primitives";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  return (
    <div className="w-full">
      <AuthFormHeader
        title="Amend Cloud is coming soon"
        description="Public signup is closed while the hosted workspace is being prepared. The landing page is live, but new accounts are invite-only for now."
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

      <div className="grid gap-5 border-y py-6 text-sm leading-6 text-muted-foreground">
        <p>
          We are connecting the hosted Amend experience to the production backend before opening
          self-serve accounts.
        </p>
        <p>
          If you already have access, sign in. Otherwise, check back soon for the public launch.
        </p>
        <Link
          to="/sign-in"
          onClick={(event) => {
            if (!onSwitchToSignIn) return;
            event.preventDefault();
            onSwitchToSignIn();
          }}
          className="inline-flex items-center justify-center border border-foreground bg-foreground px-5 py-3 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-transparent hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
