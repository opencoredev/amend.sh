import { writeFile } from "node:fs/promises";

type CommandResult = {
  exitCode: number;
  stderr: string;
  stdout: string;
};

type StepReport = {
  exitCode: number;
  ok: boolean;
  summary?: Record<string, number>;
};

type JsonStepReport = StepReport & {
  report?: unknown;
};

const jsonOutput = process.argv.includes("--json");
const jsonFileFlagIndex = process.argv.indexOf("--json-file");
const jsonFile = jsonFileFlagIndex >= 0 ? process.argv[jsonFileFlagIndex + 1] : undefined;
const reportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json";

if (jsonFileFlagIndex >= 0 && !jsonFile) {
  throw new Error("Missing path after --json-file.");
}

async function runCommand(args: string[]): Promise<CommandResult> {
  const child = Bun.spawn(args, {
    stderr: "pipe",
    stdout: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);

  return {
    exitCode,
    stderr,
    stdout,
  };
}

function parseJson(stdout: string) {
  try {
    return JSON.parse(stdout) as unknown;
  } catch {
    return undefined;
  }
}

function parseReadinessSummary(stdout: string) {
  const match = stdout.match(/Readiness summary: (\d+)\/(\d+) checks passing\./);
  if (!match) {
    return undefined;
  }

  return {
    passed: Number(match[1]),
    total: Number(match[2]),
  };
}

function parseBuiltSummary(stdout: string) {
  const match = stdout.match(/Agent-ready built summary: (\d+)\/(\d+) passing\./);
  if (!match) {
    return undefined;
  }

  return {
    passed: Number(match[1]),
    total: Number(match[2]),
  };
}

function blockersFrom(report: unknown) {
  if (
    report &&
    typeof report === "object" &&
    "blockers" in report &&
    Array.isArray(report.blockers)
  ) {
    return report.blockers.filter((blocker): blocker is string => typeof blocker === "string");
  }

  return [];
}

const [readiness, built, status, live] = await Promise.all([
  runCommand(["bun", "scripts/readiness.ts", "--strict"]),
  runCommand(["bun", "scripts/agent-ready-built.ts"]),
  runCommand(["bun", "scripts/agent-ready-status.ts", "--json"]),
  runCommand(["bun", "scripts/agent-ready-live.ts", "--json"]),
]);

const statusReport = parseJson(status.stdout);
const liveReport = parseJson(live.stdout);
const blockers = new Set<string>([...blockersFrom(statusReport), ...blockersFrom(liveReport)]);

if (readiness.exitCode !== 0) {
  blockers.add("Pass strict readiness with production environment values loaded.");
}

if (built.exitCode !== 0) {
  blockers.add("Build the web and docs apps, then pass built artifact validation.");
}

if (live.exitCode !== 0) {
  blockers.add("Pass the live agent-ready validator against amend.sh and docs.amend.sh.");
}

const steps: {
  built: StepReport;
  live: JsonStepReport;
  readinessStrict: StepReport;
  status: JsonStepReport;
} = {
  built: {
    exitCode: built.exitCode,
    ok: built.exitCode === 0,
    summary: parseBuiltSummary(built.stdout),
  },
  live: {
    exitCode: live.exitCode,
    ok: live.exitCode === 0,
    report: liveReport,
  },
  readinessStrict: {
    exitCode: readiness.exitCode,
    ok: readiness.exitCode === 0,
    summary: parseReadinessSummary(readiness.stdout),
  },
  status: {
    exitCode: status.exitCode,
    ok: status.exitCode === 0,
    report: statusReport,
  },
};

const report = {
  $schema: reportSchemaUrl,
  blockers: Array.from(blockers),
  checkedAt: new Date().toISOString(),
  ok: Object.values(steps).every((step) => step.ok),
  steps,
};

if (jsonFile) {
  await writeFile(jsonFile, `${JSON.stringify(report, null, 2)}\n`);
}

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Agent-ready production report");
  for (const [name, step] of Object.entries(steps)) {
    const summary = step.summary ? ` - ${step.summary.passed}/${step.summary.total}` : "";
    console.log(`${step.ok ? "PASS" : "FAIL"} ${name}${summary}`);
  }

  if (blockers.size > 0) {
    console.log("");
    console.log("Blockers:");
    for (const blocker of blockers) {
      console.log(`- ${blocker}`);
    }
  }
}

if (!report.ok) {
  process.exitCode = 1;
}
