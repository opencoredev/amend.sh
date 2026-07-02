import { defineSchema } from "convex/server";

import { productSchemaTables } from "./schema/schemaProductTables";
import { workspaceSchemaTables } from "./schema/schemaWorkspaceTables";

export default defineSchema({
  ...workspaceSchemaTables,
  ...productSchemaTables,
});
