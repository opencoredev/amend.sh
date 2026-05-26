import { api, internal } from "./_generated/api";
import type { RestPostInput } from "./httpRestPostTypes";
import {
  createStripeCheckoutSession,
  deliveryChannel,
  domainPurpose,
  integrationDirection,
  integrationProvider,
  integrationState,
  json,
  memberRole,
  notificationMode,
  numberValue,
  optionalBoolean,
  optionalString,
  planTier,
  portalFeedbackMode,
  portalVisibility,
  projectVisibility,
  requiredString,
  sendQueuedDeliveries,
  stringArray,
  stripeCheckoutPlan,
  verifyDomainTxt,
} from "./httpRuntime";

export async function handleWorkspaceRestPost(input: RestPostInput) {
  const { body, ctx, resource, workspaceSlug } = input;

  if (resource === "members") {
    const result = await ctx.runMutation(api.amend.upsertWorkspaceMember, {
      workspaceSlug,
      email: requiredString(body.email, "email"),
      externalUserId: optionalString(body.externalUserId) ?? optionalString(body.userId),
      name: optionalString(body.name),
      permissions: stringArray(body.permissions),
      role: memberRole(body.role),
    });
    return json(result);
  }

  if (resource === "integrations") {
    const result = await ctx.runMutation(api.amend.upsertIntegrationConnection, {
      workspaceSlug,
      config: body.config,
      direction: integrationDirection(body.direction),
      displayName: optionalString(body.displayName),
      provider: integrationProvider(body.provider),
      state: integrationState(body.state),
    });
    return json(result);
  }

  if (resource === "portal-settings") {
    const result = await ctx.runMutation(api.amend.updatePortalSettings, {
      workspaceSlug,
      accentColor: optionalString(body.accentColor),
      changelogVisibility: portalVisibility(body.changelogVisibility),
      feedbackMode: portalFeedbackMode(body.feedbackMode),
      headline: optionalString(body.headline),
      intro: optionalString(body.intro),
      roadmapVisibility: portalVisibility(body.roadmapVisibility),
    });
    return json(result);
  }

  if (resource === "projects") {
    const result = await ctx.runMutation(api.amend.createProject, {
      workspaceSlug,
      description: optionalString(body.description),
      name: requiredString(body.name, "name"),
      slug: optionalString(body.slug),
      visibility: projectVisibility(body.visibility),
    });
    return json(result, 201);
  }

  if (resource === "checkout") {
    const tier = planTier(body.tier);
    const checkoutPlan = stripeCheckoutPlan(tier);
    if (!checkoutPlan) {
      return json({ error: "tier must be a paid self-serve Amend plan" }, 400);
    }

    const result = await createStripeCheckoutSession({
      cancelUrl: optionalString(body.cancelUrl),
      customerEmail: optionalString(body.customerEmail),
      dryRun: optionalBoolean(body.dryRun) ?? false,
      seats: numberValue(body.seats) ?? 1,
      successUrl: optionalString(body.successUrl),
      tier: checkoutPlan.tier,
      workspaceSlug,
    });
    return json(result, result.provider === "stripe" ? 201 : 200);
  }

  if (resource === "plans") {
    const result = await ctx.runMutation(api.amend.updatePlan, {
      workspaceSlug,
      seats: numberValue(body.seats),
      tier: planTier(body.tier),
    });
    return json(result);
  }

  if (resource === "repositories") {
    const result = await ctx.runMutation(api.amend.connectProjectRepository, {
      workspaceSlug,
      defaultBranch: optionalString(body.defaultBranch),
      owner: requiredString(body.owner, "owner"),
      projectKey: requiredString(body.projectKey, "projectKey"),
      repo: requiredString(body.repo, "repo"),
      repositoryUrl: optionalString(body.repositoryUrl),
    });
    return json(result, 201);
  }

  if (resource === "preferences") {
    const result = await ctx.runMutation(api.amend.upsertNotificationPreference, {
      workspaceSlug,
      accountId: optionalString(body.accountId),
      digestDay: optionalString(body.digestDay),
      digestHour: numberValue(body.digestHour),
      email: optionalString(body.email),
      externalUserId: optionalString(body.externalUserId) ?? optionalString(body.userId),
      mode: notificationMode(body.mode),
      unsubscribed: optionalBoolean(body.unsubscribed),
    });
    return json(result);
  }

  if (resource === "domains") {
    if (body.action === "verify") {
      const domain = requiredString(body.domain, "domain");
      const settings = await ctx.runQuery(internal.amend.getWorkspaceSettingsForApi, {
        workspaceSlug,
      });
      const customDomain = settings.customDomains.find(
        (item: { domain: string; verificationToken: string }) => item.domain === domain,
      );
      if (!customDomain) {
        return json({ error: "Custom domain not found" }, 404);
      }
      const verified = await verifyDomainTxt(domain, customDomain.verificationToken);
      const result = await ctx.runMutation(api.amend.updateCustomDomainStatus, {
        domain,
        status: verified ? "verified" : "failed",
      });
      return json({
        ...result,
        expectedTxt: customDomain.verificationToken,
        verified,
      });
    }

    const result = await ctx.runMutation(api.amend.registerCustomDomain, {
      workspaceSlug,
      domain: requiredString(body.domain, "domain"),
      purpose: domainPurpose(body.purpose),
    });
    return json(result, 201);
  }

  if (resource === "deliveries") {
    if (body.action === "send") {
      const deliveries = await ctx.runQuery(internal.amend.getDeliveryOutboxForApi, {
        workspaceSlug,
      });
      const result = await sendQueuedDeliveries(
        deliveries,
        async (deliveryId, patch) =>
          await ctx.runMutation(api.amend.updateDeliveryStatus, {
            deliveryId,
            ...patch,
          }),
        {
          channel: deliveryChannel(body.channel),
          dryRun: optionalBoolean(body.dryRun) ?? false,
          limit: numberValue(body.limit) ?? 25,
        },
      );
      return json(result);
    }

    const result = await ctx.runMutation(api.amend.planNotificationDeliveries, {
      workspaceSlug,
      channel: deliveryChannel(body.channel),
      notificationKey: optionalString(body.notificationKey),
      provider: optionalString(body.provider),
    });
    return json(result, 201);
  }

  return undefined;
}
