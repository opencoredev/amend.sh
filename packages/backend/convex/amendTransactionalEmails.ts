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
  subject,
  text,
  to,
}: {
  html: string;
  subject: string;
  text: string;
  to: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!resendApiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or EMAIL_FROM");
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
  if (!response.ok) {
    throw new Error(String(record(payload)?.message ?? `Resend returned ${response.status}`));
  }

  return optionalString(record(payload)?.id);
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
