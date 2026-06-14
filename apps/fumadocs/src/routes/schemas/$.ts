import { createFileRoute } from "@tanstack/react-router";

import completionAuditReport from "@/data/schemas/agent-ready-completion-audit-report.schema.json";
import liveReport from "@/data/schemas/agent-ready-live-report.schema.json";
import productionReport from "@/data/schemas/agent-ready-production-report.schema.json";
import statusReport from "@/data/schemas/agent-ready-status-report.schema.json";

const schemas: Record<string, unknown> = {
  "agent-ready-completion-audit-report.schema.json": completionAuditReport,
  "agent-ready-live-report.schema.json": liveReport,
  "agent-ready-production-report.schema.json": productionReport,
  "agent-ready-status-report.schema.json": statusReport,
};

export const Route = createFileRoute("/schemas/$")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const schema = schemas[params._splat ?? ""];
        if (!schema) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(JSON.stringify(schema, null, 2), {
          headers: { "Content-Type": "application/schema+json; charset=utf-8" },
        });
      },
    },
  },
});
