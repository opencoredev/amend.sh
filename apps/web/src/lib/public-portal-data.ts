import { env } from "@amend/env/web";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

import type { PortalData } from "@/components/public-portal-types";

const publicPortalQuery = makeFunctionReference<"query">("amend:getPublicPortal");

let convexClient: ConvexHttpClient | null = null;

export async function getPublicPortalData(workspaceSlug: string) {
  const client = getConvexClient();
  return (await client.query(publicPortalQuery, { workspaceSlug })) as PortalData;
}

function getConvexClient() {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(env.VITE_CONVEX_URL);
  }

  return convexClient;
}
