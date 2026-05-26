import type { AmendSourceEventInput } from "@amend/sdk";

const sourceProviderValues = new Set<NonNullable<AmendSourceEventInput["provider"]>>([
  "api",
  "cli",
  "discord",
  "email",
  "embed",
  "github",
  "import",
  "linear",
  "manual",
  "portal",
  "sdk",
  "slack",
  "support",
  "x",
]);

const sourceKindValues = new Set<AmendSourceEventInput["kind"]>([
  "pull_request",
  "issue",
  "release",
  "label",
  "milestone",
  "discussion",
  "customer_signal",
  "import_record",
  "portal_feedback",
  "support_ticket",
  "usage_event",
]);

const sourceStateValues = new Set<NonNullable<AmendSourceEventInput["state"]>>([
  "closed",
  "draft",
  "merged",
  "open",
  "published",
]);

export function sourceProviderFlag(value: string | undefined) {
  return sourceProviderValues.has(value as NonNullable<AmendSourceEventInput["provider"]>)
    ? (value as NonNullable<AmendSourceEventInput["provider"]>)
    : undefined;
}

export function sourceKindFlag(value: string | undefined) {
  return sourceKindValues.has(value as AmendSourceEventInput["kind"])
    ? (value as AmendSourceEventInput["kind"])
    : undefined;
}

export function sourceStateFlag(value: string | undefined) {
  return sourceStateValues.has(value as NonNullable<AmendSourceEventInput["state"]>)
    ? (value as NonNullable<AmendSourceEventInput["state"]>)
    : undefined;
}
