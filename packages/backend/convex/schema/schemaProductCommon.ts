import { v } from "convex/values";

export const sdkEventSource = v.union(
  v.literal("sdk"),
  v.literal("rest"),
  v.literal("portal"),
  v.literal("embed"),
);
