const token = process.env.VERCEL_TOKEN;
const projectId = process.env.VERCEL_PROJECT_ID;
const teamId = process.env.VERCEL_ORG_ID;
const previewName = process.env.CONVEX_PREVIEW_NAME;

if (!token) {
  throw new Error("VERCEL_TOKEN is required to delete Vercel preview deployments.");
}

if (!projectId) {
  throw new Error("VERCEL_PROJECT_ID is required to delete Vercel preview deployments.");
}

if (!previewName) {
  throw new Error("CONVEX_PREVIEW_NAME is required to delete Vercel preview deployments.");
}

const deployments = await listDeployments();
const matchingDeployments = deployments.filter((deployment) => {
  return deployment.meta?.amendPreviewName === previewName && deployment.target !== "production";
});

if (matchingDeployments.length === 0) {
  console.log(`No Vercel preview deployments found for ${previewName}; nothing to delete.`);
  process.exit(0);
}

for (const deployment of matchingDeployments) {
  await deleteDeployment(deployment.uid, deployment.url);
}

console.log(
  `Deleted ${matchingDeployments.length} Vercel preview deployment(s) for ${previewName}.`,
);

type VercelDeployment = {
  meta?: Record<string, string | undefined>;
  target?: string | null;
  uid: string;
  url: string;
};

async function listDeployments() {
  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("limit", "100");
  url.searchParams.set("projectId", projectId!);
  url.searchParams.set("state", "READY,ERROR,CANCELED");
  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list Vercel deployments: ${response.status} ${await response.text()}`,
    );
  }

  const payload = (await response.json()) as { deployments?: VercelDeployment[] };
  return payload.deployments ?? [];
}

async function deleteDeployment(deploymentId: string, deploymentUrl: string) {
  const url = new URL(`https://api.vercel.com/v13/deployments/${deploymentId}`);
  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(
      `Failed to delete Vercel deployment ${deploymentUrl}: ${response.status} ${await response.text()}`,
    );
  }

  console.log(`Deleted Vercel preview deployment ${deploymentUrl}.`);
}
