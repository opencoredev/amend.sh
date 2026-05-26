import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { readFile, stat } from "node:fs/promises";

import {
  assetExtensions,
  defaultAllowedLargeFiles,
  defaultIgnoredDirectoryParts,
  defaultIgnoredExtensions,
  defaultIgnoredFileNames,
  defaultMaxAssetBytes,
  defaultMaxLines,
  parseReportLimit,
} from "./source-size-audit-config";
import type {
  AllowedLargeFile,
  AssetSizeItem,
  SourceSizeAuditOptions,
  SourceSizeAuditResult,
  SourceSizeItem,
} from "./source-size-audit-types";

export async function collectSourceSizeAudit(options: SourceSizeAuditOptions = {}) {
  const root = options.root ?? process.cwd();
  const maxLines = options.maxLines ?? defaultMaxLines;
  const maxAssetBytes = options.maxAssetBytes ?? defaultMaxAssetBytes;
  const allowedLargeFiles = options.allowedLargeFiles ?? defaultAllowedLargeFiles;
  const ignoredDirectoryParts = options.ignoredDirectoryParts ?? defaultIgnoredDirectoryParts;
  const ignoredExtensions = options.ignoredExtensions ?? defaultIgnoredExtensions;
  const ignoredFileNames = options.ignoredFileNames ?? defaultIgnoredFileNames;
  const reportLimit = parseReportLimit(options.argv ?? []);

  const authored: SourceSizeItem[] = [];
  const oversized: SourceSizeItem[] = [];
  const oversizedAssets: AssetSizeItem[] = [];
  const allowed: AllowedLargeFile[] = [];

  for (const path of await listProjectFiles(options.listProjectFiles)) {
    if (shouldIgnoreProjectFile(path, { ignoredDirectoryParts, ignoredFileNames })) continue;

    const explicitReason = allowedLargeFiles.get(path);
    if (ignoredExtensions.has(extension(path))) {
      if (isAssetPath(path)) {
        const bytes = await fileByteSize(root, path);
        if (bytes === null) continue;
        if (bytes > maxAssetBytes && !explicitReason) {
          oversizedAssets.push({ bytes, path });
          continue;
        }
        if (explicitReason) {
          allowed.push({ bytes, kind: "asset", path, reason: explicitReason });
        }
      }
      continue;
    }

    const content = await readTextFile(root, path);
    if (content === null) continue;
    const lines = countLines(content);
    const generatedSource = isGeneratedSource(path, content);

    if (!explicitReason && !generatedSource) {
      authored.push({ lines, path });
    }

    if (lines <= maxLines) continue;

    if (explicitReason || generatedSource) {
      allowed.push({
        kind: "text",
        lines,
        path,
        reason: explicitReason ?? "generated source",
      });
      continue;
    }

    oversized.push({ lines, path });
  }

  return sortAuditResult({
    allowed,
    authored,
    maxAssetBytes,
    maxLines,
    oversized,
    oversizedAssets,
    reportLimit,
  });
}

function listProjectFiles(customListProjectFiles?: () => string[] | Promise<string[]>) {
  if (customListProjectFiles) return customListProjectFiles();
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    {
      encoding: "utf8",
    },
  );
  return output.split("\0").filter(Boolean);
}

function extension(path: string) {
  const match = path.match(/(\.[^/.]+)$/);
  return match?.[1] ?? "";
}

function countLines(content: string) {
  if (content.length === 0) return 0;
  const lineCount = content.split(/\r\n|\r|\n/).length;
  return content.endsWith("\n") || content.endsWith("\r") ? lineCount - 1 : lineCount;
}

function shouldIgnoreProjectFile(
  path: string,
  {
    ignoredDirectoryParts,
    ignoredFileNames,
  }: {
    ignoredDirectoryParts: Set<string>;
    ignoredFileNames: Set<string>;
  },
) {
  const parts = path.split("/");
  return (
    parts.some((part) => ignoredDirectoryParts.has(part)) ||
    ignoredFileNames.has(parts.at(-1) ?? "")
  );
}

function isGeneratedSource(path: string, content: string) {
  const header = content
    .split(/\r\n|\r|\n/)
    .slice(0, 12)
    .join("\n");
  return (
    path.startsWith("packages/backend/convex/_generated/") ||
    header.includes("This file was automatically generated") ||
    header.includes("This file was auto-generated") ||
    header.includes("@generated")
  );
}

function isAssetPath(path: string) {
  return assetExtensions.has(extension(path));
}

async function fileByteSize(root: string, path: string) {
  const fileStat = await stat(join(root, path)).catch((error: unknown) => {
    if (isMissingFileError(error)) {
      return null;
    }
    throw new Error(`Could not stat ${path}: ${String(error)}`);
  });
  return fileStat?.isFile() ? fileStat.size : null;
}

async function readTextFile(root: string, path: string) {
  return readFile(join(root, path), "utf8").catch((error: unknown) => {
    if (isMissingFileError(error)) {
      return null;
    }
    throw new Error(`Could not read ${path}: ${String(error)}`);
  });
}

function isMissingFileError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function sortAuditResult(result: SourceSizeAuditResult) {
  result.allowed.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "text" ? -1 : 1;
    if (a.kind === "text" && b.kind === "text") return b.lines - a.lines;
    if (a.kind === "asset" && b.kind === "asset") return b.bytes - a.bytes;
    return a.path.localeCompare(b.path);
  });
  result.authored.sort((a, b) => b.lines - a.lines);
  result.oversized.sort((a, b) => b.lines - a.lines);
  result.oversizedAssets.sort((a, b) => b.bytes - a.bytes);
  return result;
}
