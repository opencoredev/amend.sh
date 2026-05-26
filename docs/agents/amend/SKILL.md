---
name: Amend Demand Loop
description: This skill should be used when the user asks an AI coding agent to "check Amend demand", "fetch customer requests", "build from Amend feedback", "draft an Amend changelog", "run Amend agent", "close the loop in Amend", or work with Amend.sh customer-demand and product-update workflows.
version: 0.1.0
---

# Amend Demand Loop

Use Amend as the source-linked customer-demand layer before and after code work. Amend connects
customer signals, GitHub evidence, roadmap records, changelog entries, review decisions, and
notification targets.

## Default Safety

- Start read-only.
- Never publish changelog entries, notify customers, update public roadmap status, or trigger live
  provider actions unless the user explicitly authorizes that action for the current workspace.
- Prefer demo or dry-run commands when credentials are missing.
- Keep API tokens in environment variables. Do not paste tokens into prompts, logs, changelog copy,
  screenshots, or public issues.
- Treat public/official/upstream repositories as read-only unless the user explicitly authorizes a
  public write action.

## Required Configuration

Read configuration from the environment:

```bash
export AMEND_API_BASE_URL="http://127.0.0.1:3211/api/v1"
export AMEND_PROJECT="amend-labs"
export AMEND_API_TOKEN="optional-owner-token"
```

When no live services are configured, use deterministic demo mode:

```bash
bun packages/cli/src/index.ts config show
bun packages/cli/src/index.ts permissions inspect
bun packages/cli/src/index.ts status --demo
```

## Before Coding

Inspect customer demand and source evidence:

```bash
bun packages/cli/src/index.ts config show
bun packages/cli/src/index.ts permissions inspect
bun packages/cli/src/index.ts status --demo
bun packages/cli/src/index.ts feedback list --demo --limit 10
bun packages/cli/src/index.ts requests search --demo --query "github"
bun packages/cli/src/index.ts roadmap list --demo
bun packages/cli/src/index.ts agent run --demo
bun packages/cli/src/index.ts agent runs --demo
bun packages/cli/src/index.ts briefs list --demo --status in_review
bun packages/cli/src/index.ts source list --demo --provider slack
bun packages/cli/src/index.ts source import --demo --provider slack --kind customer_signal --external-id slack:feedback:123 --title "Request from #feedback"
```

For a live workspace, omit `--demo` and ensure `AMEND_API_BASE_URL`, `AMEND_PROJECT`, and
`AMEND_API_TOKEN` are set when owner-level recommendation data is required. Run
`permissions inspect` before any non-read workflow; write scopes must be explicit and should be
matched to the user's current authorization.

## What To Extract

Return concise context for coding prompts:

- top requested feature or bug
- customer problem and affected accounts/users if available
- linked GitHub issues, PRs, releases, labels, or milestones
- roadmap status and changelog status
- proactive-agent recommendation and confidence
- review requirements or permission limits
- suggested files or build brief details when available

## During Coding

- Preserve source links in commits, PR notes, changelog drafts, and review summaries.
- Keep customer-facing language tied to evidence, not speculation.
- Do not create notification copy for users who did not ask, vote, comment, react, subscribe, or use
  the shipped feature.
- Keep risky or ambiguous automation in review.

## After Coding

Draft update material in dry-run mode:

```bash
bun packages/cli/src/index.ts changelog draft --demo --title "Source-linked update"
```

For live workspaces, use the SDK or CLI with scoped credentials:

```ts
import { Amend } from "@amend/sdk";

const amend = new Amend({
  apiBaseUrl: process.env.AMEND_API_BASE_URL,
  project: process.env.AMEND_PROJECT ?? "amend-labs",
  token: process.env.AMEND_API_TOKEN,
});

const recommendations = await amend.agentRecommendations();
const runs = await amend.agentRuns();
const buildBriefs = await amend.buildBriefs({ status: "approved" });
const sourceEvents = await amend.sourceEvents({ provider: "slack" });
await amend.importSourceEvent({
  provider: "slack",
  kind: "customer_signal",
  externalId: "slack:feedback:123",
  title: "Request from #feedback",
});
const outbox = await amend.deliveryOutbox();
```

## Permission Boundary

Read-only actions are safe by default:

- `status`
- `config show`
- `permissions inspect`
- `feedback list`
- `requests search`
- `roadmap list`
- `briefs list`
- `agent run` when it only reads recommendations
- `agent runs`
- `openapi export`
- `doctor`

Write or public/customer-facing actions need explicit user authorization:

- publishing changelog entries
- changing roadmap/request status
- sending email, Slack, Discord, webhook, or in-app notifications
- connecting live providers
- importing source events from live customer/provider data
- triggering GitHub or Stripe webhooks outside local fixtures

## Handoff Format

When returning Amend context to another agent, use:

```text
Demand:
Evidence:
Roadmap/Changelog:
Recommended Work:
Permissions:
Next Amend Command:
```
