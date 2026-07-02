import { api, internal } from "../_generated/api";
import type { RestPostInput } from "./httpRestPostTypes";
import {
  automationMode,
  changelogCategory,
  changelogStatus,
  draftChangelogCopy,
  json,
  normalizedRoadmapStatus,
  numberValue,
  optionalBoolean,
  optionalString,
  requiredString,
  roadmapPriority,
  stringArray,
} from "./httpRuntime";

export async function handleAutomationRestPost(input: RestPostInput) {
  const { body, ctx, resource, workspaceSlug } = input;

  if (resource === "drafts") {
    const result = await draftChangelogCopy({
      body: optionalString(body.body),
      dryRun: optionalBoolean(body.dryRun) ?? false,
      kind: optionalString(body.kind) ?? "source",
      sourceLinks: Array.isArray(body.sourceLinks) ? body.sourceLinks : [],
      title: requiredString(body.title, "title"),
    });
    return json(result, 201);
  }

  if (resource === "rules") {
    const result = await ctx.runMutation(api.amend.updateAutomationRules, {
      workspaceSlug,
      autoDraftChangelog: optionalBoolean(body.autoDraftChangelog),
      autoNotifyUsers: optionalBoolean(body.autoNotifyUsers),
      autoPublishChangelog: optionalBoolean(body.autoPublishChangelog),
      autoUpdateFeedbackStatus: optionalBoolean(body.autoUpdateFeedbackStatus),
      autoUpdateRoadmapStatus: optionalBoolean(body.autoUpdateRoadmapStatus),
      byokConfigured: optionalBoolean(body.byokConfigured),
      byokProvider: optionalString(body.byokProvider),
      mode: automationMode(body.mode),
      requireReviewBelowConfidence: numberValue(body.requireReviewBelowConfidence),
      requireReviewForHighImpact: optionalBoolean(body.requireReviewForHighImpact),
      requireReviewForPublicCopy: optionalBoolean(body.requireReviewForPublicCopy),
    });
    return json(result);
  }

  if (resource === "changelog") {
    const result = await ctx.runMutation(internal.amend.trustedUpsertChangelogEntry, {
      workspaceSlug,
      body: requiredString(body.body, "body"),
      category: changelogCategory(body.category),
      publishedAt: numberValue(body.publishedAt),
      scheduledFor: numberValue(body.scheduledFor),
      stableKey: optionalString(body.stableKey),
      status: changelogStatus(body.status),
      summary: requiredString(body.summary, "summary"),
      tags: stringArray(body.tags),
      title: requiredString(body.title, "title"),
      version: optionalString(body.version),
    });
    return json(result, 201);
  }

  if (resource === "roadmap") {
    const result = await ctx.runMutation(internal.amend.trustedUpsertRoadmapItem, {
      workspaceSlug,
      description: requiredString(body.description, "description"),
      impact: optionalString(body.impact),
      priority: roadmapPriority(body.priority),
      stableKey: optionalString(body.stableKey),
      status: normalizedRoadmapStatus(optionalString(body.status) ?? null),
      target: optionalString(body.target),
      title: requiredString(body.title, "title"),
    });
    return json(result, 201);
  }

  return undefined;
}
