import { AmendAgentClient } from "./agent-client";

export { AmendApiError } from "./http";
export { createAmendPanel } from "./embed";
export type * from "./types";

export class Amend extends AmendAgentClient {}
