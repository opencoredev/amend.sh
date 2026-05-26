import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readSourceEventsFile(path: string) {
  const content = readFileSync(path, "utf8");
  if (path.toLowerCase().endsWith(".csv")) {
    return parseSourceEventsCsv(content);
  }
  return JSON.parse(content) as unknown;
}

export function resolveInputPath(cwd: string, path: string) {
  return path.startsWith("/") ? path : join(cwd, path);
}

function parseSourceEventsCsv(content: string) {
  const [headers = [], ...rows] = parseCsvRows(content);
  const keys = headers.map((header) => csvHeaderKey(header));
  return rows
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) =>
      Object.fromEntries(
        keys
          .map((key, index) => [key, row[index]?.trim() ?? ""])
          .filter(([key, value]) => key && value),
      ),
    );
}

function parseCsvRows(content: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  const source = content.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function csvHeaderKey(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  const aliases: Record<string, string> = {
    created_at: "createdAt",
    external_id: "externalId",
    issue_number: "issueNumber",
    observed_at: "observedAt",
    pr_number: "prNumber",
    project_key: "projectKey",
    project_slug: "projectSlug",
    source_created_at: "sourceCreatedAt",
    source_id: "sourceId",
    source_url: "sourceUrl",
    source_updated_at: "sourceUpdatedAt",
    submitted_by: "submittedBy",
    updated_at: "updatedAt",
  };
  return aliases[normalized] ?? normalized;
}
