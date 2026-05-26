import { writeFile } from "node:fs/promises";
import { checkDns, type Check } from "./agent-ready-live-checks";
import {
  checkLiveDocsSurface,
  checkLiveWebAndDocsLinks,
  checkLiveWebSurface,
} from "./agent-ready-live-surfaces";

const webOrigin = process.env.AMEND_WEB_ORIGIN ?? "https://amend.sh";
const docsOrigin = process.env.AMEND_DOCS_ORIGIN ?? "https://docs.amend.sh";
const reportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json";
const jsonOutput = process.argv.includes("--json");
const jsonFileFlagIndex = process.argv.indexOf("--json-file");
const jsonFile = jsonFileFlagIndex >= 0 ? process.argv[jsonFileFlagIndex + 1] : undefined;
const checks: Check[] = [];
const blockers = new Set<string>();

if (jsonFileFlagIndex >= 0 && !jsonFile) {
  throw new Error("Missing path after --json-file.");
}

function add(name: string, ok: boolean, detail?: string) {
  checks.push({ detail, name, ok });
  if (!jsonOutput) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
  }
}

async function main() {
  const webDns = await checkDns({ add, blockers, label: "web", origin: webOrigin });
  const docsDns = await checkDns({ add, blockers, label: "docs", origin: docsOrigin });

  if (webDns) {
    await checkLiveWebSurface({ add, docsOrigin, webOrigin });
  }
  if (docsDns) {
    await checkLiveDocsSurface({ add, docsOrigin, webOrigin });
  }
  if (webDns && docsDns) {
    await checkLiveWebAndDocsLinks({ add, docsOrigin, webOrigin });
  }

  const failed = checks.filter((check) => !check.ok);
  const report = {
    $schema: reportSchemaUrl,
    blockers: Array.from(blockers),
    checkedAt: new Date().toISOString(),
    checks,
    origins: {
      docs: docsOrigin,
      web: webOrigin,
    },
    ok: failed.length === 0,
    passed: checks.length - failed.length,
    total: checks.length,
  };

  const jsonReport = JSON.stringify(report, null, 2);
  if (jsonFile) {
    await writeFile(jsonFile, `${jsonReport}\n`);
  }
  if (jsonOutput) {
    console.log(jsonReport);
  } else {
    console.log("");
    console.log(`Agent-ready live summary: ${report.passed}/${report.total} passing.`);
    if (blockers.size > 0) {
      console.log("");
      console.log("Next external steps:");
      for (const blocker of blockers) {
        console.log(`- ${blocker}`);
      }
      console.log("- Redeploy web/docs if needed, then rerun `bun run agent-ready:live`.");
    }
  }
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

await main();
