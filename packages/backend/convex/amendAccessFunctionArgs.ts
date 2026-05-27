import { v } from "convex/values";

export const joinWaitlistArgs = {
  company: v.optional(v.string()),
  email: v.string(),
  name: v.optional(v.string()),
  source: v.optional(v.string()),
};
