import { api } from "@amend/backend/convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState, type FormEvent } from "react";
import z from "zod";

import { Check, Loader2, Mail } from "@/lib/icons";
import { identifyAndCapturePostHogEvent } from "@/lib/posthog";

import { ctaPrimary, useSignedIn } from "./home-cta";

/**
 * Inline hero waitlist capture. The product is pre-launch, so the whole landing
 * page funnels to one waitlist — the `/sign-up` route already collects emails
 * through `amend:joinWaitlist`. This pulls that capture forward into the hero so
 * a visitor can join in one field without ever leaving the first screen, which
 * is the single highest-converting place to ask.
 *
 * The mutation is an idempotent upsert keyed on email, so repeat submits are
 * harmless. Email is validated client-side with the same Zod check the sign-up
 * form uses; the server lowercases and de-dupes.
 */
const emailSchema = z.email();

type Status = "idle" | "submitting" | "done";

export function HomeWaitlist() {
  const signedIn = useSignedIn();
  const joinWaitlist = useMutation(api.amend.joinWaitlist);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!emailSchema.safeParse(value).success) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      await joinWaitlist({ email: value, source: "landing-hero" });
      void identifyAndCapturePostHogEvent({
        event: "waitlist_joined",
        identity: { email: value },
        properties: { source: "landing-hero", surface: "landing_hero" },
      });
      setEmail(value);
      setStatus("done");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong. Please try again.",
      );
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-9 w-full max-w-lg">
        <div role="status" className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-amend-warm/15 text-amend-warm ring-1 ring-amend-warm/25">
            <Check className="size-5" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">You&rsquo;re on the list.</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              We&rsquo;ll email <span className="text-foreground">{email}</span> the moment
              production access opens.
            </p>
          </div>
          <HeroSecondaryLink signedIn={signedIn} className="mt-1" />
        </div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <div className="mt-9 w-full max-w-lg">
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label="Join the waitlist"
        className="flex flex-col gap-2.5 sm:flex-row"
      >
        <div className="relative flex-1">
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <Mail
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="waitlist-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            disabled={submitting}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError("");
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby="waitlist-hint"
            className="h-12 w-full rounded-lg bg-white/[0.04] pl-10 pr-3.5 text-left text-sm text-foreground ring-1 ring-inset ring-white/[0.12] outline-none transition-[box-shadow,background-color] duration-150 ease-out placeholder:text-muted-foreground/70 focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/30 disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className={`${ctaPrimary} inline-flex h-12 w-full items-center px-6 text-sm disabled:opacity-70 sm:w-auto`}
        >
          {submitting ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Joining&hellip;
            </>
          ) : (
            <>
              Join the waitlist
              <span className="amend-link-arrow" aria-hidden>
                &rarr;
              </span>
            </>
          )}
        </button>
      </form>

      <p
        id="waitlist-hint"
        role={error ? "alert" : undefined}
        className={`mt-3 text-xs leading-5 ${error ? "text-destructive" : "text-muted-foreground/80"}`}
      >
        {error ? error : "Be first in when production access opens — one email, no spam."}
      </p>

      <HeroSecondaryLink signedIn={signedIn} className="mt-4" />
    </div>
  );
}

function HeroSecondaryLink({ signedIn, className }: { signedIn: boolean; className?: string }) {
  const classes =
    "group inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground" +
    (className ? ` ${className}` : "");

  if (signedIn) {
    return (
      <Link to="/dashboard" className={classes}>
        Go to the dashboard
        <span className="amend-link-arrow" aria-hidden>
          &rarr;
        </span>
      </Link>
    );
  }

  return (
    <a href="#features" className={classes}>
      See how it works
      <span className="amend-link-arrow" aria-hidden>
        &rarr;
      </span>
    </a>
  );
}
