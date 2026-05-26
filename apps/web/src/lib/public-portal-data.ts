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
    const convexUrl = env.VITE_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("VITE_CONVEX_URL is required to fetch public portal data.");
    }
    convexClient = new ConvexHttpClient(convexUrl);
  }

  return convexClient;
}
