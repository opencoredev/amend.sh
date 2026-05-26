export type SourceSizeItem = { lines: number; path: string };
export type AssetSizeItem = { bytes: number; path: string };

export type AllowedLargeFile =
  | { bytes: number; kind: "asset"; path: string; reason: string }
  | { kind: "text"; lines: number; path: string; reason: string };

export type SourceSizeAuditOptions = {
  allowedLargeFiles?: Map<string, string>;
  argv?: string[];
  ignoredDirectoryParts?: Set<string>;
  ignoredExtensions?: Set<string>;
  ignoredFileNames?: Set<string>;
  listProjectFiles?: () => string[] | Promise<string[]>;
  maxAssetBytes?: number;
  maxLines?: number;
  root?: string;
};

export type SourceSizeAuditResult = {
  allowed: AllowedLargeFile[];
  authored: SourceSizeItem[];
  maxAssetBytes: number;
  maxLines: number;
  oversized: SourceSizeItem[];
  oversizedAssets: AssetSizeItem[];
  reportLimit: number;
};
