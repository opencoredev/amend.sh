import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "send proactive digest previews",
  { dayOfWeek: "monday", hourUTC: 14, minuteUTC: 0 },
  internal.digest.sendWeekly,
  {},
);

export default crons;
