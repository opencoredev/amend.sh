export type ProjectSuggestion = {
  description?: string;
  logoUrl?: string;
  name: string;
  slug: string;
  websiteUrl: string;
};

export type WebsiteLookupStatus = "idle" | "checking" | "valid" | "invalid";

export type CreatedProject = {
  slug: string;
  workspaceSlug?: string;
};

export type RepositoryDraft = {
  owner: string;
  repo: string;
  repositoryUrl: string;
};

export type GitHubInstalledRepository = {
  defaultBranch?: string;
  description?: string;
  fullName: string;
  htmlUrl: string;
  id: number;
  owner: string;
  private: boolean;
  repo: string;
  updatedAt?: string;
};

export type GitHubInstallationAccount = {
  avatarUrl?: string;
  id: number;
  login: string;
  repositories: GitHubInstalledRepository[];
  type: string;
};

export type GitHubInstallationDirectory = {
  accounts: GitHubInstallationAccount[];
  configured: boolean;
  error?: string;
  installUrl?: string;
  missing?: string[];
  workspaceSlug?: string;
};
