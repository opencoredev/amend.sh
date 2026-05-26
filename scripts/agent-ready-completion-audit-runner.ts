import type { Check, loadCompletionAuditContext } from "./agent-ready-completion-audit-context";
import { addCompletionArtifactChecks } from "./agent-ready-completion-audit-artifact-checks";
import { isNumber, isStringArray, makeCheckAdder } from "./agent-ready-completion-audit-helpers";

type CompletionAuditContext = Awaited<ReturnType<typeof loadCompletionAuditContext>>;

export const completionAuditReportSchemaUrl =
  "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json";

export const productionBlockerCheckNames = new Set([
  "saved production report has passing strict readiness",
  "saved production report has all production env loaded",
  "saved production report has passing live validator",
  "saved production report is complete and blocker-free",
]);

type CompletionAuditRunnerOptions = {
  allowProductionBlockers: boolean;
  jsonOutput: boolean;
  reportPath: string;
};

export function runCompletionAudit(
  context: CompletionAuditContext,
  { allowProductionBlockers, jsonOutput, reportPath }: CompletionAuditRunnerOptions,
) {
  const checks: Check[] = [];
  const add = makeCheckAdder(checks, jsonOutput);
  const builtPassed = context.productionReport.steps?.built?.summary?.passed;
  const builtTotal = context.productionReport.steps?.built?.summary?.total;
  const livePassed = context.productionReport.steps?.live?.report?.passed;
  const liveTotal = context.productionReport.steps?.live?.report?.total;
  const envMissing = context.productionReport.steps?.status?.report?.productionEnv?.missing;
  const blockers = context.productionReport.blockers;

  addCompletionArtifactChecks(checks, context, jsonOutput);
  add(
    "saved production report has passing built artifact validation",
    context.productionReport.steps?.built?.ok === true &&
      isNumber(builtPassed) &&
      isNumber(builtTotal) &&
      builtPassed === builtTotal,
    isNumber(builtPassed) && isNumber(builtTotal) ? `${builtPassed}/${builtTotal}` : undefined,
  );
  add(
    "saved production report has passing strict readiness",
    context.productionReport.steps?.readinessStrict?.ok === true,
  );
  add(
    "saved production report has all production env loaded",
    context.productionReport.steps?.status?.ok === true &&
      context.productionReport.steps.status.report?.ok === true &&
      isStringArray(envMissing) &&
      envMissing.length === 0,
    isStringArray(envMissing) ? `${envMissing.length} missing` : undefined,
  );
  add(
    "saved production report has passing live validator",
    context.productionReport.steps?.live?.ok === true &&
      context.productionReport.steps.live.report?.ok === true &&
      isNumber(livePassed) &&
      isNumber(liveTotal) &&
      livePassed === liveTotal,
    isNumber(livePassed) && isNumber(liveTotal) ? `${livePassed}/${liveTotal}` : undefined,
  );
  add(
    "saved production report is complete and blocker-free",
    context.productionReport.ok === true && isStringArray(blockers) && blockers.length === 0,
    isStringArray(blockers) ? `${blockers.length} blockers` : undefined,
  );

  const failed = checks.filter((check) => !check.ok);
  const nonProductionFailures = failed.filter(
    (check) => !productionBlockerCheckNames.has(check.name),
  );
  const completionOk = failed.length === 0;
  const productionBlockersOnly = failed.length > 0 && nonProductionFailures.length === 0;
  const ok = completionOk || (allowProductionBlockers && productionBlockersOnly);
  const summary = {
    failed: failed.length,
    passed: checks.length - failed.length,
    total: checks.length,
  };

  return {
    failed,
    ok,
    productionBlockersOnly,
    result: {
      $schema: completionAuditReportSchemaUrl,
      allowProductionBlockers,
      checkedAt: new Date().toISOString(),
      checks,
      completionOk,
      missingOrBlocked: failed,
      ok,
      productionBlockersOnly,
      productionReportPath: reportPath,
      summary,
    },
    summary,
  };
}
