import { AmendTransport } from "./client";
import type {
  AmendChangelogEntry,
  AmendEventInput,
  AmendFeedbackInput,
  AmendIdentity,
  AmendPortalResponse,
  AmendRoadmapItem,
  AmendUpdatesResponse,
  JsonValue,
} from "./types";

export class AmendFeedbackClient extends AmendTransport {
  async identify(identity: AmendIdentity) {
    return await this.request("identity", {
      method: "POST",
      body: { identity },
    });
  }

  async identifyAccount(accountId: string, traits?: Record<string, JsonValue>) {
    return await this.track({
      accountId,
      event: "account_identify",
      metadata: traits,
    });
  }

  async submitRequest(input: AmendFeedbackInput) {
    return await this.request("feedback", {
      method: "POST",
      body: input,
    });
  }

  async vote(requestKey: string, userId?: string) {
    return await this.request("interactions", {
      method: "POST",
      body: {
        feedbackKey: requestKey,
        kind: "vote",
        externalUserId: userId,
      },
    });
  }

  async comment(requestKey: string, body: string, userId?: string) {
    return await this.request("interactions", {
      method: "POST",
      body: {
        body,
        feedbackKey: requestKey,
        kind: "comment",
        externalUserId: userId,
      },
    });
  }

  async react(requestKey: string, reaction: string, userId?: string) {
    return await this.request("interactions", {
      method: "POST",
      body: {
        feedbackKey: requestKey,
        kind: "reaction",
        reaction,
        externalUserId: userId,
      },
    });
  }

  async roadmap(status?: string): Promise<AmendRoadmapItem[]> {
    const portal = await this.portal(status ? { roadmapStatus: status } : undefined);
    return portal.roadmap ?? [];
  }

  async changelog(): Promise<AmendChangelogEntry[]> {
    const portal = await this.portal();
    return portal.changelog ?? [];
  }

  async updateStatus(updateKey: string) {
    const portal = await this.portal();
    return {
      changelog: portal.changelog?.find((entry) => entry.stableKey === updateKey),
      roadmap: portal.roadmap?.find((item) => item.stableKey === updateKey),
    };
  }

  async markUpdateSeen(updateKey: string, userId?: string) {
    return await this.track({
      event: "update_seen",
      updateKey,
      userId,
    });
  }

  async trackShippedFeature(
    updateKey: string,
    userId?: string,
    metadata?: Record<string, JsonValue>,
  ) {
    return await this.track({
      event: "shipped_feature_used",
      metadata,
      updateKey,
      userId,
    });
  }

  async updatesForUser(userId: string): Promise<AmendUpdatesResponse> {
    return await this.request<AmendUpdatesResponse>("updates", {
      search: { externalUserId: userId },
    });
  }

  async updatesForContact(input: {
    email?: string;
    userId?: string;
  }): Promise<AmendUpdatesResponse> {
    return await this.request<AmendUpdatesResponse>("updates", {
      search: {
        email: input.email,
        externalUserId: input.userId,
      },
    });
  }

  async portal(search?: { roadmapStatus?: string }): Promise<AmendPortalResponse> {
    return await this.request<AmendPortalResponse>("portal", {
      search,
    });
  }

  async settings() {
    return await this.request("settings");
  }

  async importFeedback(items: AmendFeedbackInput[]) {
    return await Promise.all(items.map(async (item) => await this.submitRequest(item)));
  }

  async track(event: AmendEventInput) {
    return await this.request("events", {
      method: "POST",
      body: event,
    });
  }

  async trackEvent(event: AmendEventInput) {
    return await this.track(event);
  }
}
