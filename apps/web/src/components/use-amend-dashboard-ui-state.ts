import { useState } from "react";

import type {
  ChangelogStatusFilter,
  RoadmapStatus,
  SettingsSection,
} from "@/components/amend-dashboard-types";

export function useAmendDashboardUiState() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeChangelogStatus, setActiveChangelogStatus] = useState<ChangelogStatusFilter>("all");
  const [activeChangelogCategory, setActiveChangelogCategory] = useState("all");
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>("general");
  const [roadmapCreateStatus, setRoadmapCreateStatus] = useState<RoadmapStatus | null>(null);
  const [selectedFeedbackKey, setSelectedFeedbackKey] = useState<string | null>(null);
  const [selectedChangelogKey, setSelectedChangelogKey] = useState<string | null>(null);
  const [selectedRoadmapKey, setSelectedRoadmapKey] = useState<string | null>(null);

  const closeComposer = () => {
    setComposerOpen(false);
    setRoadmapCreateStatus(null);
  };

  return {
    activeChangelogCategory,
    activeChangelogStatus,
    activeSettingsSection,
    closeComposer,
    composerOpen,
    roadmapCreateStatus,
    selectedChangelogKey,
    selectedFeedbackKey,
    selectedRoadmapKey,
    setActiveChangelogCategory,
    setActiveChangelogStatus,
    setActiveSettingsSection,
    setComposerOpen,
    setRoadmapCreateStatus,
    setSelectedChangelogKey,
    setSelectedFeedbackKey,
    setSelectedRoadmapKey,
  };
}
