import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "send proactive digest previews",
  { dayOfWeek: "monday", hourUTC: 14, minuteUTC: 0 },
  internal.digest.sendWeekly,
  {},
);

crons.interval(
  "publish due scheduled changelog entries",
  { minutes: 5 },
  internal.changelogScheduler.publishDueScheduled,
  {},
);

export default crons;
