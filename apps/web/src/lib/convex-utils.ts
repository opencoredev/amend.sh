// 2026-07-01: import backend types via `import type` ONLY. The @amend/backend
// exports map points "./convex/_generated/*" at "*.js", but _generated ships no
// dataModel.js — type-only imports erase at build time, a value import would
// typecheck green and then fail vite resolution.
import { useConvexAuth, useQuery } from "convex/react";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";

/**
 * Gate every read on the Convex client's *own* auth state. The better-auth
 * session flips true a beat before the Convex client finishes attaching its
 * token; a query fired in that gap reaches the backend anonymous and throws
 * "Sign in before using the Amend dashboard." Skipping until the Convex client
 * is authenticated closes that race — screens just see loading until the token
 * lands, then the live data streams in.
 */
export function useAuthedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>,
): FunctionReturnType<Query> | undefined;
export function useAuthedQuery(
  query: FunctionReference<"query">,
  args: Record<string, unknown>,
): unknown {
  const { isAuthenticated } = useConvexAuth();
  return useQuery(query, isAuthenticated ? args : "skip");
}
