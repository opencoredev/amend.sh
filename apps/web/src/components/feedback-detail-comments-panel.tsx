import { Button } from "@amend/ui/components/button";
import { MessageSquareText } from "@/lib/icons";
import { useState } from "react";

import { EmptyInline } from "@/components/dashboard-detail-shared";
import { errorMessage, toast } from "@/lib/toast";

export function FeedbackDetailCommentsPanel({
  onAddNote,
}: {
  onAddNote: (note: string) => Promise<void>;
}) {
  const [noteDraft, setNoteDraft] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [savingNote, setSavingNote] = useState(false);

  function addNote() {
    const nextNote = noteDraft.trim();
    if (!nextNote) return;
    setSavingNote(true);
    void onAddNote(nextNote)
      .then(() => {
        setNotes((current) => [nextNote, ...current]);
        setNoteDraft("");
      })
      .catch((error: unknown) =>
        toast.error({
          title: "Note was not saved",
          description: errorMessage(
            error,
            "The feedback note could not be saved to this project. Keep the note text and try again.",
          ),
        }),
      )
      .finally(() => setSavingNote(false));
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl bg-amend-inset p-4 ring-1 ring-white/[0.055]">
        <textarea
          className="min-h-28 w-full resize-y bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
          placeholder="Add an internal note or customer reply..."
          value={noteDraft}
          onChange={(event) => setNoteDraft(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <p className="text-xs text-muted-foreground">
            Replies will attach to this feedback item.
          </p>
          <Button
            className="h-9 rounded-lg border border-foreground bg-foreground px-3.5 text-xs font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75"
            disabled={!noteDraft.trim() || savingNote}
            type="button"
            onClick={addNote}
          >
            {savingNote ? "Adding..." : "Add note"}
          </Button>
        </div>
      </div>
      {notes.length > 0 ? (
        <div className="grid gap-2">
          {notes.map((note, index) => (
            <article
              key={`${note}-${index}`}
              className="rounded-2xl bg-amend-inset p-4 text-sm leading-6 text-muted-foreground ring-1 ring-white/[0.055]"
            >
              {note}
            </article>
          ))}
        </div>
      ) : (
        <EmptyInline
          copy="No comments have been captured for this item yet."
          icon={<MessageSquareText />}
          title="No comments yet"
        />
      )}
    </section>
  );
}
