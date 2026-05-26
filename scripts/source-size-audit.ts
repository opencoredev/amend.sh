import { collectSourceSizeAudit } from "./source-size-audit-core";
import { renderSourceSizeAudit } from "./source-size-audit-render";

const audit = renderSourceSizeAudit(await collectSourceSizeAudit({ argv: process.argv.slice(2) }));

for (const message of audit.stdout) {
  console.log(message);
}

for (const message of audit.stderr) {
  console.error(message);
}

if (!audit.ok) {
  process.exit(1);
}
