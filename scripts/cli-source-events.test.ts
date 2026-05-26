import { describe } from "bun:test";
import { registerCliSourceEventCsvTests } from "./cli-source-events-csv.test-module";
import { registerCliSourceEventImportTests } from "./cli-source-events-import.test-module";
import { registerCliSourceEventListTests } from "./cli-source-events-list.test-module";

describe("Amend CLI source events", () => {
  registerCliSourceEventListTests();
  registerCliSourceEventImportTests();
  registerCliSourceEventCsvTests();
});
