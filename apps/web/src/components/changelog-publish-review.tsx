import { cn } from "@amend/ui/lib/utils";
import { useRef, useState } from "react";
import type { ReactNode } from "react";

import { ActionButton } from "@/components/amend-agent-shared";
import { useChangelogCoverUpload } from "@/components/use-changelog-cover-upload";
import {
  ArrowLeft,
  Bell,
  CalendarClock,
  FileImage,
  Globe,
  Loader2,
  Mail,
  Megaphone,
  Search,
  Send,
  Tag,
  X,
} from "@/lib/icons";

const CATEGORY_LABEL: Record<string, string> = {
  added: "New",
  changed: "Improved",
  fixed: "Fixed",
  removed: "Removed",
  security: "Security",
};

const META_DESCRIPTION_MAX = 160;

/** Values the review surface emits; the workspace merges these with editor content. */
export type PublishReviewValues = {
  summary: string;
  coverImageStorageId: string | null;
  metaDescription: string;
  mode: "now" | "schedule";
  scheduledFor?: number;
  notifySubscribers: boolean;
};

function Section({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/[0.06] ring-inset md:p-5">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="grid size-5 place-items-center text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint ? <span className="text-xs text-muted-foreground/70">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** A small Draft/Improved-style chip used in the live preview. */
function PreviewCard({
  coverUrl,
  category,
  title,
  summary,
}: {
  coverUrl: string | null;
  category: string;
  title: string;
  summary: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl bg-background ring-1 ring-white/[0.08]">
      {coverUrl ? (
        <img src={coverUrl} alt="" className="aspect-[16/9] w-full object-cover" />
      ) : null}
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold leading-snug text-foreground">
            {title || "Untitled update"}
          </h4>
          <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground ring-1 ring-white/[0.07] ring-inset">
            {CATEGORY_LABEL[category] ?? category}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          {summary || "No summary yet."}
        </p>
      </div>
    </article>
  );
}

export function ChangelogPublishReview({
  title,
  category,
  tags,
  version,
  canPublish,
  publishing,
  workspaceSlug,
  initialSummary,
  initialCoverUrl,
  initialCoverStorageId,
  initialMetaDescription,
  onBack,
  onCommit,
}: {
  title: string;
  category: string;
  tags: string[];
  version: string;
  canPublish: boolean;
  publishing: boolean;
  workspaceSlug?: string;
  initialSummary: string;
  initialCoverUrl: string | null;
  initialCoverStorageId: string | null;
  initialMetaDescription: string;
  onBack: () => void;
  onCommit: (values: PublishReviewValues) => void;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [coverStorageId, setCoverStorageId] = useState<string | null>(initialCoverStorageId);
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl);
  const [metaDescription, setMetaDescription] = useState(initialMetaDescription);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledForLocal, setScheduledForLocal] = useState("");
  const [notifySubscribers, setNotifySubscribers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadCover, uploading } = useChangelogCoverUpload({ workspaceSlug });

  const scheduledForMs = scheduledForLocal ? new Date(scheduledForLocal).getTime() : undefined;
  const scheduleInvalid =
    scheduleLater &&
    (!scheduledForMs || Number.isNaN(scheduledForMs) || scheduledForMs <= Date.now());
  const metaPreview = metaDescription.trim() || summary.trim();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const previousUrl = coverUrl;
    const localPreview = URL.createObjectURL(file);
    setCoverUrl(localPreview);
    const storageId = await uploadCover(file);
    if (storageId) {
      setCoverStorageId(storageId);
    } else {
      // Upload failed — revert the optimistic preview.
      setCoverUrl(previousUrl);
      URL.revokeObjectURL(localPreview);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function commit() {
    if (!canPublish || publishing || scheduleInvalid) return;
    onCommit({
      summary: summary.trim(),
      coverImageStorageId: coverStorageId,
      metaDescription: metaDescription.trim(),
      mode: scheduleLater ? "schedule" : "now",
      ...(scheduleLater && scheduledForMs ? { scheduledFor: scheduledForMs } : {}),
      notifySubscribers,
    });
  }

  const primaryLabel = scheduleLater ? "Schedule" : "Publish now";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.05] bg-[var(--workspace-surface-background)] px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="Back to editing"
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
          </button>
          <h2 className="truncate text-sm font-semibold text-foreground">Review &amp; publish</h2>
        </div>
        <ActionButton
          variant="primary"
          size="md"
          onClick={commit}
          disabled={!canPublish || publishing || scheduleInvalid}
        >
          {publishing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Megaphone className="size-4" />
          )}
          {publishing ? "Publishing…" : primaryLabel}
        </ActionButton>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-2xl gap-4 px-5 py-6 md:px-8 md:py-8">
          {!canPublish ? (
            <p className="rounded-xl bg-amber-400/[0.08] px-3.5 py-2.5 text-xs font-medium text-amber-300 ring-1 ring-amber-400/20 ring-inset">
              Add a title in the editor before publishing.
            </p>
          ) : null}

          <Section
            icon={<FileImage />}
            title="Cover image"
            hint="Shown on the portal & shared links"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            {coverUrl ? (
              <div className="group relative overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
                <img
                  src={coverUrl}
                  alt="Cover preview"
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="absolute right-2 top-2 flex gap-1.5">
                  <button
                    type="button"
                    className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-white/[0.12] backdrop-blur transition-colors hover:bg-background"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    aria-label="Remove cover"
                    className="grid size-7 place-items-center rounded-lg bg-background/80 text-muted-foreground ring-1 ring-white/[0.12] backdrop-blur transition-colors hover:text-foreground"
                    onClick={() => {
                      setCoverStorageId(null);
                      setCoverUrl(null);
                    }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                {uploading ? (
                  <div className="absolute inset-0 grid place-items-center bg-background/50">
                    <Loader2 className="size-5 animate-spin text-foreground" />
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.012] text-muted-foreground transition-colors hover:border-white/[0.2] hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <FileImage className="size-6 opacity-70" />
                    <span className="text-sm font-medium">Upload a cover</span>
                    <span className="text-xs text-muted-foreground/70">
                      16:9 · PNG, JPG, or WebP up to 8 MB
                    </span>
                  </>
                )}
              </button>
            )}
          </Section>

          <Section icon={<Send />} title="Summary" hint="The one-liner readers see first">
            <textarea
              rows={2}
              value={summary}
              placeholder="Summarize what changed in one sentence…"
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-background/60 px-3 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
              onChange={(event) => setSummary(event.target.value)}
            />
          </Section>

          <Section icon={<Globe />} title="Preview" hint="How it looks on your portal">
            <PreviewCard coverUrl={coverUrl} category={category} title={title} summary={summary} />
          </Section>

          <Section icon={<Tag />} title="Details" hint="Edit these back in the editor">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-white/[0.04] px-2 py-1 font-medium text-muted-foreground ring-1 ring-white/[0.06] ring-inset">
                {CATEGORY_LABEL[category] ?? category}
              </span>
              {version.trim() ? (
                <span className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-muted-foreground ring-1 ring-white/[0.06] ring-inset">
                  v{version.trim()}
                </span>
              ) : null}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/[0.04] px-2 py-1 font-medium text-muted-foreground ring-1 ring-white/[0.06] ring-inset"
                >
                  {tag}
                </span>
              ))}
              {tags.length === 0 && !version.trim() ? (
                <span className="text-muted-foreground/60">No tags or version set.</span>
              ) : null}
            </div>
          </Section>

          <Section icon={<Search />} title="SEO" hint="For search & social cards">
            <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Meta description</span>
              <span
                className={cn(
                  "font-mono tabular-nums",
                  metaPreview.length > META_DESCRIPTION_MAX
                    ? "text-amber-400"
                    : "text-muted-foreground/50",
                )}
              >
                {metaPreview.length}/{META_DESCRIPTION_MAX}
              </span>
            </label>
            <textarea
              rows={2}
              value={metaDescription}
              placeholder={summary.trim() || "Describe this update for search engines…"}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-background/60 px-3 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
              onChange={(event) => setMetaDescription(event.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground/70">
              Falls back to your summary if left blank. The cover image is used as the social
              preview.
            </p>
          </Section>

          <Section icon={<CalendarClock />} title="Timing" hint="Publish now or pick a time">
            <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-1 py-1.5 text-sm text-foreground">
              <span>Schedule for later</span>
              <input
                type="checkbox"
                className="size-4 accent-foreground"
                checked={scheduleLater}
                onChange={(event) => setScheduleLater(event.target.checked)}
              />
            </label>
            {scheduleLater ? (
              <div className="mt-2">
                <input
                  type="datetime-local"
                  value={scheduledForLocal}
                  className="w-full rounded-xl border border-white/[0.08] bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/40 [color-scheme:dark]"
                  onChange={(event) => setScheduledForLocal(event.target.value)}
                />
                {scheduleInvalid ? (
                  <p className="mt-1.5 text-xs text-amber-400">Pick a time in the future.</p>
                ) : null}
              </div>
            ) : null}
          </Section>

          <Section icon={<Mail />} title="Notify" hint="Email people on publish">
            <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-1 py-1.5 text-sm text-foreground">
              <span className="inline-flex items-center gap-2">
                <Bell className="size-3.5 text-muted-foreground" />
                Email subscribers when this goes live
              </span>
              <input
                type="checkbox"
                className="size-4 accent-foreground"
                checked={notifySubscribers}
                onChange={(event) => setNotifySubscribers(event.target.checked)}
              />
            </label>
          </Section>
        </div>
      </div>
    </div>
  );
}
