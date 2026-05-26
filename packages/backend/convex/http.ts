import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { restGet } from "./httpRestGet";
import { restPost } from "./httpRestPost";
import { corsHeaders, json, versionMetadata } from "./httpRuntime";

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
http.route({ method: "OPTIONS", pathPrefix: "/api/v1/", handler: restOptions });

export default http;
