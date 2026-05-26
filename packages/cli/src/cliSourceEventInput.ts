import type { AmendSourceEventInput } from "@amend/sdk";

import type { SourceEventFlags } from "./cliSourceEventTypes";
import { sourceKindFlag, sourceProviderFlag, sourceStateFlag } from "./cliSourceEventValues";

export function sourceEventInput(flags: SourceEventFlags): AmendSourceEventInput {
  const positionalTitle = flags.args.slice(2).join(" ").trim();
  const title = flags.title ?? (positionalTitle || "Imported source event");
  const provider = sourceProviderFlag(flags.provider) ?? "cli";
  const kind = sourceKindFlag(flags.kind) ?? "customer_signal";
  return {
    author: flags.author,
    externalId: flags.externalId ?? sourceExternalId(provider, kind, title),
    kind,
    labels: flags.labels,
    number: numberFlag(flags.number),
    owner: flags.owner,
    projectSlug: flags.projectSlug,
    provider,
    repo: flags.repo,
    state: sourceStateFlag(flags.state),
    title,
    url: flags.url,
  };
}

export function normalizeSourceEventInput(value: unknown): AmendSourceEventInput {
  const input = asRecord(value);
  const title =
    stringValue(aliasValue(input, "title", "name", "summary")) ?? "Imported source event";
  const provider =
    sourceProviderFlag(stringValue(aliasValue(input, "provider", "source", "channel"))) ?? "import";
  const kind = sourceKindFlag(stringValue(aliasValue(input, "kind", "type"))) ?? "import_record";
  return {
    author: stringValue(
      aliasValue(input, "author", "email", "user", "submittedBy", "submitted_by"),
    ),
    externalId:
      stringValue(aliasValue(input, "externalId", "external_id", "sourceId", "source_id", "id")) ??
      sourceExternalId(provider, kind, title),
    kind,
    labels: labelList(aliasValue(input, "labels", "label", "tags")),
    milestone: stringValue(aliasValue(input, "milestone")),
    number: numberFlag(
      aliasValue(input, "number", "issueNumber", "issue_number", "prNumber", "pr_number"),
    ),
    observedAt: timestampInput(aliasValue(input, "observedAt", "observed_at")),
    owner: stringValue(aliasValue(input, "owner", "org", "organization")),
    projectSlug: stringValue(
      aliasValue(input, "projectSlug", "project_slug", "projectKey", "project_key", "project"),
    ),
    provider,
    repo: stringValue(aliasValue(input, "repo", "repository")),
    sourceCreatedAt: timestampInput(
      aliasValue(input, "sourceCreatedAt", "source_created_at", "createdAt", "created_at"),
    ),
    sourceUpdatedAt: timestampInput(
      aliasValue(input, "sourceUpdatedAt", "source_updated_at", "updatedAt", "updated_at"),
    ),
    state: sourceStateFlag(stringValue(aliasValue(input, "state", "status"))),
    title,
    url: stringValue(aliasValue(input, "url", "sourceUrl", "source_url", "link")),
  };
}

function sourceExternalId(
  provider: NonNullable<AmendSourceEventInput["provider"]>,
  kind: AmendSourceEventInput["kind"],
  title: string,
) {
  return `${provider}:${kind}:${slugPart(title) || "source-event"}`;
}

function slugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function numberFlag(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function timestampInput(value: unknown) {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }
  return undefined;
}

function aliasValue(input: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (input[key] !== undefined) return input[key];
  }
  return undefined;
}

function labelList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value === "string") {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
