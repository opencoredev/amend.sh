import { defaultEndpoint, defaultProject } from "./cliDemoData";

export function helpText() {
  return `amend - source-linked product update automation CLI

Usage:
  amend init [--endpoint URL] [--project slug] [--token token]
  amend config show [--json|--text]
  amend permissions inspect [--json|--text]
  amend status [--demo] [--json|--text]
  amend feedback list [--demo] [--limit 10]
  amend requests search --query "source linked" [--demo]
  amend agent run [--demo]
  amend agent runs [--demo] [--limit 10]
  amend agent briefs [--status in_review] [--demo]
  amend briefs list [--status approved] [--demo]
  amend source list [--provider slack] [--kind customer_signal] [--demo]
  amend source import --provider slack --kind customer_signal --external-id slack:123 --title "Request from #feedback" [--demo]
  amend source import --file source-events.json
  amend source import --file source-events.csv
  amend changelog draft --title "Webhook retry status" [--demo]
  amend roadmap list [--status planned] [--demo]
  amend github sync
  amend openapi export
  amend doctor
  amend version [--server] [--check]
  amend token create [--limit 32] [--plain]
  amend token generate [--limit 32] [--plain]

Config:
  --endpoint <url>      Defaults to AMEND_API_BASE_URL, .amend/config.json, or ${defaultEndpoint}
  --project <slug>      Defaults to AMEND_PROJECT/AMEND_WORKSPACE, .amend/config.json, or ${defaultProject}
  --workspace <slug>    Alias for --project
  --token <token>       Defaults to AMEND_API_TOKEN or .amend/config.json
  --read-scopes <list>  Comma-separated read scopes for permission inspection
  --write-scopes <list> Comma-separated write scopes for permission inspection
  --demo                Use deterministic local demo data without provider keys
  --kind <kind>         Source kind for source import (default customer_signal)
  --provider <name>     Source provider for source import (default cli)
  --external-id <id>    Stable source identifier for idempotent imports
  --url <url>           Link back to the source evidence
  --file <path>         Import source events from JSON or CSV
  --check               Fetch public release metadata for amend version/doctor
  --plain               Print only the generated token for token commands
  --server              Fetch deployed /api/v1/version metadata for amend version

The CLI is read-only by default. Mutating hosted/provider workflows should be explicitly configured
through scoped tokens and reviewed automation rules. amend config show and amend permissions inspect
print machine-readable state without token values. amend init writes .amend/config.json; tokens are
stored there only when --token is explicitly supplied.`;
}
