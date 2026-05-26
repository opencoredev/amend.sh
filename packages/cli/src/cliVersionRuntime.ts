import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { defaultUpdateCheckUrl } from "./cliDemoData";
import type { CliEnv } from "./cliRuntime";

type UpdateCheckContext = {
  env: CliEnv;
  fetch: typeof fetch;
};

export function resolveOpenApiPath(cwd: string) {
  return join(cwd, "packages", "api-spec", "openapi.yaml");
}

export function localVersionMetadata(cwd: string, env: CliEnv) {
  const rootPackage = readPackageJson(join(cwd, "package.json"));
  const backendPackage = readPackageJson(join(cwd, "packages", "backend", "package.json"));
  const cliPackage = readPackageJson(join(cwd, "packages", "cli", "package.json"));
  const sdkPackage = readPackageJson(join(cwd, "packages", "sdk", "package.json"));
  const apiSpecPackage = readPackageJson(join(cwd, "packages", "api-spec", "package.json"));
  const version =
    env.AMEND_VERSION ??
    stringValue(rootPackage.version) ??
    stringValue(cliPackage.version) ??
    "0.0.0-dev";

  return {
    commit: env.AMEND_COMMIT_SHA,
    packages: {
      apiSpec: stringValue(apiSpecPackage.version),
      backend: stringValue(backendPackage.version),
      cli: stringValue(cliPackage.version),
      root: stringValue(rootPackage.version),
      sdk: stringValue(sdkPackage.version),
    },
    source: env.AMEND_VERSION ? "env" : "package",
    version,
  };
}

export async function checkForUpdate(context: UpdateCheckContext, currentVersion: string) {
  if (context.env.AMEND_DISABLE_VERSION_CHECK === "1") {
    return {
      checked: false,
      detail: "Disabled by AMEND_DISABLE_VERSION_CHECK=1.",
      status: "disabled",
    };
  }

  const url = context.env.AMEND_UPDATE_CHECK_URL ?? defaultUpdateCheckUrl;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_500);
  try {
    const response = await context.fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "amend-cli",
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        checked: true,
        detail: `Update metadata returned HTTP ${response.status}.`,
        status: "unavailable",
      };
    }

    const latestVersion =
      stringValue((payload as Record<string, unknown>).tag_name) ??
      stringValue((payload as Record<string, unknown>).version) ??
      stringValue((payload as Record<string, unknown>).name);
    const releaseUrl =
      stringValue((payload as Record<string, unknown>).html_url) ??
      stringValue((payload as Record<string, unknown>).url);
    const updateAvailable = latestVersion
      ? compareVersions(latestVersion, currentVersion) > 0
      : false;

    return {
      checked: true,
      currentVersion,
      detail: latestVersion
        ? updateAvailable
          ? `New version available: ${latestVersion}${releaseUrl ? ` (${releaseUrl})` : ""}.`
          : `Current version ${currentVersion} is up to date with ${latestVersion}.`
        : "Update metadata did not include a version.",
      latestVersion,
      releaseUrl,
      status: updateAvailable ? "update_available" : "ok",
      updateAvailable,
    };
  } catch (error) {
    return {
      checked: true,
      detail: `Update metadata could not be fetched: ${error instanceof Error ? error.message : String(error)}.`,
      status: "unavailable",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function updateCheckPosture(context: UpdateCheckContext) {
  if (context.env.AMEND_DISABLE_VERSION_CHECK === "1") {
    return {
      checked: false,
      detail: "Disabled by AMEND_DISABLE_VERSION_CHECK=1.",
      status: "disabled",
    };
  }

  return {
    checked: false,
    detail: "Not contacted. Pass --check to fetch public release metadata.",
    status: "not_checked",
  };
}

function readPackageJson(path: string) {
  if (!existsSync(path)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function compareVersions(latest: string, current: string) {
  const latestParts = versionParts(latest);
  const currentParts = versionParts(current);
  for (let index = 0; index < Math.max(latestParts.length, currentParts.length); index += 1) {
    const latestPart = latestParts[index] ?? 0;
    const currentPart = currentParts[index] ?? 0;
    if (latestPart !== currentPart) {
      return latestPart > currentPart ? 1 : -1;
    }
  }
  return 0;
}

function versionParts(version: string) {
  return version
    .replace(/^v/i, "")
    .split(/[.-]/)
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part));
}
