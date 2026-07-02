import type { Doc } from "../_generated/dataModel";

export function normalizeSourceEvent(source: Doc<"sourceEvents">) {
  return {
    recordId: source._id,
    provider: source.provider,
    owner: source.owner,
    repo: source.repo,
    kind: source.kind,
    externalId: source.externalId,
    number: source.number,
    title: source.title,
    url: source.url,
    state: source.state,
    labels: source.labels,
    milestone: source.milestone,
    author: source.author,
    observedAt: source.observedAt,
  };
}

export function normalizeChangelog(entry: Doc<"changelogEntries">) {
  return {
    recordId: entry._id,
    stableKey: entry.stableKey,
    title: entry.title,
    summary: entry.summary,
    body: entry.body,
    version: entry.version,
    status: entry.status,
    category: entry.category,
    tags: entry.tags,
    sourceLinks: entry.sourceLinks,
    reviewerStatus: entry.reviewerStatus,
    authorName: entry.authorName,
    scheduledFor: entry.scheduledFor,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
  };
}

export function normalizeRoadmap(item: Doc<"roadmapItems">) {
  return {
    recordId: item._id,
    stableKey: item.stableKey,
    title: item.title,
    description: item.description,
    status: item.status,
    priority: item.priority,
    target: item.target,
    impact: item.impact,
    sourceLinks: item.sourceLinks,
    feedbackCount: item.votes ?? Math.max(item.feedbackItemIds.length, 1),
    changelogCount: item.changelogEntryIds.length,
    shippedAt: item.shippedAt,
    updatedAt: item.updatedAt,
  };
}

export function normalizeFeedback(item: Doc<"feedbackItems">) {
  return {
    recordId: item._id,
    stableKey: item.stableKey,
    title: item.title,
    body: item.body,
    authorName: item.authorName,
    source: item.source,
    status: item.status,
    sentiment: item.sentiment,
    votes: item.votes,
    labels: item.labels,
    sourceLinks: item.sourceLinks,
    linkedRoadmapCount: item.linkedRoadmapItemIds.length,
    linkedChangelogCount: item.linkedChangelogEntryIds.length,
    updatedAt: item.updatedAt,
  };
}

export function normalizeNotification(notification: Doc<"notifications">) {
  return {
    recordId: notification._id,
    stableKey: notification.stableKey,
    title: notification.title,
    body: notification.body,
    channel: notification.channel,
    audience: notification.audience,
    status: notification.status,
    priority: notification.priority,
    relatedKind: notification.relatedKind,
    relatedKey: notification.relatedKey,
    sourceLinks: notification.sourceLinks,
    createdAt: notification.createdAt,
    sentAt: notification.sentAt,
    readAt: notification.readAt,
  };
}

export function normalizeDelivery(delivery: Doc<"deliveryOutbox">) {
  return {
    recordId: delivery._id,
    notificationId: delivery.notificationId,
    channel: delivery.channel,
    recipient: delivery.recipient,
    status: delivery.status,
    provider: delivery.provider,
    providerMessageId: delivery.providerMessageId,
    payload: delivery.payload,
    lastError: delivery.lastError,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt,
    sentAt: delivery.sentAt,
  };
}

export function normalizeReview(review: Doc<"reviewItems">) {
  return {
    recordId: review._id,
    stableKey: review.stableKey,
    kind: review.kind,
    status: review.status,
    title: review.title,
    summary: review.summary,
    targetKey: review.targetKey,
    sourceLinks: review.sourceLinks,
    comments: review.comments,
    requestedBy: review.requestedBy,
    reviewedBy: review.reviewedBy,
    reviewedAt: review.reviewedAt,
    updatedAt: review.updatedAt,
  };
}

export function normalizeBuildBrief(brief: Doc<"buildBriefs">) {
  return {
    recordId: brief._id,
    projectId: brief.projectId,
    stableKey: brief.stableKey,
    title: brief.title,
    problem: brief.problem,
    evidenceSummary: brief.evidenceSummary,
    recommendedScope: brief.recommendedScope,
    acceptanceCriteria: brief.acceptanceCriteria,
    suggestedFiles: brief.suggestedFiles,
    sourceLinks: brief.sourceLinks,
    feedbackItemIds: brief.feedbackItemIds,
    roadmapItemIds: brief.roadmapItemIds,
    changelogEntryIds: brief.changelogEntryIds,
    sourceEventIds: brief.sourceEventIds,
    status: brief.status,
    priority: brief.priority,
    createdBy: brief.createdBy,
    createdAt: brief.createdAt,
    updatedAt: brief.updatedAt,
    exportedAt: brief.exportedAt,
  };
}
