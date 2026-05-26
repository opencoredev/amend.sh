import { optionalString, record } from "./httpRuntimeScalars";
import {
  numberValue,
  requiredString,
  stringArray,
  timestampValue,
} from "./httpRuntimeInputScalars";
import {
  sourceKind,
  sourceProvider,
  sourceState,
  type SourceProvider,
} from "./httpRuntimeSourceEventTypes";

declare const process: {
  env: {
    SITE_URL?: string;
  };
};

export { githubSourceEvent } from "./httpRuntimeGithubSourceEvents";
export {
  optionalSourceKind,
  optionalSourceProvider,
  type SourceKind,
  type SourceProvider,
  type SourceState,
} from "./httpRuntimeSourceEventTypes";

export function sourceEventFromBody(body: Record<string, unknown>) {
  const input = record(body.sourceEvent) ?? record(body.event) ?? body;
  const provider = sourceProvider(input.provider ?? input.source);
  const kind = sourceKind(input.kind);
  const externalId = requiredString(input.externalId ?? input.id, "externalId");
  const url =
    optionalString(input.url) ??
    optionalString(input.sourceUrl) ??
    fallbackSourceEventUrl(provider, externalId);

  return {
    author: optionalString(input.author),
    externalId,
    kind,
    labels: stringArray(input.labels),
    milestone: optionalString(input.milestone),
    number: numberValue(input.number),
    observedAt: timestampValue(input.observedAt),
    owner: optionalString(input.owner),
    projectSlug:
      optionalString(input.projectSlug) ??
      optionalString(input.projectKey) ??
      optionalString(input.project),
    provider,
    repo: optionalString(input.repo),
    sourceCreatedAt: timestampValue(input.sourceCreatedAt ?? input.createdAt),
    sourceUpdatedAt: timestampValue(input.sourceUpdatedAt ?? input.updatedAt),
    state: sourceState(input.state),
    title: requiredString(input.title, "title"),
    url,
  };
}

function fallbackSourceEventUrl(provider: SourceProvider, externalId: string) {
  const siteUrl = process.env.SITE_URL ?? "https://amend.sh";
  return `${siteUrl.replace(/\/+$/, "")}/source-events/${encodeURIComponent(
    provider,
  )}/${encodeURIComponent(externalId)}`;
}
