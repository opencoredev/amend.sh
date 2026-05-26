import type { AmendPortalResponse, AmendUpdatesResponse } from "./types";

export type AmendPanelClient = {
  portal: () => Promise<AmendPortalResponse>;
  updatesForUser: (userId: string) => Promise<AmendUpdatesResponse>;
};

export type AmendPanelData = AmendPortalResponse | AmendUpdatesResponse;

export async function loadAmendPanelData(
  client: AmendPanelClient,
  userId?: string,
): Promise<AmendPanelData> {
  return userId ? await client.updatesForUser(userId) : await client.portal();
}
