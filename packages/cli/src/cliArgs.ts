import { parseScopeList, unique } from "./cliRuntime";

export type ParsedArgs = {
  args: string[];
  author?: string;
  endpoint?: string;
  externalId?: string;
  file?: string;
  format: "json" | "text";
  kind?: string;
  labels?: string[];
  limit?: number;
  number?: number;
  owner?: string;
  plain: boolean;
  project?: string;
  projectSlug?: string;
  provider?: string;
  query?: string;
  readScopes?: string[];
  repo?: string;
  server: boolean;
  status?: string;
  state?: string;
  title?: string;
  token?: string;
  updateCheck: boolean;
  useDemo: boolean;
  url?: string;
  writeScopes?: string[];
};

export function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    args: [],
    format: "json",
    plain: false,
    server: false,
    updateCheck: false,
    useDemo: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const next = argv[index + 1];
    if (!value) {
      continue;
    }
    if (value === "--demo") {
      parsed.useDemo = true;
    } else if (value === "--check" || value === "--check-updates") {
      parsed.updateCheck = true;
    } else if (value === "--server") {
      parsed.server = true;
    } else if (value === "--plain") {
      parsed.plain = true;
    } else if (value === "--text") {
      parsed.format = "text";
    } else if (value === "--json") {
      parsed.format = "json";
    } else if (value === "--endpoint" && next) {
      parsed.endpoint = next;
      index += 1;
    } else if (value === "--file" && next) {
      parsed.file = next;
      index += 1;
    } else if (value === "--external-id" && next) {
      parsed.externalId = next;
      index += 1;
    } else if (value === "--provider" && next) {
      parsed.provider = next;
      index += 1;
    } else if (value === "--kind" && next) {
      parsed.kind = next;
      index += 1;
    } else if (value === "--url" && next) {
      parsed.url = next;
      index += 1;
    } else if (value === "--state" && next) {
      parsed.state = next;
      index += 1;
    } else if (value === "--labels" && next) {
      parsed.labels = next
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      index += 1;
    } else if (value === "--author" && next) {
      parsed.author = next;
      index += 1;
    } else if (value === "--owner" && next) {
      parsed.owner = next;
      index += 1;
    } else if (value === "--repo" && next) {
      parsed.repo = next;
      index += 1;
    } else if (value === "--number" && next) {
      parsed.number = Number.parseInt(next, 10);
      index += 1;
    } else if ((value === "--project" || value === "--workspace") && next) {
      parsed.project = next;
      index += 1;
    } else if (value === "--project-slug" && next) {
      parsed.projectSlug = next;
      index += 1;
    } else if (value === "--token" && next) {
      parsed.token = next;
      index += 1;
    } else if (value === "--query" && next) {
      parsed.query = next;
      index += 1;
    } else if ((value === "--read-scope" || value === "--read-scopes") && next) {
      parsed.readScopes = unique([...(parsed.readScopes ?? []), ...parseScopeList(next)]);
      index += 1;
    } else if ((value === "--write-scope" || value === "--write-scopes") && next) {
      parsed.writeScopes = unique([...(parsed.writeScopes ?? []), ...parseScopeList(next)]);
      index += 1;
    } else if (value === "--status" && next) {
      parsed.status = next;
      index += 1;
    } else if (value === "--title" && next) {
      parsed.title = next;
      index += 1;
    } else if (value === "--limit" && next) {
      parsed.limit = Number.parseInt(next, 10);
      index += 1;
    } else {
      parsed.args.push(value);
    }
  }
  return parsed;
}
