import type { AgentDecisionCandidate } from "./amendAgent";

export type ScopedProjectArgs = {
  projectSlug?: string;
  workspaceSlug?: string;
};

export type PersistProactiveAgentRunArgs = ScopedProjectArgs & {
  decisions: AgentDecisionCandidate[];
  provider: string;
  providerConfigured: boolean;
  error?: string;
};
