import { resolve4, resolve6, resolveCname, resolveNs } from "node:dns/promises";
import type { AddCheck } from "./agent-ready-live-types";

export async function checkDns({
  add,
  blockers,
  label,
  origin,
}: {
  add: AddCheck;
  blockers: Set<string>;
  label: string;
  origin: string;
}) {
  const host = hostFromOrigin(origin);
  const apex = apexDomain(host);
  const domainRegistered = await registered(host);
  add(`${label} apex is registered`, domainRegistered, apex);
  if (!domainRegistered) {
    blockers.add(`Register ${apex}.`);
  }
  const nameservers = await delegated(host);
  add(
    `${label} apex is delegated`,
    nameservers.length > 0,
    nameservers.length > 0 ? nameservers.join(", ") : apex,
  );
  if (nameservers.length === 0) {
    blockers.add(`Delegate ${apex} with a DNS provider.`);
  }
  const records = await resolves(host);
  add(`${label} DNS resolves`, records.length > 0, records.join(", ") || host);
  if (records.length === 0) {
    blockers.add(`Create A/AAAA or CNAME records for ${host} pointing at the ${label} deployment.`);
  }
  return records.length > 0;
}

function hostFromOrigin(origin: string) {
  return new URL(origin).hostname;
}

function apexDomain(host: string) {
  const parts = host.split(".");
  return parts.length <= 2 ? host : parts.slice(-2).join(".");
}

async function delegated(host: string) {
  try {
    return await resolveNs(apexDomain(host));
  } catch {
    return [];
  }
}

async function registered(host: string) {
  const apex = apexDomain(host);
  try {
    const response = await fetch(`https://rdap.org/domain/${apex}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function resolves(host: string) {
  const [a, aaaa, cname] = await Promise.allSettled([
    resolve4(host),
    resolve6(host),
    resolveCname(host),
  ]);
  return [
    ...(a.status === "fulfilled" ? a.value : []),
    ...(aaaa.status === "fulfilled" ? aaaa.value : []),
    ...(cname.status === "fulfilled" ? cname.value.map((target) => `CNAME ${target}`) : []),
  ];
}
