const token = process.env.CONVEX_MANAGEMENT_TOKEN;
const projectId = process.env.CONVEX_PROJECT_ID;
const previewName = process.env.CONVEX_PREVIEW_NAME;

if (!token) {
  throw new Error("CONVEX_MANAGEMENT_TOKEN is required to delete a Convex preview deployment.");
}

if (!projectId) {
  throw new Error("CONVEX_PROJECT_ID is required to delete a Convex preview deployment.");
}

if (!previewName) {
  throw new Error("CONVEX_PREVIEW_NAME is required to delete a Convex preview deployment.");
}

const deployment = await findPreviewDeployment(projectId, previewName);

if (!deployment) {
  console.log(`No Convex preview deployment found for ${previewName}; nothing to delete.`);
  process.exit(0);
}

await convexFetch(`https://api.convex.dev/v1/deployments/${deployment.name}/delete`, {
  method: "POST",
});
console.log(`Deleted Convex preview deployment ${deployment.name} for ${previewName}.`);

type ConvexDeployment = {
  deploymentType?: string;
  name: string;
  previewIdentifier?: string | null;
  reference?: string | null;
};

async function findPreviewDeployment(projectIdValue: string, previewNameValue: string) {
  const deployments = (await convexFetch(
    `https://api.convex.dev/v1/projects/${projectIdValue}/list_deployments`,
  )) as ConvexDeployment[];

  return deployments.find(
    (deployment) =>
      deployment.deploymentType === "preview" &&
      (deployment.previewIdentifier === previewNameValue ||
        deployment.reference === previewNameValue ||
        deployment.name === previewNameValue),
  );
}

async function convexFetch(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
