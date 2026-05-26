export function filterStatus<T extends { status?: string }>(items: T[], status?: string) {
  if (!status) {
    return items;
  }
  return items.filter((item) => item.status === status);
}

export function buildBriefStatus(value: string | undefined) {
  if (
    value === "draft" ||
    value === "in_review" ||
    value === "approved" ||
    value === "exported" ||
    value === "archived"
  ) {
    return value;
  }
  return undefined;
}

export function take<T>(items: T[], limit?: number) {
  return Number.isFinite(limit) && limit ? items.slice(0, limit) : items;
}
