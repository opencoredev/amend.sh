# Source Event Imports

Use generic source-event imports when the evidence came from Slack, Discord, email, support, a data
warehouse, or a custom agent rather than a signed GitHub webhook. Imports use `externalId` as the
idempotency key, so replaying the same source updates the stored evidence instead of duplicating it.

```ts
await amend.importSourceEvent({
  provider: "slack",
  kind: "customer_signal",
  externalId: "slack:feedback:123",
  title: "Request from #feedback",
  url: "https://slack.com/app_redirect?channel=C123",
  labels: ["feedback", "enterprise"],
  projectSlug: "web-app",
});
```

The same import is available from the CLI:

```bash
bun packages/cli/src/index.ts source list --provider slack --kind customer_signal

bun packages/cli/src/index.ts source import \
  --provider slack \
  --kind customer_signal \
  --external-id slack:feedback:123 \
  --title "Request from #feedback" \
  --url "https://slack.com/app_redirect?channel=C123"

bun packages/cli/src/index.ts source import --file source-events.json

bun packages/cli/src/index.ts source import --file source-events.csv
```

CSV imports use the first row as headers. Supported columns include `provider`, `kind`,
`external_id`, `title`, `url`, `labels`, `state`, `number`, `author`, `owner`, `repo`,
`project_slug`, `observed_at`, `source_created_at`, and `source_updated_at`. `labels` can be
comma-, semicolon-, or pipe-separated, so teams can start from exports without writing a custom
adapter.

## Agent Skill

Coding agents can use `docs/agents/amend/SKILL.md` to fetch demand, inspect evidence, and draft
post-ship update context safely. The skill defaults to read-only commands and requires explicit
authorization before publishing public/customer-facing changes or sending notifications.
