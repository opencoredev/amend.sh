import type { MutationCtx } from "../_generated/server";

export async function joinWaitlistHandler(
  ctx: MutationCtx,
  args: {
    company?: string;
    email: string;
    name?: string;
    source?: string;
  },
) {
  const email = args.email.trim().toLowerCase();
  if (!email) {
    throw new Error("Email is required to join the waitlist.");
  }

  const now = Date.now();
  const existing = await ctx.db
    .query("waitlistEntries")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  const patch = {
    company: cleanOptional(args.company),
    lastRequestedAt: now,
    name: cleanOptional(args.name),
    source: cleanOptional(args.source) ?? "sign-up",
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, {
      ...patch,
      requestCount: existing.requestCount + 1,
    });
    return { status: "updated" as const };
  }

  await ctx.db.insert("waitlistEntries", {
    ...patch,
    createdAt: now,
    email,
    requestCount: 1,
    status: "waitlisted" as const,
  });
  return { status: "created" as const };
}

function cleanOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
