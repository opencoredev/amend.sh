import { cn } from "@amend/ui/lib/utils";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { ChevronUp } from "@/lib/icons";
import { errorMessage, toast } from "@/lib/toast";

/**
 * Featurebase-style upvote control with two states — idle and voted (brand gold
 * `amend-warm`).
 *
 * Built to be spam-proof: the button is never disabled, so clicking back and
 * forth flips the count and color instantly on every click. The actual server
 * mutation is reconciled separately — only one request is ever in flight, and
 * when it lands we re-check intent vs. the server's reported state and fire again
 * only if they still differ. A rapid vote/unvote/vote therefore collapses into the
 * minimum number of toggles and always converges to the user's last click. This
 * is a genuine sync-to-external-system effect (local intent → server), which is
 * the one case an effect is the right tool.
 */
export function VoteButton({
  count,
  voted,
  onVote,
  title,
  orientation = "vertical",
}: {
  count: number;
  voted: boolean;
  onVote: () => Promise<unknown>;
  title: string;
  orientation?: "vertical" | "horizontal";
}) {
  // The user's desired state when it diverges from the server's `voted`; null
  // once the two agree (nothing left to push).
  const [intent, setIntent] = useState<boolean | null>(null);
  const inFlight = useRef(false);
  const onVoteRef = useRef(onVote);
  onVoteRef.current = onVote;

  const isVoted = intent ?? voted;
  const delta = intent === null ? 0 : (intent ? 1 : 0) - (voted ? 1 : 0);
  const displayCount = Math.max(0, count + delta);

  useEffect(() => {
    if (intent === null) {
      return;
    }
    if (intent === voted) {
      // Server caught up to the user's intent — settle.
      setIntent(null);
      return;
    }
    if (inFlight.current) {
      // A toggle is already running; this re-runs once `voted` changes.
      return;
    }
    inFlight.current = true;
    void onVoteRef
      .current()
      .catch((error: unknown) => {
        // Give up on the optimistic state and surface the failure.
        setIntent(null);
        toast.error({
          title: "Vote was not saved",
          description: errorMessage(
            error,
            "The vote could not be saved. Refresh the project and try again.",
          ),
        });
      })
      .finally(() => {
        inFlight.current = false;
      });
  }, [intent, voted]);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    event.preventDefault();
    setIntent((current) => !(current ?? voted));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isVoted}
      aria-label={isVoted ? `Remove your vote from ${title}` : `Upvote ${title}`}
      className={cn(
        "group/vote inline-flex shrink-0 items-center justify-center ring-1 transition-[background-color,color,box-shadow,transform] duration-150 ease-linear active:scale-[0.97]",
        orientation === "vertical"
          ? "h-12 w-11 flex-col gap-0.5 rounded-xl"
          : "h-8 gap-1.5 rounded-lg px-2.5",
        isVoted
          ? "bg-amend-warm/[0.13] text-amend-warm ring-amend-warm/30 hover:bg-amend-warm/[0.18]"
          : "bg-white/[0.03] text-muted-foreground ring-white/[0.07] hover:bg-white/[0.07] hover:text-foreground hover:ring-white/[0.12]",
      )}
    >
      <ChevronUp
        className={cn(
          "transition-transform duration-150 ease-linear",
          orientation === "vertical" ? "size-4" : "size-3.5",
          isVoted
            ? "text-amend-warm"
            : "text-muted-foreground group-hover/vote:-translate-y-0.5 group-hover/vote:text-foreground",
        )}
      />
      <span
        className={cn(
          "font-semibold leading-none tabular-nums",
          orientation === "vertical" ? "text-[0.8rem]" : "text-xs",
          isVoted ? "text-amend-warm" : "text-foreground/90",
        )}
      >
        {displayCount}
      </span>
    </button>
  );
}
