import { dashboardSiteUrl } from "./amendBackendUtils";
import { escapeHtml, optionalString, record } from "./httpRuntimeScalars";

declare const process: {
  env: {
    EMAIL_FROM?: string;
    RESEND_API_KEY?: string;
  };
};

export async function sendTransactionalEmail({
  html,
  purpose = "transactional",
  subject,
  text,
  to,
}: {
  html: string;
  purpose?: string;
  subject: string;
  text: string;
  to: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!resendApiKey || !from) {
    const message = "Missing RESEND_API_KEY or EMAIL_FROM";
    console.error("[transactional-email] configuration missing", {
      fromConfigured: Boolean(from),
      purpose,
      resendConfigured: Boolean(resendApiKey),
      toDomain: emailDomain(to),
    });
    throw new Error(message);
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({ from, html, subject, text, to }),
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));
  const payloadRecord = record(payload);
  if (!response.ok) {
    const message = String(payloadRecord?.message ?? `Resend returned ${response.status}`);
    console.error("[transactional-email] provider rejected email", {
      fromDomain: senderDomain(from),
      message,
      purpose,
      status: response.status,
      toDomain: emailDomain(to),
    });
    throw new Error(message);
  }

  const providerMessageId = optionalString(payloadRecord?.id);
  console.info("[transactional-email] provider accepted email", {
    fromDomain: senderDomain(from),
    providerMessageId,
    purpose,
    status: response.status,
    toDomain: emailDomain(to),
  });
  return providerMessageId;
}

export async function sendPasswordResetEmail({
  email,
  resetUrl,
}: {
  email: string;
  resetUrl: string;
}) {
  const escapedResetUrl = escapeHtml(resetUrl);
  const siteUrl = escapeHtml(dashboardSiteUrl());
  await sendTransactionalEmail({
    purpose: "password_reset",
    to: email,
    subject: "Reset your Amend password",
    text: `Use this link to reset your Amend password:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n\n${dashboardSiteUrl()}`,
    html:
      `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1f1f29">` +
      `<h1 style="font-size:20px;margin:0 0 12px">Reset your Amend password</h1>` +
      `<p>Use this link to choose a new password for your Amend account.</p>` +
      `<p><a href="${escapedResetUrl}">Reset password</a></p>` +
      `<p style="color:#5f5f6b">If you did not request this, you can ignore this email.</p>` +
      `<p><a href="${siteUrl}">Amend</a></p>` +
      `</div>`,
  });
}

function emailDomain(email: string) {
  return email.split("@")[1]?.trim().toLowerCase() || "unknown";
}

function senderDomain(from: string) {
  const bracketMatch = from.match(/<[^@\s]+@([^>\s]+)>/);
  if (bracketMatch?.[1]) {
    return bracketMatch[1].toLowerCase();
  }
  return emailDomain(from);
}
