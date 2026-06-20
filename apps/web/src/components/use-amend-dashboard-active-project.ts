import { useCallback, useState } from "react";

import { readStoredJson, writeStoredJson } from "@/components/amend-dashboard-cache";

/**
 * The active project is remembered in localStorage instead of the URL, so dashboard
 * links stay short (`/dashboard/changelog` rather than `?project=…`). It still
 * survives refreshes and new tabs; it is just no longer shareable via the URL.
 */
const ACTIVE_PROJECT_KEY = "amend.active-project";

export function useAmendDashboardActiveProject() {
  const [activeProjectId, setActiveProjectId] = useState<string>(
    () => readStoredJson<string>(ACTIVE_PROJECT_KEY) ?? "",
  );

  const setActiveProject = useCallback((id: string) => {
    setActiveProjectId(id);
    writeStoredJson(ACTIVE_PROJECT_KEY, id);
  }, []);

  const activeProjectSlug =
    activeProjectId && activeProjectId !== "new-project" ? activeProjectId : undefined;

  return { activeProjectId, activeProjectSlug, setActiveProject };
}
