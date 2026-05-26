import { checkBuiltDocsArtifacts } from "./agent-ready-built-docs";
import { checkBuiltWebArtifacts } from "./agent-ready-built-web";
import { finishBuiltChecks } from "./agent-ready-built-utils";

const { webLlmsLinks } = await checkBuiltWebArtifacts();
await checkBuiltDocsArtifacts(webLlmsLinks);
finishBuiltChecks();
