import type { Doc, Id } from "./_generated/dataModel";

export type CreateProjectArgs = {
  workspaceSlug?: string;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  sourceMode?: Doc<"projects">["sourceMode"];
  visibility?: Doc<"projects">["visibility"];
  websiteUrl?: string;
};

export type ConnectProjectRepositoryArgs = {
  workspaceSlug?: string;
  projectKey: string;
  owner: string;
  repo: string;
  defaultBranch?: string;
  repositoryUrl?: string;
};

export type MarkProjectFeedbackSourceArgs = {
  workspaceSlug?: string;
  projectKey: string;
};

export type UpdateProjectArgs = {
  workspaceSlug?: string;
  projectKey: string;
  name: string;
  description?: string;
  logoUrl?: string;
  logoStorageId?: Id<"_storage">;
  websiteUrl?: string;
  visibility?: Doc<"projects">["visibility"];
};

export type GenerateProjectLogoUploadUrlArgs = {
  workspaceSlug?: string;
  projectKey: string;
};
