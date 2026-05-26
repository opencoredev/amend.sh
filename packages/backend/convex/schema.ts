import { defineSchema } from "convex/server";

import { productSchemaTables } from "./schemaProductTables";
import { workspaceSchemaTables } from "./schemaWorkspaceTables";

export default defineSchema({
  ...workspaceSchemaTables,
  ...productSchemaTables,
});
