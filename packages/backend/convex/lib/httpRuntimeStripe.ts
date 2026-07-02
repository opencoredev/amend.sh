import { api } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { planTier } from "./httpRuntimeEnumInputs";
import { numberValue } from "./httpRuntimeInputScalars";
import { optionalString, record } from "./httpRuntimeScalars";
import { verifyStripeWebhookSignature } from "./signatures";

declare const process: {
  env: {
    SITE_URL?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
  };
};

type StripeCheckoutTier = "pro" | "scale" | "starter" | "team";

const stripeCheckoutPlans: Record<
  StripeCheckoutTier,
  {
    name: string;
    priceMonthly: number;
    tier: StripeCheckoutTier;
  }
> = {
  pro: {
    name: "Amend Pro",
    priceMonthly: 49,
    tier: "pro",
  },
  scale: {
    name: "Amend Scale",
    priceMonthly: 249,
    tier: "scale",
  },
  starter: {
    name: "Amend Starter",
    priceMonthly: 19,
    tier: "starter",
  },
  team: {
    name: "Amend Team",
    priceMonthly: 99,
    tier: "team",
  },
};

export function stripeCheckoutPlan(tier: ReturnType<typeof planTier>) {
  return tier === "starter" || tier === "pro" || tier === "team" || tier === "scale"
    ? stripeCheckoutPlans[tier]
    : undefined;
}

export async function createStripeCheckoutSession(input: {
  cancelUrl?: string;
  customerEmail?: string;
  dryRun: boolean;
  seats: number;
  successUrl?: string;
  tier: StripeCheckoutTier;
  workspaceSlug: string;
}) {
  const plan = stripeCheckoutPlans[input.tier];
  const siteUrl = process.env.SITE_URL ?? "http://amend.localhost:1355";
  const successUrl =
    input.successUrl ??
    `${siteUrl.replace(/\/+$/, "")}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = input.cancelUrl ?? `${siteUrl.replace(/\/+$/, "")}/dashboard?checkout=cancel`;
  const seats = Math.max(1, Math.min(Math.trunc(input.seats), 1_000));

  if (input.dryRun || !process.env.STRIPE_SECRET_KEY) {
    return {
      checkoutUrl: successUrl.replace("{CHECKOUT_SESSION_ID}", "dry_run"),
      mode: "subscription",
      plan,
      provider: "dry-run",
      seats,
      workspaceSlug: input.workspaceSlug,
    };
  }

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("success_url", successUrl);
  body.set("cancel_url", cancelUrl);
  body.set("client_reference_id", input.workspaceSlug);
  body.set("allow_promotion_codes", "true");
  body.set("metadata[workspaceSlug]", input.workspaceSlug);
  body.set("metadata[tier]", input.tier);
  body.set("metadata[seats]", String(seats));
  body.set("subscription_data[metadata][workspaceSlug]", input.workspaceSlug);
  body.set("subscription_data[metadata][tier]", input.tier);
  body.set("subscription_data[metadata][seats]", String(seats));
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(plan.priceMonthly * 100));
  body.set("line_items[0][price_data][recurring][interval]", "month");
  body.set("line_items[0][price_data][product_data][name]", plan.name);
  body.set("line_items[0][quantity]", String(seats));
  if (input.customerEmail) {
    body.set("customer_email", input.customerEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    body,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));
  const payloadRecord = record(payload);
  if (!response.ok) {
    return {
      error: String(
        optionalString(record(payloadRecord?.error)?.message) ??
          `Stripe returned ${response.status}`,
      ),
      mode: "subscription",
      plan,
      provider: "stripe",
      seats,
      workspaceSlug: input.workspaceSlug,
    };
  }

  return {
    checkoutSessionId: optionalString(payloadRecord?.id),
    checkoutUrl: optionalString(payloadRecord?.url),
    mode: "subscription",
    plan,
    provider: "stripe",
    seats,
    workspaceSlug: input.workspaceSlug,
  };
}

export async function verifyStripeSignature(request: Request, rawBody: string) {
  return await verifyStripeWebhookSignature(
    rawBody,
    request.headers.get("stripe-signature"),
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}

export async function handleStripeWebhook(
  ctx: ActionCtx,
  routeWorkspaceSlug: string,
  event: Record<string, unknown>,
) {
  const eventType = optionalString(event.type);
  if (eventType !== "checkout.session.completed") {
    return {
      ignored: true,
      received: true,
      type: eventType ?? "unknown",
    };
  }

  const session = record(record(event.data)?.object);
  const metadata = record(session?.metadata);
  const workspaceSlug = optionalString(metadata?.workspaceSlug) ?? routeWorkspaceSlug;
  const tier = stripeCheckoutPlanFromValue(metadata?.tier);
  if (!tier) {
    return {
      error: "Stripe checkout session is missing a paid Amend tier",
      received: true,
      type: eventType,
    };
  }

  const seats = numberValue(Number(metadata?.seats)) ?? 1;
  const plan = await ctx.runMutation(api.amend.updatePlan, {
    seats,
    tier: tier.tier,
    workspaceSlug,
  });

  return {
    checkoutSessionId: optionalString(session?.id),
    plan,
    received: true,
    type: eventType,
    workspaceSlug,
  };
}

function stripeCheckoutPlanFromValue(value: unknown) {
  return value === "starter" || value === "pro" || value === "team" || value === "scale"
    ? stripeCheckoutPlans[value]
    : undefined;
}
