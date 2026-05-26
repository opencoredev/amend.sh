export type Check = {
  detail?: string;
  name: string;
  ok: boolean;
};

export type AddCheck = (name: string, ok: boolean, detail?: string) => void;

export type TextEndpointOptions = {
  allowIndexing?: boolean;
  contentTypes?: string[];
  excludes?: string[];
  includes: string[];
  label: string;
  origin: string;
  parseJsonObject?: boolean;
  path: string;
  structuredDataTypes?: string[];
};
