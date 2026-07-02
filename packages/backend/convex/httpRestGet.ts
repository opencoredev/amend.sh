import { api, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import {
  buildBriefStatus,
  domainPurpose,
  githubAppInstallInfo,
  json,
  normalizedRoadmapStatus,
  numberValue,
  optionalSourceKind,
  optionalSourceProvider,
  optionalString,
  requiredString,
  requiresGetApiToken,
  restRoute,
  verifyApiToken,
} from "./lib/httpRuntime";

export const restGet = httpAction(async (ctx, request) => {
  const route = restRoute(request);
  if (!route) {
    return json({ error: "Not found" }, 404);
  }

  const { resource, workspaceSlug } = route;
  const search = new URL(request.url).searchParams;

  if (requiresGetApiToken(resource)) {
    const auth = verifyApiToken(request);
    if (!auth.ok) {
      return json({ error: auth.error }, 401);
    }
  }

  if (workspaceSlug === "_" && resource === "domains") {
    const domain = requiredString(search.get("domain"), "domain");
    const purpose = optionalString(search.get("purpose"));
    const data = await ctx.runQuery(api.amend.resolveCustomDomain, {
      domain,
      ...(purpose ? { purpose: domainPurpose(purpose) } : {}),
    });
    return json(data, data.resolved ? 200 : 404);
  }

  if (resource === "portal") {
    const roadmapStatus = normalizedRoadmapStatus(search.get("roadmapStatus"));
    const data = await ctx.runQuery(api.amend.getPublicPortal, {
      workspaceSlug,
      ...(roadmapStatus ? { roadmapStatus } : {}),
    });
    return json(data);
  }

  if (resource === "roadmap") {
    const roadmapStatus = normalizedRoadmapStatus(search.get("status"));
    const data = await ctx.runQuery(api.amend.getPublicPortal, {
      workspaceSlug,
      ...(roadmapStatus ? { roadmapStatus } : {}),
    });
    await ctx.runMutation(api.amend.trackEvent, {
      workspaceSlug,
      event: "roadmap_viewed",
      source: "rest",
    });
    return json({ roadmap: data.roadmap });
  }

  if (resource === "changelog") {
    const data = await ctx.runQuery(api.amend.getPublicPortal, { workspaceSlug });
    await ctx.runMutation(api.amend.trackEvent, {
      workspaceSlug,
      event: "changelog_viewed",
      source: "rest",
    });
    return json({ changelog: data.changelog });
  }

  if (resource === "updates") {
    const externalUserId =
      optionalString(search.get("externalUserId")) ?? optionalString(search.get("userId"));
    const email = optionalString(search.get("email"));
    const [portal, userUpdates] = await Promise.all([
      ctx.runQuery(api.amend.getPublicPortal, { workspaceSlug }),
      externalUserId || email
        ? ctx.runQuery(api.amend.getUserUpdates, {
            workspaceSlug,
            ...(externalUserId ? { externalUserId } : {}),
            ...(email ? { email } : {}),
          })
        : ctx
            .runQuery(api.amend.getNotificationCenter, { workspaceSlug })
            .then((notifications) => ({
              notifications,
              seenUpdateKeys: [],
              user: null,
            })),
    ]);
    return json({
      changelog: portal.changelog,
      notifications: userUpdates.notifications,
      roadmap: portal.roadmap,
      seenUpdateKeys: userUpdates.seenUpdateKeys,
      user: userUpdates.user,
    });
  }

  if (resource === "decisions") {
    const decisions = await ctx.runQuery(internal.amend.getAutomationDecisionsForApi, {
      workspaceSlug,
    });
    return json({ decisions });
  }

  if (resource === "source-events") {
    const sourceEvents = await ctx.runQuery(internal.amend.getSourceEventsForApi, {
      workspaceSlug,
      projectSlug:
        optionalString(search.get("projectSlug")) ?? optionalString(search.get("project")),
      provider: optionalSourceProvider(search.get("provider")),
      kind: optionalSourceKind(search.get("kind")),
      limit: numberValue(search.get("limit")),
    });
    return json({ sourceEvents });
  }

  if (resource === "agent-runs") {
    const runs = await ctx.runQuery(internal.amend.getAgentRunsForApi, {
      workspaceSlug,
      projectSlug:
        optionalString(search.get("projectSlug")) ?? optionalString(search.get("project")),
    });
    return json({ runs });
  }

  if (resource === "build-briefs") {
    const buildBriefs = await ctx.runQuery(internal.amend.getBuildBriefsForApi, {
      workspaceSlug,
      projectSlug:
        optionalString(search.get("projectSlug")) ?? optionalString(search.get("project")),
      status: buildBriefStatus(search.get("status")),
    });
    return json({ buildBriefs });
  }

  if (resource === "deliveries") {
    const deliveries = await ctx.runQuery(internal.amend.getDeliveryOutboxForApi, {
      workspaceSlug,
    });
    return json({ deliveries });
  }

  if (resource === "settings") {
    const data = await ctx.runQuery(internal.amend.getWorkspaceSettingsForApi, { workspaceSlug });
    return json(data);
  }

  if (resource === "projects") {
    const projects = await ctx.runQuery(internal.amend.getProjectsForApi, { workspaceSlug });
    return json({ projects });
  }

  if (resource === "plans") {
    const plans = await ctx.runQuery(api.amend.getPlanCatalog, { workspaceSlug });
    return json(plans);
  }

  if (resource === "github-app") {
    return json(githubAppInstallInfo(workspaceSlug));
  }

  return json({ error: `Unknown resource '${resource}'` }, 404);
});
