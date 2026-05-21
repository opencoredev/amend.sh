import { source } from "@/lib/source";
import { llms } from "fumadocs-core/source";

export const revalidate = false;

export function GET() {
  const body = `${llms(source).index().trim()}

## Machine-readable contracts

- [Agent-ready production report JSON Schema](/schemas/agent-ready-production-report.schema.json)
- [Agent-ready live report JSON Schema](/schemas/agent-ready-live-report.schema.json)
- [Agent-ready status report JSON Schema](/schemas/agent-ready-status-report.schema.json)
- [Agent-ready completion audit report JSON Schema](/schemas/agent-ready-completion-audit-report.schema.json)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
