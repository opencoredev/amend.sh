import { dateValue, numberValue, requiredString } from "./httpRuntimeInputScalars";
import { optionalString, record } from "./httpRuntimeScalars";

export function githubSourceEvent(request: Request, payload: Record<string, unknown>) {
  const event = request.headers.get("x-github-event") ?? optionalString(payload.event) ?? "unknown";
  const repository = record(payload.repository);
  const owner =
    optionalString(record(repository?.owner)?.login) ?? optionalString(repository?.owner);
  const repo = optionalString(repository?.name);
  const sender = optionalString(record(payload.sender)?.login);
  const receivedAt = Date.now();

  if (event === "pull_request") {
    const pullRequest = record(payload.pull_request) ?? {};
    const number = numberValue(pullRequest.number ?? payload.number);
    return {
      author: optionalString(record(pullRequest.user)?.login) ?? sender,
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:pull_request:${
        number ?? optionalString(pullRequest.node_id) ?? receivedAt
      }`,
      kind: "pull_request" as const,
      labels: labels(pullRequest.labels),
      number,
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: dateValue(pullRequest.created_at) ?? receivedAt,
      sourceUpdatedAt: dateValue(pullRequest.updated_at) ?? receivedAt,
      state: pullRequest.merged
        ? ("merged" as const)
        : pullRequest.state === "closed"
          ? ("closed" as const)
          : ("open" as const),
      title: requiredString(pullRequest.title, "pull_request.title"),
      url:
        optionalString(pullRequest.html_url) ??
        optionalString(pullRequest.url) ??
        repositoryUrl(owner, repo),
    };
  }

  if (event === "issues") {
    const issue = record(payload.issue) ?? {};
    const number = numberValue(issue.number ?? payload.number);
    return {
      author: optionalString(record(issue.user)?.login) ?? sender,
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:issue:${
        number ?? optionalString(issue.node_id) ?? receivedAt
      }`,
      kind: "issue" as const,
      labels: labels(issue.labels),
      number,
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: dateValue(issue.created_at) ?? receivedAt,
      sourceUpdatedAt: dateValue(issue.updated_at) ?? receivedAt,
      state: issue.state === "closed" ? ("closed" as const) : ("open" as const),
      title: requiredString(issue.title, "issue.title"),
      url:
        optionalString(issue.html_url) ?? optionalString(issue.url) ?? repositoryUrl(owner, repo),
    };
  }

  if (event === "release") {
    const release = record(payload.release) ?? {};
    const tagName =
      optionalString(release.tag_name) ?? optionalString(release.name) ?? String(receivedAt);
    return {
      author: optionalString(record(release.author)?.login) ?? sender,
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:release:${tagName}`,
      kind: "release" as const,
      labels: ["release"],
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: dateValue(release.created_at) ?? receivedAt,
      sourceUpdatedAt: dateValue(release.published_at) ?? receivedAt,
      state: release.draft ? ("draft" as const) : ("published" as const),
      title: optionalString(release.name) ?? tagName,
      url: optionalString(release.html_url) ?? repositoryUrl(owner, repo),
    };
  }

  if (event === "label") {
    const label = record(payload.label) ?? {};
    const name = requiredString(label.name, "label.name");
    return {
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:label:${name}`,
      kind: "label" as const,
      labels: [name],
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: receivedAt,
      sourceUpdatedAt: receivedAt,
      title: name,
      url: repositoryUrl(owner, repo),
    };
  }

  if (event === "milestone") {
    const milestone = record(payload.milestone) ?? {};
    const number = numberValue(milestone.number);
    return {
      externalId: `github:${owner ?? "unknown"}/${repo ?? "unknown"}:milestone:${
        number ?? optionalString(milestone.title) ?? receivedAt
      }`,
      kind: "milestone" as const,
      labels: ["milestone"],
      milestone: optionalString(milestone.title),
      number,
      observedAt: receivedAt,
      owner,
      provider: "github" as const,
      repo,
      sourceCreatedAt: dateValue(milestone.created_at) ?? receivedAt,
      sourceUpdatedAt: dateValue(milestone.updated_at) ?? receivedAt,
      state: milestone.state === "closed" ? ("closed" as const) : ("open" as const),
      title: requiredString(milestone.title, "milestone.title"),
      url: optionalString(milestone.html_url) ?? repositoryUrl(owner, repo),
    };
  }

  throw new Error(`Unsupported GitHub event '${event}'`);
}

function labels(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item : optionalString(record(item)?.name)))
    .filter((item): item is string => Boolean(item));
}

function repositoryUrl(owner: string | undefined, repo: string | undefined) {
  return owner && repo ? `https://github.com/${owner}/${repo}` : "https://github.com";
}
