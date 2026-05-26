import { DetailStat, SourceEvidenceList } from "@/components/dashboard-detail-shared";
import type { Post } from "@/components/amend-dashboard-types";

export function FeedbackDetailSidebar({ post }: { post: Post }) {
  return (
    <aside className="grid min-w-0 content-start gap-4 bg-card/35 p-4 md:p-6">
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Workflow</h2>
        <DetailStat label="Roadmap links" value={String(post.linkedRoadmapCount)} />
        <DetailStat label="Changelog links" value={String(post.linkedChangelogCount)} />
        <p className="text-pretty text-xs leading-5 text-muted-foreground">
          This feedback is available to the roadmap view without creating a duplicate post.
        </p>
      </section>
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Source evidence</h2>
        <SourceEvidenceList compact links={post.sourceLinks} />
      </section>
    </aside>
  );
}
