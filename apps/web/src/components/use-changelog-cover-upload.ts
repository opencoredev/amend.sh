import { useMutation } from "convex/react";
import { useState } from "react";

import { generateChangelogCoverUploadUrlMutation } from "@/components/amend-dashboard-data";
import { errorMessage, toast } from "@/lib/toast";

/**
 * Uploads a changelog cover image to Convex storage, mirroring the project-logo
 * flow (`use-settings-workspace-logo-actions.ts`): mint a one-shot upload URL,
 * POST the file, and hand back the `storageId`. The caller persists that id via
 * the publish payload; resolving it to a URL happens server-side.
 */
export function useChangelogCoverUpload({ workspaceSlug }: { workspaceSlug?: string }) {
  const generateUploadUrl = useMutation(generateChangelogCoverUploadUrlMutation);
  const [uploading, setUploading] = useState(false);

  async function uploadCover(file: File | undefined): Promise<string | null> {
    if (!file) return null;
    if (!file.type.startsWith("image/")) {
      toast.error({
        title: "Cover was not uploaded",
        description: "Choose an image file like PNG, JPG, or WebP.",
      });
      return null;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error({
        title: "Cover is too large",
        description: "Use an image smaller than 8 MB.",
      });
      return null;
    }

    setUploading(true);
    try {
      const uploadUrl = (await generateUploadUrl(
        workspaceSlug ? { workspaceSlug } : {},
      )) as string;
      const response = await fetch(uploadUrl, {
        body: file,
        headers: { "Content-Type": file.type },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Convex storage rejected the uploaded image.");
      }
      const { storageId } = (await response.json()) as { storageId: string };
      return storageId;
    } catch (error) {
      toast.error({
        title: "Cover was not uploaded",
        description: errorMessage(error, "The image could not be stored. Try a smaller image."),
      });
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { uploadCover, uploading };
}
