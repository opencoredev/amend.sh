import { readFile, writeFile } from "node:fs/promises";

type ProductionReport = {
  steps?: {
    live?: {
      report?: LiveReport;
    };
    status?: {
      report?: {
        checkedAt?: unknown;
        productionEnv?: {
          passed?: unknown;
          total?: unknown;
        };
      };
    };
  };
};

type LiveReport = {
  blockers?: unknown;
  checkedAt?: unknown;
  checks?: unknown;
  ok?: unknown;
  origins?: unknown;
  passed?: unknown;
  total?: unknown;
};

const checkOnly = process.argv.includes("--check");
const reportPath =
  process.argv.find(
    (arg, index) => index > 1 && !arg.startsWith("--") && arg !== "agent-ready:sync-audit",
  ) ?? "agent-ready-production-report.json";
const liveReportPath = process.env.AGENT_READY_LIVE_REPORT_PATH ?? "agent-ready-live-report.json";
const agentReadyAuditPath = process.env.AGENT_READY_AUDIT_PATH ?? "docs/agent-ready-audit.md";
const completionAuditPath =
  process.env.AGENT_READY_COMPLETION_AUDIT_PATH ?? "docs/completion-audit.md";

function asString(value: unknown, label: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing ${label} in ${reportPath}.`);
  }
  return value;
}

function asNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Missing ${label} in ${reportPath}.`);
  }
  return value;
}

function replaceOnce(content: string, pattern: RegExp, replacement: string, label: string) {
  if (!pattern.test(content)) {
    throw new Error(`Could not update ${label}; expected audit line was not found.`);
  }
  const next = content.replace(pattern, replacement);
  return next;
}

function assertSynced(content: string, expected: string, label: string) {
  if (!content.includes(expected)) {
    throw new Error(`${label} is not synced with ${reportPath}. Expected: ${expected}`);
  }
}

function normalizedLiveReport(value: LiveReport | undefined) {
  if (!value || typeof value !== "object") {
    throw new Error(`Missing live report in ${reportPath}.`);
  }

  const { checkedAt: _checkedAt, ...normalized } = value;
  return normalized;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, stableValue(item)]),
  );
}

function comparableLiveReport(value: LiveReport | undefined) {
  return JSON.stringify(stableValue(normalizedLiveReport(value)));
}

async function assertStandaloneLiveReportSynced() {
  const standalone = JSON.parse(await readFile(liveReportPath, "utf8")) as LiveReport;
  const embedded = report.steps?.live?.report;
  const standaloneComparable = comparableLiveReport(standalone);
  const embeddedComparable = comparableLiveReport(embedded);

  if (standaloneComparable !== embeddedComparable) {
    throw new Error(
      `${liveReportPath} is not synced with ${reportPath} live report, ignoring checkedAt.`,
    );
  }
}

const report = JSON.parse(await readFile(reportPath, "utf8")) as ProductionReport;
const liveCheckedAt = asString(report.steps?.live?.report?.checkedAt, "live report checkedAt");
const livePassed = asNumber(report.steps?.live?.report?.passed, "live report passed");
const liveTotal = asNumber(report.steps?.live?.report?.total, "live report total");
const statusCheckedAt = asString(
  report.steps?.status?.report?.checkedAt,
  "status report checkedAt",
);
const envPassed = asNumber(
  report.steps?.status?.report?.productionEnv?.passed,
  "status productionEnv passed",
);
const envTotal = asNumber(
  report.steps?.status?.report?.productionEnv?.total,
  "status productionEnv total",
);

const agentReadyAudit = await readFile(agentReadyAuditPath, "utf8");
const completionAudit = await readFile(completionAuditPath, "utf8");

const agentReadyLiveLine = `Latest JSON live check: \`${liveCheckedAt}\`, \`${livePassed}/${liveTotal}\` checks passing.`;
const completionStatusLine = `Latest agent-ready status check: \`${statusCheckedAt}\`, \`${envPassed}/${envTotal}\` production env values loaded,`;
const completionLiveLine = `Latest agent-ready live check: \`${liveCheckedAt}\`, \`${livePassed}/${liveTotal}\` checks passing because`;

if (checkOnly) {
  assertSynced(agentReadyAudit, agentReadyLiveLine, agentReadyAuditPath);
  assertSynced(completionAudit, completionStatusLine, `${completionAuditPath} status line`);
  assertSynced(completionAudit, completionLiveLine, `${completionAuditPath} live line`);
  await assertStandaloneLiveReportSynced();
  console.log(
    `Agent-ready audit evidence is synced with ${reportPath}: live ${livePassed}/${liveTotal}, env ${envPassed}/${envTotal}; ${liveReportPath} matches the embedded live report.`,
  );
  process.exit(0);
}

await writeFile(
  agentReadyAuditPath,
  replaceOnce(
    agentReadyAudit,
    /Latest JSON live check: `[^`]+`, `\d+\/\d+` checks passing\./,
    agentReadyLiveLine,
    agentReadyAuditPath,
  ),
);

let nextCompletionAudit = replaceOnce(
  completionAudit,
  /Latest agent-ready status check: `[^`]+`, `\d+\/\d+` production env values loaded,/,
  completionStatusLine,
  `${completionAuditPath} status line`,
);
nextCompletionAudit = replaceOnce(
  nextCompletionAudit,
  /Latest agent-ready live check: `[^`]+`, `\d+\/\d+` checks passing because/,
  completionLiveLine,
  `${completionAuditPath} live line`,
);

await writeFile(completionAuditPath, nextCompletionAudit);

console.log(
  `Synced agent-ready audit evidence from ${reportPath}: live ${livePassed}/${liveTotal}, env ${envPassed}/${envTotal}.`,
);
