import { runReadinessAgentCompletionDocChecks } from "./readiness-agent-completion-doc-checks";
import { runReadinessAgentDomainDocChecks } from "./readiness-agent-domain-doc-checks";
import { runReadinessAgentJsonDocChecks } from "./readiness-agent-json-doc-checks";
import { runReadinessAgentLaunchDocChecks } from "./readiness-agent-launch-doc-checks";

export function runReadinessAgentDocChecks() {
  runReadinessAgentCompletionDocChecks();
  runReadinessAgentDomainDocChecks();
  runReadinessAgentLaunchDocChecks();
  runReadinessAgentJsonDocChecks();
}
