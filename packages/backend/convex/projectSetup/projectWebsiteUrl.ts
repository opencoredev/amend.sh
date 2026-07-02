import { ConvexError } from "convex/values";

export function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new ConvexError({
      code: "INVALID_WEBSITE",
      message: "Enter a website URL first.",
    });
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!isVerifiableHost(url.hostname)) {
      throw new Error("Host is not a complete domain.");
    }
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new ConvexError({
      code: "INVALID_WEBSITE",
      message: "Use a valid website URL.",
    });
  }
}

export function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "project";
}

function isVerifiableHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === "localhost") return true;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true;
  if (host.includes("..") || !host.includes(".")) return false;
  const labels = host.split(".");
  const tld = labels[labels.length - 1] ?? "";
  return labels.every((label) => /^[a-z0-9-]+$/.test(label) && label.length > 0) && tld.length >= 2;
}
