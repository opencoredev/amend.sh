import { cn } from "@amend/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";

import {
  createWorkspaceTagMutation,
  listWorkspaceTagsQuery,
  removeWorkspaceTagMutation,
  updateWorkspaceTagMutation,
} from "@/components/amend-dashboard-data";
import {
  TAG_COLORS,
  TAG_COLOR_KEYS,
  type TagColorKey,
  type WorkspaceTag,
  tagColorByKey,
} from "@/components/changelog-tags";
import { Check, Plus, Tag, X } from "@/lib/icons";
import { useDisclosureTransition } from "@/components/use-disclosure-transition";
import { errorMessage, toast } from "@/lib/toast";

function SwatchRow({
  onSelect,
  selected,
}: {
  onSelect: (key: TagColorKey) => void;
  selected: TagColorKey;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {TAG_COLOR_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          aria-label={key}
          aria-pressed={key === selected}
          className={cn(
            "grid size-5 place-items-center rounded-full ring-1 ring-white/10 transition-transform hover:scale-110",
            TAG_COLORS[key].dot,
            key === selected && "ring-2 ring-white/70",
          )}
          onClick={() => onSelect(key)}
        >
          {key === selected ? <Check className="size-3 text-black/70" /> : null}
        </button>
      ))}
    </div>
  );
}

function TagRow({
  onDelete,
  onUpdate,
  tag,
}: {
  onDelete: (tag: WorkspaceTag) => void;
  onUpdate: (tag: WorkspaceTag, patch: { name?: string; color?: string }) => void;
  tag: WorkspaceTag;
}) {
  const [name, setName] = useState(tag.name);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerTransition = useDisclosureTransition(pickerOpen, "top-left");

  // Re-seed the field if the row's tag changes underneath us (e.g. live query).
  useEffect(() => {
    setName(tag.name);
  }, [tag.name]);

  function commitName() {
    const next = name.trim();
    if (!next || next === tag.name) {
      setName(tag.name);
      return;
    }
    onUpdate(tag, { name: next });
  }

  return (
    <div className="flex items-center gap-2 rounded-xl px-2.5 py-2 ring-1 ring-white/[0.05] transition-colors hover:bg-white/[0.02]">
      <div className="relative">
        <button
          type="button"
          aria-label="Change color"
          className={cn(
            "size-3 rounded-full ring-2 ring-white/10 transition-transform hover:scale-110",
            tagColorByKey(tag.color).dot,
          )}
          onClick={() => setPickerOpen((open) => !open)}
        />
        {pickerTransition.mounted ? (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setPickerOpen(false)}
            />
            <div
              className={cn(
                "absolute left-0 top-6 z-40 w-44 rounded-xl bg-popover p-2.5 shadow-[0_18px_60px_rgb(0_0_0/0.55)] ring-1 ring-white/[0.06]",
                pickerTransition.className,
              )}
              data-origin={pickerTransition["data-origin"]}
            >
              <SwatchRow
                selected={tag.color as TagColorKey}
                onSelect={(key) => {
                  setPickerOpen(false);
                  if (key !== tag.color) onUpdate(tag, { color: key });
                }}
              />
            </div>
          </>
        ) : null}
      </div>

      <input
        value={name}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
        onChange={(event) => setName(event.target.value)}
        onBlur={commitName}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setName(tag.name);
            event.currentTarget.blur();
          }
        }}
      />

      <button
        type="button"
        aria-label={`Delete ${tag.name}`}
        className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300 [&_svg]:size-3.5"
        onClick={() => onDelete(tag)}
      >
        <X />
      </button>
    </div>
  );
}

export function TagsSettingsPanel({ workspaceSlug }: { workspaceSlug?: string }) {
  const queryArgs = workspaceSlug ? { workspaceSlug } : {};
  const tags = (useQuery(listWorkspaceTagsQuery, queryArgs) ?? undefined) as
    | WorkspaceTag[]
    | undefined;
  const createTag = useMutation(createWorkspaceTagMutation);
  const updateTag = useMutation(updateWorkspaceTagMutation);
  const removeTag = useMutation(removeWorkspaceTagMutation);

  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState<TagColorKey>(TAG_COLOR_KEYS[0]);
  const draftRef = useRef<HTMLInputElement | null>(null);

  function scope<T extends object>(extra: T) {
    return { ...extra, ...(workspaceSlug ? { workspaceSlug } : {}) };
  }

  function reportError(title: string) {
    return (error: unknown) =>
      toast.error({ title, description: errorMessage(error, "Please try again.") });
  }

  function addTag() {
    const name = draftName.trim();
    if (!name) return;
    const exists = (tags ?? []).some((tag) => tag.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error({ title: "Tag already exists", description: `“${name}” is already a tag.` });
      return;
    }
    void createTag(scope({ name, color: draftColor })).catch(reportError("Could not create tag"));
    setDraftName("");
    // Advance the default color so consecutive tags don't all look the same.
    setDraftColor(TAG_COLOR_KEYS[(TAG_COLOR_KEYS.indexOf(draftColor) + 1) % TAG_COLOR_KEYS.length]);
    draftRef.current?.focus();
  }

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Tags</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Reusable, color-coded tags for changelog entries. Created tags are saved to the workspace
          and available everywhere.
        </p>
      </div>

      {/* Create */}
      <div className="flex items-center gap-2.5 rounded-xl bg-[#151518] p-2.5 ring-1 ring-white/[0.06]">
        <SwatchRow selected={draftColor} onSelect={setDraftColor} />
        <input
          ref={draftRef}
          value={draftName}
          className="h-8 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="New tag name…"
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
        />
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-colors hover:bg-foreground/80 disabled:opacity-40 [&_svg]:size-3.5"
          disabled={!draftName.trim()}
          onClick={addTag}
        >
          <Plus />
          Add tag
        </button>
      </div>

      {/* List */}
      {tags === undefined ? (
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">Loading tags…</p>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/[0.08] px-4 py-10 text-center">
          <span className="grid size-9 place-items-center rounded-full bg-white/[0.04] text-muted-foreground [&_svg]:size-4">
            <Tag />
          </span>
          <p className="text-sm font-medium text-foreground">No tags yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Add your first tag above, or create one inline while editing a changelog entry.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              onDelete={(target) =>
                void removeTag(scope({ tagId: target.id })).catch(
                  reportError("Could not delete tag"),
                )
              }
              onUpdate={(target, patch) =>
                void updateTag(scope({ tagId: target.id, ...patch })).catch(
                  reportError("Could not update tag"),
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
