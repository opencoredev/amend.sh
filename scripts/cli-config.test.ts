import { describe } from "bun:test";
import { registerCliConfigMetadataTests } from "./cli-config-metadata.test-module";
import { registerCliConfigPermissionTests } from "./cli-config-permissions.test-module";
import { registerCliConfigSourceTests } from "./cli-config-source.test-module";

describe("Amend CLI config and permissions", () => {
  registerCliConfigSourceTests();
  registerCliConfigMetadataTests();
  registerCliConfigPermissionTests();
});
