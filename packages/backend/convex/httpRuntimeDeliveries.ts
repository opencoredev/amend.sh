import type { Id } from "./_generated/dataModel";
import { escapeHtml } from "./httpRuntimeScalars";
import { sendTransactionalEmail } from "./amendTransactionalEmails";

declare const process: {
  env: {
    EMAIL_FROM?: string;
    RESEND_API_KEY?: string;
    SITE_URL?: string;
  };
};

type DeliveryRecord = {
  channel: "email" | "in_app" | "slack" | "webhook";
  payload: Record<string, unknown>;
  recipient: string;
  recordId: Id<"deliveryOutbox">;
  status: "failed" | "queued" | "sent" | "skipped";
};

type DeliveryStatusPatch = {
  lastError?: string;
  provider?: string;
  providerMessageId?: string;
  status: "failed" | "queued" | "sent" | "skipped";
};

type DeliverySendResult = {
  error?: string;
  provider: string;
  providerMessageId?: string;
  status: "failed" | "sent" | "skipped";
};

export async function sendQueuedDeliveries(
  deliveries: DeliveryRecord[],
  updateDelivery: (
    deliveryId: Id<"deliveryOutbox">,
    patch: DeliveryStatusPatch,
  ) => Promise<unknown>,
  options: {
    channel?: "email" | "in_app" | "slack" | "webhook";
    dryRun: boolean;
    limit: number;
  },
) {
  const queued = deliveries
    .filter((delivery) => delivery.status === "queued")
    .filter((delivery) => !options.channel || delivery.channel === options.channel)
    .slice(0, Math.max(1, Math.min(options.limit, 100)));
  const results: Array<{
    channel: string;
    error?: string;
    provider?: string;
    recipient: string;
    status: string;
  }> = [];

  for (const delivery of queued) {
    const result = await sendDelivery(delivery, options.dryRun);
    await updateDelivery(delivery.recordId, {
      lastError: result.error,
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      status: result.status,
    });
    results.push({
      channel: delivery.channel,
      error: result.error,
      provider: result.provider,
      recipient: delivery.recipient,
      status: result.status,
    });
  }

  return {
    failed: results.filter((result) => result.status === "failed").length,
    processed: results.length,
    queuedRemaining: Math.max(
      0,
      deliveries.filter((delivery) => delivery.status === "queued").length - results.length,
    ),
    results,
    sent: results.filter((result) => result.status === "sent").length,
    skipped: results.filter((result) => result.status === "skipped").length,
  };
}

async function sendDelivery(
  delivery: DeliveryRecord,
  dryRun: boolean,
): Promise<DeliverySendResult> {
  if (delivery.channel === "in_app") {
    return {
      provider: dryRun ? "dry-run" : "amend",
      providerMessageId: `in-app:${delivery.recordId}`,
      status: "sent" as const,
    };
  }

  if (delivery.channel === "email") {
    return await sendEmailDelivery(delivery, dryRun);
  }

  if (delivery.channel === "webhook") {
    return {
      error: "Webhook delivery endpoint is not configured for this workspace",
      provider: dryRun ? "dry-run" : "webhook",
      status: dryRun ? ("skipped" as const) : ("failed" as const),
    };
  }

  return {
    error: "Slack delivery endpoint is not configured for this workspace",
    provider: dryRun ? "dry-run" : "slack",
    status: dryRun ? ("skipped" as const) : ("failed" as const),
  };
}

async function sendEmailDelivery(delivery: DeliveryRecord, dryRun: boolean) {
  if (dryRun || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return {
      error: dryRun ? undefined : "Missing RESEND_API_KEY or EMAIL_FROM",
      provider: "dry-run",
      providerMessageId: `dry-run:${delivery.recordId}`,
      status: dryRun ? ("sent" as const) : ("failed" as const),
    };
  }

  try {
    const providerMessageId = await sendTransactionalEmail({
      html: emailHtml(delivery),
      purpose: "notification_delivery",
      subject: String(delivery.payload.title ?? "Amend update"),
      text: emailText(delivery),
      to: delivery.recipient,
    });
    return {
      provider: "resend",
      providerMessageId,
      status: "sent" as const,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Resend delivery failed",
      provider: "resend",
      status: "failed" as const,
    };
  }
}

function emailText(delivery: DeliveryRecord) {
  const title = String(delivery.payload.title ?? "Amend update");
  const body = String(delivery.payload.body ?? "");
  const sourceCount = Array.isArray(delivery.payload.sourceLinks)
    ? delivery.payload.sourceLinks.length
    : 0;
  return `${title}\n\n${body}\n\nSource links: ${sourceCount}\n${process.env.SITE_URL ?? "https://amend.sh"}`;
}

function emailHtml(delivery: DeliveryRecord) {
  const title = escapeHtml(String(delivery.payload.title ?? "Amend update"));
  const body = escapeHtml(String(delivery.payload.body ?? ""));
  const url = escapeHtml(process.env.SITE_URL ?? "https://amend.sh");
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1f1f29"><h1>${title}</h1><p>${body}</p><p><a href="${url}">View source-linked update</a></p></div>`;
}
