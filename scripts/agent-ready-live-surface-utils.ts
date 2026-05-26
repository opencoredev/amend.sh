import { checkAiUserAgentAccess, checkTextEndpoint } from "./agent-ready-live-checks";

export type AddCheck = (name: string, ok: boolean, detail?: string) => void;

export type LiveSurfaceContext = {
  add: AddCheck;
  docsOrigin: string;
  webOrigin: string;
};

type TextEndpointOptions = Omit<Parameters<typeof checkTextEndpoint>[0], "add">;

export function textEndpoint(add: AddCheck, options: TextEndpointOptions) {
  return checkTextEndpoint({ ...options, add });
}

export function aiUserAgentAccess(
  add: AddCheck,
  options: Omit<Parameters<typeof checkAiUserAgentAccess>[0], "add">,
) {
  return checkAiUserAgentAccess({ ...options, add });
}
