import schema from "../_data/agent-ready-live-report.schema.json";

export const revalidate = false;

export function GET() {
  return new Response(`${JSON.stringify(schema, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/schema+json; charset=utf-8",
    },
  });
}
