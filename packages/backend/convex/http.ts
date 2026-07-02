import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import * as discordInteractions from "./convexDiscordInteractions";
import * as discordMessages from "./convexDiscordMessages";
import { restGet } from "./httpRestGet";
import { restPost } from "./httpRestPost";
import { corsHeaders, json, versionMetadata } from "./lib/httpRuntime";
import * as ingest from "./ingest";
import * as signalIngest from "./signalIngest";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

const versionGet = httpAction(async () => {
  return json(versionMetadata());
});

const restOptions = httpAction(async () => {
  return new Response(null, {
    headers: corsHeaders(),
    status: 204,
  });
});

http.route({ method: "GET", path: "/api/v1/version", handler: versionGet });
http.route({ method: "GET", pathPrefix: "/api/v1/", handler: restGet });
http.route({ method: "POST", pathPrefix: "/api/v1/", handler: restPost });
http.route({ method: "POST", path: "/ingest/githubWebhook", handler: ingest.githubWebhook });
http.route({
  method: "POST",
  path: "/ingest/discordInteraction",
  handler: discordInteractions.discordInteraction,
});
http.route({
  method: "POST",
  path: "/ingest/discordMessage",
  handler: discordMessages.discordMessageIngest,
});
http.route({ method: "POST", path: "/ingest/signal", handler: signalIngest.signal });
http.route({ method: "POST", path: "/ingest/sourceEvent", handler: ingest.sourceEvent });
http.route({ method: "OPTIONS", pathPrefix: "/api/v1/", handler: restOptions });

export default http;
