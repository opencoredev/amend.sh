import { cn } from "@amend/ui/lib/utils";
import { useState } from "react";

import type { Post } from "@/components/amend-dashboard-types";
import { formatDate, statusTitle } from "@/components/amend-dashboard-utils";
import { DetailStat, SourceEvidenceList } from "@/components/dashboard-detail-shared";
import { FeedbackDetailCommentsPanel } from "@/components/feedback-detail-comments-panel";
import { FeedbackDetailHeader } from "@/components/feedback-detail-header";
import { FeedbackDetailSidebar } from "@/components/feedback-detail-sidebar";

export function FeedbackDetailWorkspace({
  onAddNote,
  onBack,
  post,
}: {
  onAddNote: (note: string) => Promise<void>;
  onBack: () => void;
  post: Post;
}) {
  const [activeTab, setActiveTab] = useState<"comments" | "details" | "sources">("comments");

  return (
    <div className="t-panel-slide min-h-svh bg-card/40" data-open="true">
      <FeedbackDetailHeader onBack={onBack} post={post} />

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0 border-b border-border bg-background/45 lg:border-b-0 lg:border-r">
          <div className="mx-auto grid max-w-4xl gap-6 px-4 py-6 md:px-6 md:py-8">
            <section className="grid gap-4">
              <h2 className="text-sm font-semibold">Description</h2>
              <p className="max-w-3xl whitespace-pre-wrap text-pretty text-sm leading-7 text-muted-foreground">
                {post.body || "No description was added."}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.labels.length > 0 ? (
                  post.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-border bg-muted/25 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-border bg-muted/25 px-3 py-1 text-xs text-muted-foreground">
                    No tags
                  </span>
                )}
              </div>
            </section>

            <div className="border-b border-border">
              <div className="flex flex-wrap gap-1">
                {(["comments", "details", "sources"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={cn(
                      "min-h-10 px-3 text-sm font-semibold capitalize text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted/25 hover:text-foreground active:scale-[0.96]",
                      activeTab === tab && "bg-muted/30 text-foreground",
                    )}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "comments" ? (
              <FeedbackDetailCommentsPanel onAddNote={onAddNote} />
            ) : null}

            {activeTab === "details" ? (
              <section className="grid gap-3 sm:grid-cols-2">
                <DetailStat label="Status" value={statusTitle(post.status)} />
                <DetailStat label="Votes" value={String(post.voters)} />
                <DetailStat label="Roadmap links" value={String(post.linkedRoadmapCount)} />
                <DetailStat label="Changelog links" value={String(post.linkedChangelogCount)} />
                <DetailStat label="Author" value={post.authorName || "Dashboard"} />
                <DetailStat label="Updated" value={formatDate(post.updatedAt)} />
              </section>
            ) : null}

            {activeTab === "sources" ? <SourceEvidenceList links={post.sourceLinks} /> : null}
          </div>
        </article>

        <FeedbackDetailSidebar post={post} />
      </div>
    </div>
  );
}
