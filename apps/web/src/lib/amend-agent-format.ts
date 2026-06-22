/**
 * Formatting helpers for the proactive-agent console.
 *
 * All date formatting is pinned to UTC and a fixed `AMEND_NOW` reference so the
 * server render and the client hydration produce byte-identical strings (no
 * hydration mismatch). When the screens swap from the mock layer to live Convex
 * data, replace `AMEND_NOW` usage with `Date.now()` inside `relativeFromNow`.
 */
import type { Proof, ProofStrength } from "@/lib/amend-contract";

/** Fixed "now" for deterministic relative time across SSR + the mock fixtures. */
export const AMEND_NOW = Date.UTC(2026, 5, 16, 15, 0, 0); // 2026-06-16T15:00:00Z

const dayMonth = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const fullDate = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "Mar 2" */
export function formatDayMonth(ts: number): string {
  return dayMonth.format(ts);
}

/** "Mar 2026" */
export function formatMonthYear(ts: number): string {
  return monthYear.format(ts);
}

/** "March 2, 2026" */
export function formatFullDate(ts: number): string {
  return fullDate.format(ts);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** "just now" / "5h ago" / "3d ago" / "2w ago" / "Mar 2" — deterministic vs AMEND_NOW. */
export function relativeFromNow(ts: number, now: number = AMEND_NOW): string {
  const diff = now - ts;
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  if (diff < 5 * WEEK) return `${Math.floor(diff / WEEK)}w ago`;
  return formatDayMonth(ts);
}

/** "active this week" when fresh, else "last active Mar 2". */
export function activityPhrase(lastSeen: number, now: number = AMEND_NOW): string {
  return now - lastSeen < WEEK ? "active this week" : `last active ${formatDayMonth(lastSeen)}`;
}

export function strengthLabel(strength: ProofStrength): string {
  return strength === "thin" ? "Thin" : strength === "building" ? "Building" : "Strong";
}

/** Filled segments out of 3 — drives the strength bar (never a percentage). */
export function strengthSegments(strength: ProofStrength): number {
  return strength === "thin" ? 1 : strength === "building" ? 2 : 3;
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** "12 people · 3 paying · 3 sources" — the plain because-line (no decimals, ever). */
export function proofBecauseLine(proof: Proof): string {
  const parts = [pluralize(proof.people, "person", "people")];
  if (proof.payingPeople > 0) parts.push(`${proof.payingPeople} paying`);
  parts.push(pluralize(proof.sources.length, "source"));
  return parts.join(" · ");
}

/** "4 new this week" / "steady" growth phrasing. */
export function growthPhrase(growthPerWeek: number): string {
  if (growthPerWeek <= 0) return "steady this week";
  return `${growthPerWeek} new this week`;
}
