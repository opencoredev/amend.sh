import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalMutation } from "./_generated/server";

declare const process: {
  env: {
    BETTER_AUTH_SECRET?: string;
    EMAIL_FROM?: string;
    RESEND_API_KEY?: string;
    SITE_URL?: string;
  };
};

const codeLength = 6;
const codeExpiresInMs = 15 * 60 * 1000;
const resendCooldownMs = 60 * 1000;

const waitlistEntryStatus = v.union(
  v.literal("pending"),
  v.literal("verified"),
  v.literal("delivery_failed"),
);

export const requestCode = action({
  args: {
    email: v.string(),
  },
  returns: v.object({
    email: v.string(),
    status: waitlistEntryStatus,
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    email: string;
    status: "delivery_failed" | "pending" | "verified";
  }> => {
    const email = normalizeEmail(args.email);
    if (!isValidEmail(email)) {
      throw new ConvexError({
        code: "INVALID_EMAIL",
        message: "Enter a valid email address.",
      });
    }

    const code = verificationCode();
    const codeHash = await hashVerificationCode(email, code);
    const prepared = await ctx.runMutation(internal.waitlist.prepareWaitlistCode, {
      codeHash,
      codeLength,
      email,
      expiresAt: Date.now() + codeExpiresInMs,
      requestedAt: Date.now(),
    });

    if (prepared.cooldownActive) {
      return {
        email,
        status: "pending" as const,
      };
    }

    const delivery = await sendWaitlistEmail(email, code);
    await ctx.runMutation(internal.waitlist.recordWaitlistDelivery, {
      email,
      error: delivery.error,
      providerMessageId: delivery.providerMessageId,
      status: delivery.status,
      updatedAt: Date.now(),
    });

    if (delivery.status === "delivery_failed") {
      throw new ConvexError({
        code: "WAITLIST_EMAIL_FAILED",
        message: "The verification email could not be sent. Try again in a minute.",
      });
    }

    return {
      email,
      status: "pending" as const,
    };
  },
});

export const verifyCode = action({
  args: {
    code: v.string(),
    email: v.string(),
  },
  returns: v.object({
    email: v.string(),
    status: waitlistEntryStatus,
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    email: string;
    status: "delivery_failed" | "pending" | "verified";
  }> => {
    const email = normalizeEmail(args.email);
    const code = normalizeCode(args.code);
    if (!isValidEmail(email) || !code) {
      throw new ConvexError({
        code: "INVALID_WAITLIST_VERIFICATION",
        message: "Enter the email and six-digit code from your invite email.",
      });
    }

    const codeHash = await hashVerificationCode(email, code);
    const result: {
      email: string;
      status: "delivery_failed" | "pending" | "verified";
    } = await ctx.runMutation(internal.waitlist.verifyWaitlistCode, {
      codeHash,
      email,
      verifiedAt: Date.now(),
    });
    return result;
  },
});

export const prepareWaitlistCode = internalMutation({
  args: {
    codeHash: v.string(),
    codeLength: v.number(),
    email: v.string(),
    expiresAt: v.number(),
    requestedAt: v.number(),
  },
  returns: v.object({
    cooldownActive: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    const cooldownActive = Boolean(
      existing?.lastSentAt && args.requestedAt - existing.lastSentAt < resendCooldownMs,
    );

    if (existing) {
      await ctx.db.patch(existing._id, {
        codeHash: cooldownActive ? existing.codeHash : args.codeHash,
        codeLength: args.codeLength,
        codeExpiresAt: cooldownActive ? existing.codeExpiresAt : args.expiresAt,
        lastError: undefined,
        requestCount: existing.requestCount + 1,
        status: existing.status === "verified" ? "verified" : "pending",
        updatedAt: args.requestedAt,
      });
      return { cooldownActive };
    }

    await ctx.db.insert("waitlistEntries", {
      codeExpiresAt: args.expiresAt,
      codeHash: args.codeHash,
      codeLength: args.codeLength,
      createdAt: args.requestedAt,
      email: args.email,
      requestCount: 1,
      status: "pending",
      updatedAt: args.requestedAt,
    });

    return { cooldownActive: false };
  },
});

export const recordWaitlistDelivery = internalMutation({
  args: {
    email: v.string(),
    error: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    status: waitlistEntryStatus,
    updatedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!entry) {
      return null;
    }

    await ctx.db.patch(entry._id, {
      lastError: args.error,
      lastSentAt: args.status === "pending" ? args.updatedAt : entry.lastSentAt,
      providerMessageId: args.providerMessageId,
      status: entry.status === "verified" ? "verified" : args.status,
      updatedAt: args.updatedAt,
    });
    return null;
  },
});

export const verifyWaitlistCode = internalMutation({
  args: {
    codeHash: v.string(),
    email: v.string(),
    verifiedAt: v.number(),
  },
  returns: v.object({
    email: v.string(),
    status: waitlistEntryStatus,
  }),
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!entry || entry.codeHash !== args.codeHash || entry.codeExpiresAt < args.verifiedAt) {
      throw new ConvexError({
        code: "INVALID_WAITLIST_CODE",
        message: "That code is invalid or expired. Request a new code and try again.",
      });
    }

    await ctx.db.patch(entry._id, {
      lastError: undefined,
      status: "verified",
      updatedAt: args.verifiedAt,
      verifiedAt: args.verifiedAt,
    });

    return {
      email: args.email,
      status: "verified" as const,
    };
  },
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCode(code: string) {
  const digits = code.replace(/\D/g, "");
  return digits.length === codeLength ? digits : "";
}

function verificationCode() {
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return String(values[0]! % 1_000_000).padStart(codeLength, "0");
}

async function hashVerificationCode(email: string, code: string) {
  const secret = process.env.BETTER_AUTH_SECRET ?? "amend-waitlist";
  const input = `${secret}:${email}:${code}`;
  const data = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sendWaitlistEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return {
      error: "Missing RESEND_API_KEY or EMAIL_FROM",
      status: "delivery_failed" as const,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: waitlistEmailHtml(code),
      subject: "Your Amend access code",
      text: waitlistEmailText(code),
      to: email,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      error: responseError(payload, response.status),
      status: "delivery_failed" as const,
    };
  }

  return {
    providerMessageId: optionalString((payload as { id?: unknown }).id),
    status: "pending" as const,
  };
}

function responseError(payload: unknown, status: number) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return `Resend returned ${status}`;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function waitlistEmailText(code: string) {
  return `Your Amend access code is ${code}.\n\nEnter this code to verify your email for the Amend waitlist. This does not create an account or grant product access yet.\n\nThis code expires in 15 minutes.`;
}

function waitlistEmailHtml(code: string) {
  const siteUrl = process.env.SITE_URL ?? "https://amend.sh";
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111111"><p>Your Amend access code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>Enter this code to verify your email for the Amend waitlist. This does not create an account or grant product access yet.</p><p>This code expires in 15 minutes.</p><p><a href="${siteUrl}">Amend.sh</a></p></div>`;
}
