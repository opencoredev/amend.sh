import { optionalString } from "./httpRuntimeScalars";

declare const process: {
  env: {
    AMEND_BUILD_SHA?: string;
    AMEND_BUILD_TIME?: string;
    AMEND_COMMIT_SHA?: string;
    AMEND_DISABLE_VERSION_CHECK?: string;
    AMEND_UPDATE_CHECK_URL?: string;
    AMEND_VERSION?: string;
    GITHUB_APP_CLIENT_ID?: string;
    GITHUB_APP_CLIENT_SECRET?: string;
    GITHUB_APP_ID?: string;
    GITHUB_APP_PRIVATE_KEY?: string;
    GITHUB_APP_SLUG?: string;
    GITHUB_WEBHOOK_SECRET?: string;
  };
};

export function githubAppInstallInfo(workspaceSlug: string) {
  const appId = optionalString(process.env.GITHUB_APP_ID);
  const appSlug = optionalString(process.env.GITHUB_APP_SLUG);
  const clientId = optionalString(process.env.GITHUB_APP_CLIENT_ID);
  const state = encodeURIComponent(JSON.stringify({ source: "amend", workspaceSlug }));

  return {
    appId,
    clientId,
    configured: Boolean(
      appId &&
      appSlug &&
      clientId &&
      process.env.GITHUB_APP_CLIENT_SECRET &&
      process.env.GITHUB_APP_PRIVATE_KEY &&
      process.env.GITHUB_WEBHOOK_SECRET,
    ),
    installUrl: appSlug
      ? `https://github.com/apps/${encodeURIComponent(appSlug)}/installations/new?state=${state}`
      : undefined,
    missing: [
      appId ? undefined : "GITHUB_APP_ID",
      appSlug ? undefined : "GITHUB_APP_SLUG",
      clientId ? undefined : "GITHUB_APP_CLIENT_ID",
      process.env.GITHUB_APP_CLIENT_SECRET ? undefined : "GITHUB_APP_CLIENT_SECRET",
      process.env.GITHUB_APP_PRIVATE_KEY ? undefined : "GITHUB_APP_PRIVATE_KEY",
      process.env.GITHUB_WEBHOOK_SECRET ? undefined : "GITHUB_WEBHOOK_SECRET",
    ].filter((item): item is string => Boolean(item)),
    workspaceSlug,
  };
}

export function versionMetadata() {
  const version = optionalString(process.env.AMEND_VERSION) ?? "0.0.0-dev";
  const commit =
    optionalString(process.env.AMEND_COMMIT_SHA) ?? optionalString(process.env.AMEND_BUILD_SHA);
  const updateCheckDisabled = process.env.AMEND_DISABLE_VERSION_CHECK === "1";

  return {
    apiVersion: "v1",
    buildTime: optionalString(process.env.AMEND_BUILD_TIME),
    commit,
    name: "amend",
    source: "backend",
    updateCheck: {
      enabled: !updateCheckDisabled,
      releaseUrl:
        optionalString(process.env.AMEND_UPDATE_CHECK_URL) ??
        "https://api.github.com/repos/amend-sh/amend/releases/latest",
      privacy:
        "This endpoint only reports deployment metadata. CLI update checks fetch public release metadata only when requested.",
    },
    updateCheckDisabled,
    version,
  };
}
