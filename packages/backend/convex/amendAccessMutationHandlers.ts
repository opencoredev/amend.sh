import type { MutationCtx } from "./_generated/server";

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
    status: "waitlisted" as const,
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
  });
  return { status: "created" as const };
}

function cleanOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
