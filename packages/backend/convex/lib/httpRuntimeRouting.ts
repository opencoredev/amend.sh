import { record } from "./httpRuntimeScalars";

type RestRoute = {
  resource: string;
  workspaceSlug: string;
};

export function restRoute(request: Request): RestRoute | null {
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "api" || parts[1] !== "v1" || !parts[2] || !parts[3]) {
    return null;
  }
  return {
    workspaceSlug: decodeURIComponent(parts[2]),
    resource: parts[3],
  };
}

export function readBody(rawBody: string): Record<string, unknown> {
  try {
    const payload = JSON.parse(rawBody);
    return record(payload) ?? {};
  } catch {
    return {};
  }
}

export function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
    status,
  });
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-GitHub-Event, X-Hub-Signature-256",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Origin": "*",
  };
}
