import { describe } from "bun:test";
import { registerCliAgentApiTests } from "./cli-agent-api.test-module";
import { registerCliDemoTests } from "./cli-demo.test-module";
import { registerCliRuntimeTests } from "./cli-runtime.test-module";

describe("Amend CLI", () => {
  registerCliDemoTests();
  registerCliAgentApiTests();
  registerCliRuntimeTests();
});
