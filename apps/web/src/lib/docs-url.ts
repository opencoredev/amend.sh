const DEFAULT_DEV_DOCS_URL = "http://docs.amend.localhost:1355/docs";
const DEFAULT_PRODUCTION_DOCS_URL = "https://amend.sh/docs";

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

export function docsUrl(path = "") {
  const configuredUrl = import.meta.env.VITE_DOCS_URL?.trim();
  const baseUrl =
    configuredUrl || (import.meta.env.DEV ? DEFAULT_DEV_DOCS_URL : DEFAULT_PRODUCTION_DOCS_URL);
  const normalizedPath = trimSlashes(path);

  if (!normalizedPath) {
    return baseUrl;
  }

  return `${baseUrl.replace(/\/+$/g, "")}/${normalizedPath}`;
}
