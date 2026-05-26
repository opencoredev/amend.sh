import { loadBuiltDocsArtifacts } from "./agent-ready-built-docs-artifacts";
import { checkBuiltDocsCoreArtifacts } from "./agent-ready-built-docs-core-checks";
import { checkBuiltDocsPageArtifacts } from "./agent-ready-built-docs-page-checks";
import { checkBuiltDocsSchemaArtifacts } from "./agent-ready-built-docs-schema-checks";

export async function checkBuiltDocsArtifacts(webLlmsLinks: string[]) {
  const artifacts = await loadBuiltDocsArtifacts();
  const { docsLlmsLinks, docsSitemapLocs } = checkBuiltDocsCoreArtifacts(artifacts);

  checkBuiltDocsSchemaArtifacts(artifacts);
  await checkBuiltDocsPageArtifacts({
    artifacts,
    docsLlmsLinks,
    docsSitemapLocs,
    webLlmsLinks,
  });
}
