import { runSmokeConfigAuthChecks } from "./smoke-config-auth-checks";
import { runSmokeDashboardChecks } from "./smoke-dashboard-checks";
import { finishSmoke } from "./smoke-helpers";
import { runSmokeProductContractChecks } from "./smoke-product-contract-checks";
import { runSmokeRuntimeChecks } from "./smoke-runtime-checks";

await runSmokeConfigAuthChecks();
await runSmokeProductContractChecks();
await runSmokeDashboardChecks();
await runSmokeRuntimeChecks();

finishSmoke();
