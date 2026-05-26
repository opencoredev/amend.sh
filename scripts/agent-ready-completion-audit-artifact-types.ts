import type { loadCompletionAuditContext } from "./agent-ready-completion-audit-context";

export type CompletionAuditContext = Awaited<ReturnType<typeof loadCompletionAuditContext>>;

export type CompletionArtifactCheckAdder = (name: string, ok: boolean) => void;

export type CompletionAuditRootPackage = {
  scripts?: Record<string, string>;
};
