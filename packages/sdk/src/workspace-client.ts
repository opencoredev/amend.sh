import { AmendFeedbackClient } from "./feedback-client";
import type {
  AmendCheckoutInput,
  AmendChangelogDraftInput,
  AmendChangelogEntryInput,
  AmendDeliveryPlanInput,
  AmendDeliverySendInput,
  AmendGitHubWebhookInput,
  AmendIntegrationInput,
  AmendNotificationPreferenceInput,
  AmendPlanTier,
  AmendPortalSettingsInput,
  AmendProject,
  AmendProjectInput,
  AmendRepositoryInput,
  AmendRoadmapItemInput,
  AmendSubscribeInput,
  AmendWorkspaceMemberInput,
} from "./types";

export class AmendWorkspaceClient extends AmendFeedbackClient {
  async projects(): Promise<AmendProject[]> {
    const response = await this.request<{ projects: AmendProject[] }>("projects");
    return response.projects;
  }

  async githubApp() {
    return await this.request("github-app");
  }

  async createProject(input: AmendProjectInput) {
    return await this.request("projects", {
      method: "POST",
      body: input,
    });
  }

  async connectRepository(input: AmendRepositoryInput) {
    return await this.request("repositories", {
      method: "POST",
      body: input,
    });
  }

  async draftChangelog(input: AmendChangelogDraftInput) {
    return await this.request("drafts", {
      method: "POST",
      body: input,
    });
  }

  async upsertChangelog(input: AmendChangelogEntryInput) {
    return await this.request("changelog", {
      method: "POST",
      body: input,
    });
  }

  async upsertRoadmapItem(input: AmendRoadmapItemInput) {
    return await this.request("roadmap", {
      method: "POST",
      body: input,
    });
  }

  async plans() {
    return await this.request("plans");
  }

  async updatePlan(tier: AmendPlanTier, seats?: number) {
    return await this.request("plans", {
      method: "POST",
      body: { seats, tier },
    });
  }

  async createCheckoutSession(input: AmendCheckoutInput) {
    return await this.request("checkout", {
      method: "POST",
      body: input,
    });
  }

  async upsertWorkspaceMember(input: AmendWorkspaceMemberInput) {
    return await this.request("members", {
      method: "POST",
      body: input,
    });
  }

  async upsertIntegration(input: AmendIntegrationInput) {
    return await this.request("integrations", {
      method: "POST",
      body: input,
    });
  }

  async updatePortalSettings(input: AmendPortalSettingsInput) {
    return await this.request("portal-settings", {
      method: "POST",
      body: input,
    });
  }

  async setNotificationPreference(input: AmendNotificationPreferenceInput) {
    return await this.request("preferences", {
      method: "POST",
      body: input,
    });
  }

  async subscribe(input: AmendSubscribeInput) {
    return await this.setNotificationPreference({
      ...input,
      mode: input.mode ?? "instant",
      unsubscribed: false,
    });
  }

  async unsubscribe(input: { email?: string; userId?: string }) {
    return await this.setNotificationPreference({
      email: input.email,
      externalUserId: input.userId,
      mode: "muted",
      unsubscribed: true,
    });
  }

  async planDeliveries(input: AmendDeliveryPlanInput = {}) {
    return await this.request("deliveries", {
      method: "POST",
      body: input,
    });
  }

  async sendDeliveries(input: AmendDeliverySendInput = {}) {
    return await this.request("deliveries", {
      method: "POST",
      body: { ...input, action: "send" },
    });
  }

  async registerCustomDomain(domain: string, purpose: "api" | "embed" | "portal" = "portal") {
    return await this.request("domains", {
      method: "POST",
      body: { domain, purpose },
    });
  }

  async verifyCustomDomain(domain: string) {
    return await this.request("domains", {
      method: "POST",
      body: { action: "verify", domain },
    });
  }

  async ingestGitHubWebhook(input: AmendGitHubWebhookInput) {
    return await this.request("github", {
      body: input.payload,
      headers: {
        "X-GitHub-Delivery": input.delivery,
        "X-GitHub-Event": input.event,
        "X-Hub-Signature-256": input.signature256,
      },
      method: "POST",
    });
  }

  async resolveCustomDomain(domain: string, purpose?: "api" | "embed" | "portal") {
    return await this.requestGlobal("_/domains", {
      search: {
        domain,
        purpose,
      },
    });
  }

  async version() {
    return await this.requestGlobal("version");
  }
}
