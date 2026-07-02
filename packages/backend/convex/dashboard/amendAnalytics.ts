import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { analyticsEventCategory } from "./amendAnalyticsEvents";
import { posthog } from "../lib/posthog";

declare const process: {
  env: {
    POSTHOG_API_KEY?: string;
  };
};

type AnalyticsIdentity = {
  accountId?: string;
  externalUserId?: string;
  properties?: Record<string, unknown>;
  workspaceSlug: string;
};

type AnalyticsEvent = AnalyticsIdentity & {
  event: Doc<"eventRecords">["event"];
  properties?: Record<string, unknown>;
};

type RecordAnalyticsEventInput = {
  accountId?: string;
  event: Doc<"eventRecords">["event"];
  externalUserId?: string;
  metadata?: unknown;
  source?: Doc<"eventRecords">["source"];
  updateKey?: string;
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
};

const defaultPostHogProjectApiKey = "phc_BCb25jVTo59jtEMPysgGUvgt85bUYGwN8XBNA2oMNLY7";
const hasPostHogConfig = Boolean(process.env.POSTHOG_API_KEY ?? defaultPostHogProjectApiKey);

function distinctId(identity: AnalyticsIdentity) {
  return identity.externalUserId ?? identity.accountId ?? `workspace:${identity.workspaceSlug}`;
}

function groups(identity: AnalyticsIdentity) {
  return { workspace: identity.workspaceSlug };
}

export async function identifyAnalyticsUser(ctx: MutationCtx, identity: AnalyticsIdentity) {
  if (!hasPostHogConfig) {
    return;
  }

  await posthog.identify(ctx, {
    distinctId: distinctId(identity),
    properties: {
      accountId: identity.accountId,
      workspaceSlug: identity.workspaceSlug,
      ...identity.properties,
    },
  });

  if (identity.accountId) {
    await posthog.groupIdentify(ctx, {
      groupKey: identity.accountId,
      groupType: "account",
      properties: {
        workspaceSlug: identity.workspaceSlug,
        ...identity.properties,
      },
    });
  }
}

export async function captureAnalyticsEvent(ctx: MutationCtx, event: AnalyticsEvent) {
  if (!hasPostHogConfig) {
    return;
  }

  await posthog.capture(ctx, {
    distinctId: distinctId(event),
    event: `amend.${event.event}`,
    groups: groups(event),
    properties: {
      accountId: event.accountId,
      amendAnalyticsCategory: analyticsEventCategory(event.event),
      externalUserId: event.externalUserId,
      workspaceSlug: event.workspaceSlug,
      ...event.properties,
    },
  });
}

export async function recordAnalyticsEvent(ctx: MutationCtx, input: RecordAnalyticsEventInput) {
  const createdAt = Date.now();
  const recordId = await ctx.db.insert("eventRecords", {
    workspaceId: input.workspaceId,
    event: input.event,
    ...(input.accountId ? { accountId: input.accountId } : {}),
    ...(input.externalUserId ? { externalUserId: input.externalUserId } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
    source: input.source ?? "rest",
    ...(input.updateKey ? { updateKey: input.updateKey } : {}),
    createdAt,
  });

  await captureAnalyticsEvent(ctx, {
    accountId: input.accountId,
    event: input.event,
    externalUserId: input.externalUserId,
    properties: {
      metadata: input.metadata,
      recordId,
      amendAnalyticsCategory: analyticsEventCategory(input.event),
      source: input.source ?? "rest",
      updateKey: input.updateKey,
    },
    workspaceSlug: input.workspaceSlug,
  });

  return recordId;
}
