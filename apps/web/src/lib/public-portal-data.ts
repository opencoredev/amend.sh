import { api } from "@amend/backend/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

import type { PortalData } from "@/components/public-portal-types";
import { requiredClientEnv } from "@/lib/client-env";

let convexClient: ConvexHttpClient | null = null;

export async function getPublicPortalData(workspaceSlug: string): Promise<PortalData> {
  const client = getConvexClient();
  return await client.query(api.amend.getPublicPortal, { workspaceSlug });
}

function getConvexClient() {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(requiredClientEnv("VITE_CONVEX_URL"));
  }

  return convexClient;
}
