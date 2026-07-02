import type { Doc } from "../_generated/dataModel";

export function normalizeNotificationPreference(preference: Doc<"notificationPreferences">) {
  return {
    recordId: preference._id,
    accountId: preference.accountId,
    digestDay: preference.digestDay,
    digestHour: preference.digestHour,
    email: preference.email,
    externalUserId: preference.externalUserId,
    mode: preference.mode,
    unsubscribed: preference.unsubscribed,
    updatedAt: preference.updatedAt,
  };
}

type DeliveryRecipient = {
  deliveryMode: "digest" | "instant" | "internal";
  recipient: string;
  skipped?: boolean;
  skipReason?: string;
};

export function deliveryRecipients(
  notification: Doc<"notifications">,
  channel: "email" | "in_app" | "slack" | "webhook",
  members: Array<Doc<"workspaceMembers">>,
  preferences: Array<Doc<"notificationPreferences">>,
  externalUsers: Array<Doc<"externalUsers">>,
): DeliveryRecipient[] {
  const recipients = new Map<string, DeliveryRecipient>();

  const add = (
    recipient: string | undefined,
    preference?: Doc<"notificationPreferences">,
    deliveryMode: DeliveryRecipient["deliveryMode"] = "instant",
  ) => {
    if (!recipient) {
      return;
    }
    const skipped = preference?.unsubscribed || preference?.mode === "muted";
    recipients.set(recipient, {
      deliveryMode: preference?.mode === "digest" ? "digest" : deliveryMode,
      recipient,
      ...(skipped ? { skipped: true, skipReason: "recipient_muted_or_unsubscribed" } : {}),
    });
  };

  if (notification.audience === "admins" || notification.audience === "reviewers") {
    for (const member of members) {
      const canReceive =
        notification.audience === "admins"
          ? member.role === "owner" || member.role === "admin"
          : member.role === "owner" || member.role === "admin" || member.role === "reviewer";
      if (canReceive) {
        add(member.email, preferenceForEmail(preferences, member.email), "internal");
      }
    }
  }

  if (notification.audience === "subscribers" || notification.audience === "public") {
    for (const preference of preferences) {
      add(deliveryRecipientForPreference(preference, channel), preference);
    }

    if (notification.audience === "public") {
      for (const user of externalUsers) {
        add(
          channel === "in_app" ? user.externalUserId : user.email,
          preferenceForExternalUser(preferences, user.externalUserId),
        );
      }
    }
  }

  return [...recipients.values()];
}

function deliveryRecipientForPreference(
  preference: Doc<"notificationPreferences">,
  channel: "email" | "in_app" | "slack" | "webhook",
) {
  if (channel === "in_app") {
    return preference.externalUserId ?? preference.email ?? preference.accountId;
  }
  return preference.email ?? preference.externalUserId ?? preference.accountId;
}

function preferenceForEmail(preferences: Array<Doc<"notificationPreferences">>, email: string) {
  return preferences.find((preference) => preference.email === email);
}

function preferenceForExternalUser(
  preferences: Array<Doc<"notificationPreferences">>,
  externalUserId: string,
) {
  return preferences.find((preference) => preference.externalUserId === externalUserId);
}

export function defaultDeliveryProvider(
  channel: "email" | "in_app" | "slack" | "webhook",
  mode: DeliveryRecipient["deliveryMode"],
) {
  if (mode === "digest") {
    return "digest";
  }
  if (channel === "email") {
    return "resend";
  }
  if (channel === "slack") {
    return "slack";
  }
  if (channel === "webhook") {
    return "webhook";
  }
  return "amend";
}
