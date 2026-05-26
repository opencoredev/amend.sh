import type { normalizeSourceEvent } from "./amendRecordNormalizers";
import type { SourceLink } from "./amendTypes";

export function sourceLinkForEvent(event: ReturnType<typeof normalizeSourceEvent>): SourceLink {
  return {
    externalId: event.externalId,
    kind: event.kind,
    observedAt: event.observedAt,
    provider: event.provider,
    title: event.title,
    url: event.url,
    ...(event.number === undefined ? {} : { number: event.number }),
    ...(event.owner ? { owner: event.owner } : {}),
    ...(event.repo ? { repo: event.repo } : {}),
    ...(event.state ? { state: event.state } : {}),
  };
}
