import { AmendWorkspaceClient } from "./workspace-client";
import type {
  AmendAgentRun,
  AmendAutomationRulesInput,
  AmendAutomationDecision,
  AmendBuildBrief,
  AmendBuildBriefStatus,
  AmendDelivery,
  AmendSourceEvent,
  AmendSourceEventImportResult,
  AmendSourceEventInput,
  AmendSourceKind,
  AmendSourceProvider,
} from "./types";

export class AmendAgentClient extends AmendWorkspaceClient {
  async automationDecisions(): Promise<AmendAutomationDecision[]> {
    const response = await this.request<{ decisions: AmendAutomationDecision[] }>("decisions");
    return response.decisions;
  }

  async agentRecommendations() {
    return await this.automationDecisions();
  }

  async agentRuns(search?: { projectSlug?: string }): Promise<AmendAgentRun[]> {
    const response = await this.request<{ runs: AmendAgentRun[] }>("agent-runs", {
      search,
    });
    return response.runs;
  }

  async buildBriefs(search?: {
    projectSlug?: string;
    status?: AmendBuildBriefStatus;
  }): Promise<AmendBuildBrief[]> {
    const response = await this.request<{ buildBriefs: AmendBuildBrief[] }>("build-briefs", {
      search,
    });
    return response.buildBriefs;
  }

  async agentBuildBriefs(search?: { projectSlug?: string; status?: AmendBuildBriefStatus }) {
    return await this.buildBriefs(search);
  }

  async importSourceEvent(input: AmendSourceEventInput): Promise<AmendSourceEventImportResult> {
    return await this.request<AmendSourceEventImportResult>("source-events", {
      method: "POST",
      body: input,
    });
  }

  async importSourceEvents(items: AmendSourceEventInput[]) {
    return await Promise.all(items.map(async (item) => await this.importSourceEvent(item)));
  }

  async sourceEvents(search?: {
    projectSlug?: string;
    provider?: AmendSourceProvider;
    kind?: AmendSourceKind;
    limit?: number;
  }): Promise<AmendSourceEvent[]> {
    const response = await this.request<{ sourceEvents: AmendSourceEvent[] }>("source-events", {
      search: {
        projectSlug: search?.projectSlug,
        provider: search?.provider,
        kind: search?.kind,
        limit: search?.limit === undefined ? undefined : String(search.limit),
      },
    });
    return response.sourceEvents;
  }

  async deliveryOutbox(): Promise<AmendDelivery[]> {
    const response = await this.request<{ deliveries: AmendDelivery[] }>("deliveries");
    return response.deliveries;
  }

  async updateAutomationRules(input: AmendAutomationRulesInput) {
    return await this.request("rules", {
      method: "POST",
      body: input,
    });
  }
}
