import { execFileSync } from "node:child_process";

import { collectRepoHygieneIssues } from "./repo-hygiene-core";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const issues = collectRepoHygieneIssues(trackedFiles);

if (issues.length === 0) {
  console.log("PASS repo hygiene: no generated cache or local evidence artifacts are tracked.");
  process.exit(0);
}

console.error(`FAIL repo hygiene: ${issues.length} generated/cache artifact(s) are tracked.`);
for (const issue of issues) {
  console.error(`- ${issue.path}: ${issue.reason}`);
}
process.exit(1);
