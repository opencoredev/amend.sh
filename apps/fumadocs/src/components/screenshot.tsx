import type { CSSProperties } from "react";

type ScreenshotProps = {
  /** Caption shown under the figure. Describe what the screenshot demonstrates. */
  caption: string;
  /** Alt text for the eventual image. Defaults to the caption. */
  alt?: string;
  /** Image path once a real screenshot exists, e.g. "/docs/feedback-inbox.png". */
  src?: string;
  /** Aspect ratio of the frame, as a CSS `aspect-ratio` value. Defaults to "16 / 9". */
  ratio?: string;
  /** Short label for the placeholder state. Defaults to "Screenshot". */
  label?: string;
};

/**
 * A figure slot for product screenshots.
 *
 * Until a real image is wired, it renders a captioned placeholder frame so the
 * page reads as designed. Pass `src` to swap the placeholder for the image with
 * no other changes to the page.
 */
export function Screenshot({
  caption,
  alt,
  src,
  ratio = "16 / 9",
  label = "Screenshot",
}: ScreenshotProps) {
  const frameStyle: CSSProperties = { aspectRatio: ratio };

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      {src ? (
        <img src={src} alt={alt ?? caption} loading="lazy" className="block w-full" style={frameStyle} />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_oklab,white_3%,transparent)_10px,color-mix(in_oklab,white_3%,transparent)_20px)] text-center"
          style={frameStyle}
        >
          <span className="rounded-full border border-fd-border px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-fd-muted-foreground">
            {label}
          </span>
        </div>
      )}
      <figcaption className="border-t border-fd-border px-4 py-2 text-center text-xs text-fd-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
