import { checkLlmsLinksAgainstSitemaps } from "./agent-ready-live-checks";
import { checkLiveDocsSurface } from "./agent-ready-live-docs-surface";
import type { LiveSurfaceContext } from "./agent-ready-live-surface-utils";
import { checkLiveWebSurface } from "./agent-ready-live-web-surface";

export { checkLiveDocsSurface, checkLiveWebSurface };

export async function checkLiveWebAndDocsLinks(context: LiveSurfaceContext) {
  await checkLlmsLinksAgainstSitemaps(context);
}
