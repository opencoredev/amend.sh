import type { ActionCtx } from "./_generated/server";

export type RestPostInput = {
  body: Record<string, unknown>;
  ctx: ActionCtx;
  rawBody: string;
  request: Request;
  resource: string;
  workspaceSlug: string;
};
