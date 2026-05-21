import { writeFile } from "node:fs/promises";
import { resolve4, resolve6, resolveCname, resolveNs } from "node:dns/promises";
import { requiredProductionEnv } from "./agent-ready-production-env";

const webOrigin = process.env.AMEND_WEB_ORIGIN ?? "https://amend.sh";
const docsOrigin = process.env.AMEND_DOCS_ORIGIN ?? "https://docs.amend.sh";
const reportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json";
const jsonOutput = process.argv.includes("--json");
const jsonFileFlagIndex = process.argv.indexOf("--json-file");
const jsonFile = jsonFileFlagIndex >= 0 ? process.argv[jsonFileFlagIndex + 1] : undefined;

if (jsonFileFlagIndex >= 0 && !jsonFile) {
  throw new Error("Missing path after --json-file.");
}

function hasMeaningfulEnv(key: string) {
  const value = process.env[key]?.trim();
  return Boolean(value && !/replace-with|example\.com|your-|placeholder/i.test(value));
}

function hostFromOrigin(origin: string) {
  return new URL(origin).hostname;
}

function apexDomain(host: string) {
  const parts = host.split(".");
  return parts.length <= 2 ? host : parts.slice(-2).join(".");
}

async function registered(host: string) {
  try {
    const response = await fetch(`https://rdap.org/domain/${apexDomain(host)}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function delegated(host: string) {
  try {
    return await resolveNs(apexDomain(host));
  } catch {
    return [];
  }
}

async function records(host: string) {
  const [a, aaaa, cname] = await Promise.allSettled([
    resolve4(host),
    resolve6(host),
    resolveCname(host),
  ]);

  return [
    ...(a.status === "fulfilled" ? a.value.map((value) => `A ${value}`) : []),
    ...(aaaa.status === "fulfilled" ? aaaa.value.map((value) => `AAAA ${value}`) : []),
    ...(cname.status === "fulfilled" ? cname.value.map((value) => `CNAME ${value}`) : []),
  ];
}

async function dnsStatus(origin: string) {
  const host = hostFromOrigin(origin);
  const nameservers = await delegated(host);
  const resolvedRecords = await records(host);

  return {
    delegated: nameservers.length > 0,
    host,
    records: resolvedRecords,
    registered: await registered(host),
  };
}

function addDnsBlockers(
  blockers: Set<string>,
  status: Awaited<ReturnType<typeof dnsStatus>>,
  label: "docs" | "web",
) {
  const apex = apexDomain(status.host);

  if (!status.registered) {
    blockers.add(`Register ${apex}.`);
  }

  if (!status.delegated) {
    blockers.add(`Delegate ${apex} with a DNS provider.`);
  }

  if (status.records.length === 0) {
    blockers.add(
      `Create A/AAAA or CNAME records for ${status.host} pointing at the ${label} deployment.`,
    );
  }
}

const missingEnv = requiredProductionEnv.filter((key) => !hasMeaningfulEnv(key));
const [webDns, docsDns] = await Promise.all([dnsStatus(webOrigin), dnsStatus(docsOrigin)]);
const blockers = new Set<string>();

if (missingEnv.length > 0) {
  blockers.add(`Load ${missingEnv.length} missing production environment values.`);
}

addDnsBlockers(blockers, webDns, "web");
addDnsBlockers(blockers, docsDns, "docs");

const dnsReady =
  webDns.registered &&
  webDns.delegated &&
  webDns.records.length > 0 &&
  docsDns.registered &&
  docsDns.delegated &&
  docsDns.records.length > 0;
const nextGates = ["bun run agent-ready:production", "bun run agent-ready:final-gate"];
const report = {
  $schema: reportSchemaUrl,
  blockers: Array.from(blockers),
  checkedAt: new Date().toISOString(),
  dns: {
    docs: docsDns,
    web: webDns,
  },
  nextGates,
  ok: missingEnv.length === 0 && dnsReady,
  origins: {
    docs: docsOrigin,
    web: webOrigin,
  },
  productionEnv: {
    missing: missingEnv,
    passed: requiredProductionEnv.length - missingEnv.length,
    total: requiredProductionEnv.length,
  },
};

if (jsonFile) {
  await writeFile(jsonFile, `${JSON.stringify(report, null, 2)}\n`);
}

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Agent-ready status");
  console.log(
    `production env: ${requiredProductionEnv.length - missingEnv.length}/${requiredProductionEnv.length}`,
  );
  if (missingEnv.length > 0) {
    console.log(`missing env: ${missingEnv.join(", ")}`);
  }

  for (const status of [webDns, docsDns]) {
    console.log(
      `${status.host}: registered=${status.registered ? "yes" : "no"} delegated=${
        status.delegated ? "yes" : "no"
      } records=${status.records.length > 0 ? status.records.join(", ") : "none"}`,
    );
  }

  if (blockers.size > 0) {
    console.log("");
    console.log("Blockers:");
    for (const blocker of blockers) {
      console.log(`- ${blocker}`);
    }
  }

  if (missingEnv.length > 0 || !dnsReady) {
    console.log("");
    console.log("Next required gates: load production env, register/delegate DNS, then run:");
    for (const gate of nextGates) {
      console.log(gate);
    }
  }
}

if (!report.ok) {
  process.exitCode = 1;
}
