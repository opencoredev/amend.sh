import { SourceEvidenceList } from "@/components/dashboard-detail-shared";
import {
  PortalProse,
  PortalSurface,
  changelogCategoryLabel,
  formatPortalDate,
} from "@/components/public-portal-shared";
import type { PortalChangelog } from "@/components/public-portal-types";
import { ArrowLeft, Newspaper } from "@/lib/icons";

export function PortalChangelogView({
  changelog,
  onOpenEntry,
}: {
  changelog: PortalChangelog[];
  onOpenEntry: (stableKey: string) => void;
}) {
  return (
    <div className="py-5">
      <h1 className="text-lg font-semibold tracking-tight">Updates</h1>

      <PortalSurface className="mt-4 min-h-[calc(100svh-11rem)] overflow-hidden">
        {changelog.length === 0 ? (
          <div className="grid place-items-center px-6 py-20 text-center">
            <Newspaper className="size-7 text-muted-foreground/30" />
            <h3 className="mt-3 text-sm font-semibold">No updates published yet</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Shipped, source-linked updates appear here once they're published.
            </p>
          </div>
        ) : (
          <div className="grid divide-y divide-white/[0.045]">
            {changelog.map((entry) => (
              <button
                key={entry.stableKey}
                type="button"
                onClick={() => onOpenEntry(entry.stableKey)}
                className="group grid w-full gap-5 px-5 py-5 text-left transition-colors duration-150 ease-linear hover:bg-foreground/[0.04] active:opacity-75 md:grid-cols-[16rem_minmax(0,1fr)_7rem] md:items-center md:px-6"
              >
                {entry.coverImageUrl ? (
                  <img
                    src={entry.coverImageUrl}
                    alt=""
                    loading="lazy"
                    className="aspect-[16/9] w-full rounded-xl object-cover ring-1 ring-white/[0.04]"
                  />
                ) : (
                  <div className="grid aspect-[16/9] place-items-center rounded-xl bg-background/70 text-sm font-semibold text-muted-foreground ring-1 ring-white/[0.04]">
                    {changelogCategoryLabel(entry.category || "Update")}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">{entry.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {entry.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {entry.category ? (
                      <span className="rounded-lg bg-background/80 px-2.5 py-1 ring-1 ring-white/[0.04]">
                        {changelogCategoryLabel(entry.category)}
                      </span>
                    ) : null}
                    <span className="rounded-lg bg-background/80 px-2.5 py-1 ring-1 ring-white/[0.04]">
                      {formatPortalDate(entry.publishedAt ?? entry.updatedAt)}
                    </span>
                  </div>
                </div>
                {entry.version ? (
                  <span className="h-fit w-fit rounded-lg bg-background/80 px-2.5 py-1 font-mono text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.04] md:justify-self-end">
                    {entry.version}
                  </span>
                ) : (
                  <span aria-hidden />
                )}
              </button>
            ))}
          </div>
        )}
      </PortalSurface>
    </div>
  );
}

export function PortalChangelogDetail({
  entry,
  onBack,
}: {
  entry: PortalChangelog;
  onBack: () => void;
}) {
  return (
    <div className="py-5">
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground [&_svg]:size-4"
      >
        <ArrowLeft className="transition-transform duration-150 ease-linear group-hover:-translate-x-0.5" />
        Updates
      </button>

      <PortalSurface className="mt-4">
        <article className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <time className="font-medium">
              {formatPortalDate(entry.publishedAt ?? entry.updatedAt)}
            </time>
            {entry.category ? (
              <span className="rounded-lg bg-background/80 px-2.5 py-1 ring-1 ring-white/[0.04]">
                {changelogCategoryLabel(entry.category)}
              </span>
            ) : null}
            {entry.version ? (
              <span className="rounded-lg bg-background/80 px-2.5 py-1 font-mono ring-1 ring-white/[0.04]">
                {entry.version}
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight md:text-[2.25rem]">
            {entry.title}
          </h1>
          {entry.summary ? (
            <p className="mt-3 text-pretty text-base leading-7 text-muted-foreground">
              {entry.summary}
            </p>
          ) : null}

          {entry.coverImageUrl ? (
            <img
              src={entry.coverImageUrl}
              alt=""
              className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-white/[0.05]"
            />
          ) : null}

          {entry.body ? (
            <PortalProse className="mt-6" html={entry.body} />
          ) : (
            <p className="mt-6 text-sm leading-7 text-muted-foreground">
              No further detail was added for this update.
            </p>
          )}

          {entry.sourceLinks.length > 0 ? (
            <section className="mt-8 grid gap-3 border-t border-white/[0.06] pt-6">
              <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Shipped in
              </h2>
              <SourceEvidenceList links={entry.sourceLinks} />
            </section>
          ) : null}
        </article>
      </PortalSurface>
    </div>
  );
}
