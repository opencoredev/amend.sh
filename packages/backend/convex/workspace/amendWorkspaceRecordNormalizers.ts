import type { Doc } from "../_generated/dataModel";

export function normalizeWorkspace(workspace: Doc<"workspaces">) {
  return {
    recordId: workspace._id,
    slug: workspace.slug,
    name: workspace.name,
    description: workspace.description,
    portalSettings: workspace.portalSettings,
    visibility: workspace.visibility,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}

export function normalizeConnection(connection: Doc<"githubConnections">) {
  return {
    recordId: connection._id,
    projectId: connection.projectId,
    provider: connection.provider,
    owner: connection.owner,
    repo: connection.repo,
    repositoryUrl: connection.repositoryUrl,
    defaultBranch: connection.defaultBranch,
    installationState: connection.installationState,
    watches: connection.watches,
    syncStatus: connection.syncStatus ?? "healthy",
    lastSyncError: connection.lastSyncError,
    lastSyncedAt: connection.lastSyncedAt,
    lastWebhookDeliveryAt: connection.lastWebhookDeliveryAt,
  };
}

export function normalizeProject(
  project: Doc<"projects">,
  repositories: Doc<"githubConnections">[] = [],
) {
  return {
    recordId: project._id,
    stableKey: project.stableKey,
    name: project.name,
    slug: project.slug,
    description: project.description,
    logoUrl: project.logoUrl,
    logoStorageId: project.logoStorageId,
    websiteUrl: project.websiteUrl,
    sourceMode: project.sourceMode,
    visibility: project.visibility,
    repositories: repositories.map(normalizeConnection),
    updatedAt: project.updatedAt,
  };
}

export function normalizePlan(plan: Doc<"plans">) {
  return {
    recordId: plan._id,
    tier: plan.tier,
    billingState: plan.billingState,
    isOpenSource: plan.isOpenSource,
    seats: plan.seats,
    priceMonthly: plan.priceMonthly,
    limits: plan.limits,
    posture: plan.posture,
    notes: plan.notes,
  };
}

export function normalizeMember(member: Doc<"workspaceMembers">) {
  return {
    recordId: member._id,
    email: member.email,
    name: member.name,
    role: member.role,
    permissions: member.permissions,
    updatedAt: member.updatedAt,
  };
}

export function defaultPermissionsForRole(role: Doc<"workspaceMembers">["role"]) {
  if (role === "owner") {
    return ["workspace:admin", "review:approve", "changelog:publish", "rules:update"];
  }
  if (role === "admin") {
    return ["workspace:manage", "review:approve", "changelog:publish", "rules:update"];
  }
  if (role === "reviewer") {
    return ["review:approve", "changelog:edit"];
  }
  if (role === "member") {
    return ["feedback:triage", "changelog:edit"];
  }
  return ["workspace:view"];
}

export function normalizeIntegration(integration: Doc<"integrationConnections">) {
  return {
    recordId: integration._id,
    provider: integration.provider,
    direction: integration.direction,
    state: integration.state,
    displayName: integration.displayName,
    config: integration.config,
    lastSyncedAt: integration.lastSyncedAt,
    updatedAt: integration.updatedAt,
  };
}

export function normalizeDomain(domain: Doc<"customDomains">) {
  return {
    recordId: domain._id,
    domain: domain.domain,
    purpose: domain.purpose,
    status: domain.status,
    verificationToken: domain.verificationToken,
    lastCheckedAt: domain.lastCheckedAt,
    updatedAt: domain.updatedAt,
  };
}

export function titleize(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
