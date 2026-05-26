import { runSmokeProductBrandAndDocsChecks } from "./smoke-product-brand-doc-checks";
import { runSmokeProductLoopChecks } from "./smoke-product-loop-checks";
import { runSmokeProductPortalChecks } from "./smoke-product-portal-checks";
import { runSmokeProductWorkspaceAdminChecks } from "./smoke-product-workspace-admin-checks";

export async function runSmokeProductContractChecks() {
  await runSmokeProductBrandAndDocsChecks();
  await runSmokeProductPortalChecks();
  await runSmokeProductWorkspaceAdminChecks();
  await runSmokeProductLoopChecks();
}
