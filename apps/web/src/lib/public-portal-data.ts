import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

import type { PortalData } from "@/components/public-portal-types";
import { requiredClientEnv } from "@/lib/client-env";

const publicPortalQuery = makeFunctionReference<"query">("amend:getPublicPortal");

let convexClient: ConvexHttpClient | null = null;

export async function getPublicPortalData(workspaceSlug: string) {
  const client = getConvexClient();
  return (await client.query(publicPortalQuery, { workspaceSlug })) as PortalData;
}

function getConvexClient() {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(requiredClientEnv("VITE_CONVEX_URL"));
  }

  return convexClient;
}
