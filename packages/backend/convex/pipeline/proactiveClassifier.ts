import type { Doc } from "../_generated/dataModel";

type SourceChannel = Doc<"evidence">["sourceChannel"];

type SignalClassification = {
  area: string;
  verb: string;
  polarity: "positive" | "negative" | "neutral";
  platform: SourceChannel;
  clusterKey: string;
  confidenceBucket: Doc<"evidence">["confidenceBucket"];
};

const AREA_KEYWORDS: Array<[string, string[]]> = [
  ["export", ["export", "csv", "download", "xlsx", "spreadsheet"]],
  ["import", ["import", "upload", "csv import", "migrate", "migration"]],
  ["notification", ["notify", "notification", "email", "digest", "alert"]],
  ["roadmap", ["roadmap", "status", "planned", "vote"]],
  ["changelog", ["changelog", "release note", "announcement", "publish"]],
  ["integration", ["github", "slack", "discord", "linear", "webhook"]],
  ["auth", ["login", "sign in", "signup", "auth", "password"]],
  ["billing", ["billing", "price", "pricing", "plan", "paid"]],
];

const VERB_KEYWORDS: Array<[string, string[]]> = [
  ["create", ["create", "add", "new", "submit"]],
  ["read", ["view", "see", "show", "list", "find"]],
  ["update", ["edit", "update", "change", "move", "rename"]],
  ["delete", ["delete", "remove", "archive", "hide"]],
  ["connect", ["connect", "sync", "integrate", "webhook"]],
  ["send", ["send", "notify", "email", "digest", "alert"]],
  ["export", ["export", "download"]],
  ["import", ["import", "upload", "migrate"]],
];

const NOISE_TERMS = ["pricing", "too expensive", "random", "spam", "test", "asdf"];
const NEGATIVE_TERMS = ["can't", "cannot", "broken", "bad", "bug", "hate", "missing", "need", "should"];
const POSITIVE_TERMS = ["love", "great", "works", "thanks", "nice"];

export function classifySignal(input: {
  channel: SourceChannel;
  labels?: string[];
  text: string;
  title?: string;
}): SignalClassification & { isNoise: boolean } {
  const text = normalize(`${input.title ?? ""}\n${input.text}\n${input.labels?.join(" ") ?? ""}`);
  const verb = pickKeyword(text, VERB_KEYWORDS) ?? "request";
  const verbArea = verb === "export" || verb === "import" ? verb : undefined;
  const area = verbArea ?? pickKeyword(text, AREA_KEYWORDS) ?? slugToken(text) ?? "general";
  const polarity = NEGATIVE_TERMS.some((term) => text.includes(term))
    ? "negative"
    : POSITIVE_TERMS.some((term) => text.includes(term))
      ? "positive"
      : "neutral";
  const clusterKey = `${area}:${verb}:${input.channel}`;
  const confidenceBucket = text.length > 80 ? "clear" : text.length > 30 ? "worth-a-look" : "unsure";
  const isNoise = NOISE_TERMS.some((term) => text === term || text.includes(`just ${term}`));
  return { area, verb, polarity, platform: input.channel, clusterKey, confidenceBucket, isNoise };
}

export function facetsCompatible(
  a: Pick<SignalClassification, "area" | "verb" | "platform">,
  b: Pick<SignalClassification, "area" | "verb" | "platform">,
) {
  if (a.area !== b.area) return false;
  if (hardFacetMismatch(a.verb, b.verb)) return false;
  // Same area and compatible verb can merge across source platforms; platform is retained in proof.sources.
  return true;
}

export function strengthForProof(people: number, payingPeople: number) {
  if (payingPeople >= 2 || people >= 6) return "strong" as const;
  if (payingPeople >= 1 || people >= 3) return "building" as const;
  return "thin" as const;
}

export function channelFromProvider(provider: string | undefined): SourceChannel {
  if (provider === "github") return "github";
  if (provider === "discord") return "discord";
  if (provider === "slack") return "slack";
  if (provider === "email") return "email";
  if (provider === "x") return "x";
  if (provider === "telegram") return "telegram";
  if (provider === "support") return "support";
  return "embed";
}

function hardFacetMismatch(a: string, b: string) {
  return (a === "export" && b === "import") || (a === "import" && b === "export");
}

function pickKeyword(text: string, entries: Array<[string, string[]]>) {
  return entries.find(([, terms]) => terms.some((term) => text.includes(term)))?.[0];
}

function slugToken(text: string) {
  return text
    .split(/\s+/)
    .find((word) => word.length > 4 && !["would", "should", "could", "there", "their", "about"].includes(word));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
