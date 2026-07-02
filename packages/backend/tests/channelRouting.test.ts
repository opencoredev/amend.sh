import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import type { QueryCtx } from "../convex/_generated/server";
import {
  devDefaultWorkspaceSlug,
  resolveChannelRoute,
  resolveSignalWorkspaceSlug,
} from "../convex/ingest/channelRouting";

type StubRoute = {
  _id: string;
  workspaceId: string;
  provider: string;
  routingKey: string;
  state: "active" | "disabled";
  config: { ackReaction?: boolean; listenChannels?: string[] };
};

// Minimal db stub covering the two ctx calls channelRouting makes:
// query("channelRoutes").withIndex(...).unique() and get(workspaceId).
function stubCtx(
  routes: StubRoute[],
  workspaces: Record<string, { _id: string; slug: string }>,
): QueryCtx {
  return {
    db: {
      get: async (id: string) => workspaces[id] ?? null,
      query: () => ({
        withIndex: (
          _name: string,
          build: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
        ) => {
          const eqs: Record<string, unknown> = {};
          const builder = {
            eq(field: string, value: unknown) {
              eqs[field] = value;
              return builder;
            },
          };
          build(builder);
          const matches = routes.filter((route) =>
            Object.entries(eqs).every(
              ([field, value]) => route[field as keyof StubRoute] === value,
            ),
          );
          return {
            unique: async () => {
              if (matches.length > 1) throw new Error("unique() found multiple rows");
              return matches[0] ?? null;
            },
          };
        },
      }),
    },
  } as unknown as QueryCtx;
}

const workspaceA = { _id: "ws_a", slug: "acme" };
const activeRoute: StubRoute = {
  _id: "route_1",
  workspaceId: "ws_a",
  provider: "discord",
  routingKey: "guild-123",
  state: "active",
  config: { ackReaction: true },
};

const ENV_KEYS = ["AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED", "DISCORD_DEFAULT_WORKSPACE_SLUG"] as const;
let savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};

beforeEach(() => {
  savedEnv = {};
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = savedEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("resolveChannelRoute", () => {
  test("matches an active route and loads its workspace + config", async () => {
    const ctx = stubCtx([activeRoute], { ws_a: workspaceA });
    const match = await resolveChannelRoute(ctx, "discord", "guild-123");
    expect(match?.workspace.slug).toBe("acme");
    expect(match?.config.ackReaction).toBe(true);
  });

  test("ignores disabled routes", async () => {
    const ctx = stubCtx([{ ...activeRoute, state: "disabled" }], { ws_a: workspaceA });
    expect(await resolveChannelRoute(ctx, "discord", "guild-123")).toBeNull();
  });

  test("ignores routes whose workspace no longer exists", async () => {
    const ctx = stubCtx([activeRoute], {});
    expect(await resolveChannelRoute(ctx, "discord", "guild-123")).toBeNull();
  });

  test("does not cross providers on the same routing key", async () => {
    const ctx = stubCtx([activeRoute], { ws_a: workspaceA });
    expect(await resolveChannelRoute(ctx, "slack", "guild-123")).toBeNull();
  });

  test("rejects blank routing keys", async () => {
    const ctx = stubCtx([activeRoute], { ws_a: workspaceA });
    expect(await resolveChannelRoute(ctx, "discord", "   ")).toBeNull();
  });
});

describe("resolveSignalWorkspaceSlug precedence", () => {
  test("route match wins over the dev default", async () => {
    process.env.AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED = "1";
    process.env.DISCORD_DEFAULT_WORKSPACE_SLUG = "dev-fallback";
    const ctx = stubCtx([activeRoute], { ws_a: workspaceA });
    expect(await resolveSignalWorkspaceSlug(ctx, "discord", "guild-123")).toBe("acme");
  });

  test("unrouted signals resolve to null without the dev flag, even when the default slug is set", async () => {
    process.env.DISCORD_DEFAULT_WORKSPACE_SLUG = "dev-fallback";
    const ctx = stubCtx([], {});
    expect(await resolveSignalWorkspaceSlug(ctx, "discord", "guild-999")).toBeNull();
  });

  test("dev flag opts unrouted signals into the default workspace", async () => {
    process.env.AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED = "1";
    process.env.DISCORD_DEFAULT_WORKSPACE_SLUG = "dev-fallback";
    const ctx = stubCtx([], {});
    expect(await resolveSignalWorkspaceSlug(ctx, "discord", "guild-999")).toBe("dev-fallback");
    expect(await resolveSignalWorkspaceSlug(ctx, "discord")).toBe("dev-fallback");
  });

  test("dev flag without a default slug still resolves to null", async () => {
    process.env.AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED = "1";
    const ctx = stubCtx([], {});
    expect(await resolveSignalWorkspaceSlug(ctx, "discord", "guild-999")).toBeNull();
  });
});

describe("devDefaultWorkspaceSlug", () => {
  test("requires the exact flag value '1'", () => {
    process.env.DISCORD_DEFAULT_WORKSPACE_SLUG = "dev-fallback";
    expect(devDefaultWorkspaceSlug()).toBeNull();
    process.env.AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED = "true";
    expect(devDefaultWorkspaceSlug()).toBeNull();
    process.env.AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED = "1";
    expect(devDefaultWorkspaceSlug()).toBe("dev-fallback");
  });
});
