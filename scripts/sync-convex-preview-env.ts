const deploymentUrl = process.env.DEPLOYMENT_URL;
const deployKey = process.env.CONVEX_DEPLOY_KEY;
const allowedEmails = process.env.AMEND_AUTH_ALLOWED_EMAILS;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const previewAuthEnabled = process.env.AMEND_PREVIEW_AUTH_ENABLED ?? "true";
const previewSeedingEnabled = process.env.AMEND_PREVIEW_SEEDING_ENABLED ?? "true";
const syncPhase = process.env.AMEND_PREVIEW_ENV_SYNC_PHASE ?? "final";

if (!deploymentUrl && syncPhase === "final") {
  throw new Error("DEPLOYMENT_URL is required to sync final Convex preview environment variables.");
}

if (!deployKey) {
  throw new Error("CONVEX_DEPLOY_KEY is required to sync Convex preview environment variables.");
}

if (!allowedEmails) {
  throw new Error("AMEND_AUTH_ALLOWED_EMAILS is required for private preview auth.");
}

if (!betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is required for preview auth.");
}

const metadataFile = Bun.file(".vercel/convex-preview.json");

if (!(await metadataFile.exists())) {
  throw new Error(".vercel/convex-preview.json was not created during the preview build.");
}

const metadata = (await metadataFile.json()) as {
  convexSiteUrl?: string;
  convexUrl?: string;
};

if (!metadata.convexUrl?.startsWith("https://")) {
  throw new Error("Convex preview metadata is missing a valid convexUrl.");
}

const changes = [
  { name: "SITE_URL", value: deploymentUrl ?? metadata.convexSiteUrl },
  { name: "AMEND_AUTH_ALLOWED_EMAILS", value: allowedEmails },
  { name: "AMEND_PREVIEW_AUTH_ENABLED", value: previewAuthEnabled },
  { name: "AMEND_PREVIEW_SEEDING_ENABLED", value: previewSeedingEnabled },
  { name: "BETTER_AUTH_SECRET", value: betterAuthSecret },
];

const response = await fetch(`${metadata.convexUrl}/api/v1/update_environment_variables`, {
  method: "POST",
  headers: {
    authorization: `Convex ${deployKey}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({ changes }),
});

if (!response.ok) {
  throw new Error(`${response.status} ${await response.text()}`);
}

console.log(
  deploymentUrl
    ? `Synced Convex preview runtime environment for ${new URL(deploymentUrl).host}.`
    : `Synced Convex preview bootstrap environment for ${new URL(metadata.convexSiteUrl!).host}.`,
);
