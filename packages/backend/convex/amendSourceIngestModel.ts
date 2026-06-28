import type { Doc } from "./_generated/dataModel";
import type { SourceLink } from "./amendTypes";

export type IngestSourceEventArgs = {
  workspaceSlug?: string;
  projectSlug?: string;
  provider?: Doc<"sourceEvents">["provider"];
  owner?: string;
  repo?: string;
  kind: Doc<"sourceEvents">["kind"];
  externalId: string;
  number?: number;
  title: string;
  url: string;
  state?: Doc<"sourceEvents">["state"];
  labels?: string[];
  milestone?: string;
  author?: string;
  sourceCreatedAt?: number;
  sourceUpdatedAt?: number;
  observedAt?: number;
  // True only on the HMAC-verified GitHub webhook path; gates repository-based
  // workspace routing in trustedIngestSourceEventHandler.
  verifiedRepoRouting?: boolean;
};

export function createSourceLink(
  args: IngestSourceEventArgs,
  observedAt: number,
  provider: Doc<"sourceEvents">["provider"],
): SourceLink {
  return {
    externalId: args.externalId,
    kind: args.kind,
    observedAt,
    provider,
    title: args.title,
    url: args.url,
    ...(args.number ? { number: args.number } : {}),
    ...(args.owner ? { owner: args.owner } : {}),
    ...(args.repo ? { repo: args.repo } : {}),
    ...(args.state ? { state: args.state } : {}),
  };
}

export function isShippedSourceEvent(args: IngestSourceEventArgs) {
  return args.kind === "release" || (args.kind === "pull_request" && args.state === "merged");
}

export function sourceLinkMatchesEvent(
  link: SourceLink,
  args: IngestSourceEventArgs,
  provider: Doc<"sourceEvents">["provider"],
) {
  return (
    link.externalId === args.externalId ||
    (args.number !== undefined &&
      link.number === args.number &&
      link.provider === provider &&
      link.owner === args.owner &&
      link.repo === args.repo)
  );
}
