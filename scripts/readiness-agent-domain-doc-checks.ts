import { add, agentReadyDomainSetup } from "./readiness-context";

export function runReadinessAgentDomainDocChecks() {
  add(
    "agent-ready domain setup handoff exists",
    agentReadyDomainSetup.includes("Register `amend.sh`") &&
      agentReadyDomainSetup.includes("bun run agent-ready:completion-audit") &&
      agentReadyDomainSetup.includes("Delegate `amend.sh`") &&
      agentReadyDomainSetup.includes("docs.amend.sh") &&
      agentReadyDomainSetup.includes("A/AAAA or CNAME DNS records") &&
      agentReadyDomainSetup.includes("ALIAS/ANAME/flattened CNAME") &&
      agentReadyDomainSetup.includes("dig +short NS amend.sh") &&
      agentReadyDomainSetup.includes("dig +short A amend.sh") &&
      agentReadyDomainSetup.includes("dig +short CNAME amend.sh") &&
      agentReadyDomainSetup.includes("dig +short A docs.amend.sh") &&
      agentReadyDomainSetup.includes("dig +short CNAME docs.amend.sh") &&
      agentReadyDomainSetup.includes("whois -h whois.nic.sh amend.sh") &&
      agentReadyDomainSetup.includes("cloudflare-dns.com/dns-query?name=amend.sh&type=A") &&
      agentReadyDomainSetup.includes("cloudflare-dns.com/dns-query?name=docs.amend.sh&type=A") &&
      agentReadyDomainSetup.includes("Domain not found") &&
      agentReadyDomainSetup.includes("Status: 3") &&
      agentReadyDomainSetup.includes("AMEND_WEB_ORIGIN") &&
      agentReadyDomainSetup.includes("preview-only check") &&
      agentReadyDomainSetup.includes("not a substitute for the required `amend.sh`") &&
      agentReadyDomainSetup.includes("absolute URLs match") &&
      agentReadyDomainSetup.includes("agent-ready:production") &&
      agentReadyDomainSetup.includes("agent-ready:production:json") &&
      agentReadyDomainSetup.includes("agent-ready:final-gate") &&
      agentReadyDomainSetup.includes("agent-ready:live:validate-report") &&
      agentReadyDomainSetup.includes("agent-ready:status:validate-report") &&
      agentReadyDomainSetup.includes("agent-ready:production:validate-report") &&
      agentReadyDomainSetup.includes("agent-ready:sync-audit") &&
      agentReadyDomainSetup.includes("agent-ready:audit:check") &&
      agentReadyDomainSetup.includes(
        "The normal validator checks the report schema plus internal consistency",
      ) &&
      agentReadyDomainSetup.includes("step `ok` values must") &&
      agentReadyDomainSetup.includes("live `passed`/`total` counts") &&
      agentReadyDomainSetup.includes("top-level `ok` must") &&
      agentReadyDomainSetup.includes("agent-ready:built") &&
      agentReadyDomainSetup.includes("readiness:strict") &&
      agentReadyDomainSetup.includes("agent-ready:status") &&
      agentReadyDomainSetup.includes("agent-ready:status:json") &&
      agentReadyDomainSetup.includes("agent-ready:live:json") &&
      agentReadyDomainSetup.includes(
        "Treat the combined production JSON report as passing only when",
      ) &&
      agentReadyDomainSetup.includes("`ok` is `true`") &&
      agentReadyDomainSetup.includes("Every entry in `steps` has `ok: true`") &&
      agentReadyDomainSetup.includes("For the nested live report") &&
      agentReadyDomainSetup.includes("`passed` must equal `total`") &&
      agentReadyDomainSetup.includes("every entry in `checks` must have") &&
      agentReadyDomainSetup.includes("`blockers` is empty") &&
      agentReadyDomainSetup.includes("bun run agent-ready:live"),
  );
}
