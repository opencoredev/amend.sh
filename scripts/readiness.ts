import { checks, strict } from "./readiness-context";
import { runReadinessAgentDocChecks } from "./readiness-agent-doc-checks";
import { runReadinessAgentLiveBuiltChecks } from "./readiness-agent-live-built-checks";
import { runReadinessAgentReportChecks } from "./readiness-agent-report-checks";
import { runReadinessSurfaceChecks } from "./readiness-surface-checks";
import { runProductionReadinessChecks } from "./readiness-production-checks";

runReadinessSurfaceChecks();
runReadinessAgentLiveBuiltChecks();
runReadinessAgentReportChecks();
runReadinessAgentDocChecks();

await runProductionReadinessChecks();

const failed = checks.filter((check) => !check.ok);
const localFailures = failed.filter((check) => !check.name.startsWith("production env "));
const productionEnvFailures = failed.filter((check) => check.name.startsWith("production env "));

console.log("");
console.log(`Readiness summary: ${checks.length - failed.length}/${checks.length} checks passing.`);
if (productionEnvFailures.length > 0) {
  console.log(
    `${productionEnvFailures.length} production env checks need real deployment secrets or provider setup.`,
  );
}

if (localFailures.length > 0 || (strict && failed.length > 0)) {
  process.exitCode = 1;
  if (strict) {
    console.error("Strict readiness failed.");
  } else {
    console.error("Local readiness failed.");
  }
}
