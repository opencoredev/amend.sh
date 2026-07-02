import {
  getGitHubInstallContextHandler,
  joinSeededDemoWorkspaceHandler,
  listGitHubAppRepositoriesHandler,
  seedDemoDataHandler,
} from "./amendDevAndGithubHandlers";
import { joinSeededDemoWorkspaceArgs, workspaceOnlyArgs } from "./amendFunctionArgs";

export const getGitHubInstallContextDefinition = {
  args: workspaceOnlyArgs,
  handler: getGitHubInstallContextHandler,
};

export const listGitHubAppRepositoriesDefinition = {
  args: workspaceOnlyArgs,
  handler: listGitHubAppRepositoriesHandler,
};

export const seedDemoDataDefinition = {
  args: workspaceOnlyArgs,
  handler: seedDemoDataHandler,
};

export const joinSeededDemoWorkspaceDefinition = {
  args: joinSeededDemoWorkspaceArgs,
  handler: joinSeededDemoWorkspaceHandler,
};
