import { CalendarClock, Check, Circle, Radio } from "@/lib/icons";
import type { ReactElement } from "react";

import type { RoadmapStatus } from "@/components/amend-dashboard-types";

export const statusMeta: Record<
  RoadmapStatus,
  { label: string; short: string; icon: ReactElement; dot: string }
> = {
  backlog: {
    label: "Under Review",
    short: "Review",
    icon: <Circle />,
    dot: "bg-muted-foreground",
  },
  next: {
    label: "Planned",
    short: "Planned",
    icon: <CalendarClock />,
    dot: "bg-muted-foreground",
  },
  progress: {
    label: "In Progress",
    short: "Progress",
    icon: <Radio />,
    dot: "bg-foreground",
  },
  done: {
    label: "Done",
    short: "Done",
    icon: <Check />,
    dot: "bg-foreground",
  },
};
