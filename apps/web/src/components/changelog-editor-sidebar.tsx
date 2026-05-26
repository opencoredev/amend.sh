import { Input } from "@amend/ui/components/input";

import type { DashboardChangelog } from "@/components/amend-dashboard-types";
import { formatDate } from "@/components/amend-dashboard-utils";
import { DetailStat, SourceEvidenceList } from "@/components/dashboard-detail-shared";

export function ChangelogEditorSidebar({
  category,
  entry,
  onCategoryChange,
  onSendEmailChange,
  onShowPubliclyChange,
  onStatusChange,
  onVersionChange,
  sendEmail,
  showPublicly,
  status,
  version,
}: {
  category: string;
  entry: DashboardChangelog;
  onCategoryChange: (value: string) => void;
  onSendEmailChange: (value: boolean) => void;
  onShowPubliclyChange: (value: boolean) => void;
  onStatusChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  sendEmail: boolean;
  showPublicly: boolean;
  status: string;
  version: string;
}) {
  return (
    <aside className="grid min-w-0 content-start gap-5 bg-card/35 p-4 md:p-6">
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Publishing</h2>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Status
          </span>
          <select
            className="h-10 border border-border bg-background px-3 text-xs outline-none"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="in_review">In review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Category
          </span>
          <select
            className="h-10 border border-border bg-background px-3 text-xs outline-none"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="added">New</option>
            <option value="changed">Improved</option>
            <option value="fixed">Fixed</option>
            <option value="removed">Removed</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Version
          </span>
          <Input
            className="h-10 border-border bg-background text-xs"
            value={version}
            onChange={(event) => onVersionChange(event.target.value)}
            placeholder="Optional"
          />
        </label>
        <DetailStat
          label="Updated"
          value={entry.publishedAt ? formatDate(entry.publishedAt) : formatDate(entry.updatedAt)}
        />
      </section>
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Distribution</h2>
        <label className="flex min-h-11 items-center gap-3 border border-border bg-background px-3 text-sm text-muted-foreground">
          <input
            checked={showPublicly}
            className="size-4 accent-foreground"
            type="checkbox"
            onChange={(event) => onShowPubliclyChange(event.target.checked)}
          />
          <span>Show on portal and widgets</span>
        </label>
        <label className="flex min-h-11 items-center gap-3 border border-border bg-background px-3 text-sm text-muted-foreground">
          <input
            checked={sendEmail}
            className="size-4 accent-foreground"
            type="checkbox"
            onChange={(event) => onSendEmailChange(event.target.checked)}
          />
          <span>Email subscribers on publish</span>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Audience
          </span>
          <select className="h-10 border border-border bg-background px-3 text-xs outline-none">
            <option>Everyone</option>
            <option>Voters and commenters</option>
            <option>Admins only</option>
          </select>
        </label>
      </section>
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Source evidence</h2>
        <SourceEvidenceList compact links={entry.sourceLinks} />
      </section>
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Review</h2>
        <p className="text-pretty text-xs leading-5 text-muted-foreground">
          Save drafts here before publishing updates to the public changelog.
        </p>
      </section>
    </aside>
  );
}
