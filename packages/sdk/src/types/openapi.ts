import type { components, paths } from "../openapi-types";

export type AmendOpenApiPaths = paths;
export type AmendOpenApiComponents = components;
export type AmendOpenApiSchemas = components["schemas"];

export type AmendPortalResponse = AmendOpenApiSchemas["PortalResponse"];
export type AmendUpdatesResponse = AmendOpenApiSchemas["UpdatesResponse"];
export type AmendRoadmapItem = AmendOpenApiSchemas["RoadmapItem"];
export type AmendChangelogEntry = AmendOpenApiSchemas["ChangelogEntry"];
export type AmendNotification = AmendOpenApiSchemas["Notification"];
export type AmendProject = AmendOpenApiSchemas["Project"];
export type AmendAutomationDecision = AmendOpenApiSchemas["AutomationDecision"];
export type AmendDelivery = AmendOpenApiSchemas["Delivery"];
