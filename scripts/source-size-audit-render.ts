import type { AllowedLargeFile, SourceSizeAuditResult } from "./source-size-audit-types";

export function renderSourceSizeAudit(result: SourceSizeAuditResult) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const allowedText = result.allowed.filter(
    (item): item is Extract<AllowedLargeFile, { kind: "text" }> => item.kind === "text",
  );
  const allowedAssets = result.allowed.filter(
    (item): item is Extract<AllowedLargeFile, { kind: "asset" }> => item.kind === "asset",
  );

  for (const item of allowedText) {
    stdout.push(
      `INFO source size allowed text: ${item.path} (${item.lines} lines) - ${item.reason}`,
    );
  }

  for (const item of allowedAssets) {
    stdout.push(
      `INFO source size allowed asset: ${item.path} (${formatBytes(item.bytes)}; binary/non-source asset; line counts ignored) - ${item.reason}`,
    );
  }

  if (result.reportLimit > 0) {
    const visibleAuthored = result.authored.slice(0, result.reportLimit);
    stdout.push(
      `INFO source size largest authored files: top ${visibleAuthored.length} below the ${result.maxLines}-line cap`,
    );
    for (const item of visibleAuthored) {
      stdout.push(`- ${item.path}: ${item.lines} lines`);
    }
  }

  if (result.oversized.length > 0) {
    stderr.push(
      `FAIL source size: ${result.oversized.length} file(s) exceed ${result.maxLines} lines.`,
    );
    for (const item of result.oversized) {
      stderr.push(`- ${item.path}: ${item.lines} lines`);
    }
  }

  if (result.oversizedAssets.length > 0) {
    stderr.push(
      `FAIL source size: ${result.oversizedAssets.length} asset file(s) exceed ${formatBytes(result.maxAssetBytes)}.`,
    );
    for (const item of result.oversizedAssets) {
      stderr.push(`- ${item.path}: ${formatBytes(item.bytes)}`);
    }
  }

  const ok = result.oversized.length === 0 && result.oversizedAssets.length === 0;
  if (ok) {
    stdout.push(
      `PASS source size: no oversized authored files above ${result.maxLines} lines or assets above ${formatBytes(result.maxAssetBytes)}.`,
    );
  }

  return { ok, stderr, stdout };
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.ceil(bytes / 1024)} KB`;
}
