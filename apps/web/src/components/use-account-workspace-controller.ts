import { useState } from "react";

import { useSettingsAutoSave } from "@/components/use-settings-autosave";
import { authClient } from "@/lib/auth-client";
import { identifyAndCapturePostHogEvent } from "@/lib/posthog";
import { errorMessage, toast } from "@/lib/toast";

export type AccountWorkspaceController = ReturnType<typeof useAccountWorkspaceController>;

/** Minimum new-password length — matches better-auth's default policy. */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Personal-account settings, backed by better-auth's user APIs (not project /
 * workspace settings). The display name auto-saves like the project settings
 * surface; the avatar, password, and session actions are discrete writes.
 */
export function useAccountWorkspaceController() {
  const session = authClient.useSession();
  const user = session.data?.user;
  const userId = user?.id ?? "anon";
  const isAuthed = Boolean(user);

  // --- Display name: debounced auto-save via updateUser ---------------------
  const [name, setName] = useState(user?.name ?? "");
  // Re-seed during render (React's "adjust state when a prop changes" pattern),
  // keyed on the user id, so the field and the auto-save identity move together
  // — no one-render gap that would fire a spurious save right after the session
  // loads, and the live session echo of our own save never resets the field.
  const [seededUserId, setSeededUserId] = useState(userId);
  if (seededUserId !== userId) {
    setSeededUserId(userId);
    setName(user?.name ?? "");
  }

  const nameSave = useSettingsAutoSave({
    enabled: isAuthed,
    identity: userId,
    signature: name.trim(),
    save: async () => {
      const next = name.trim();
      if (!next) throw new Error("Your name can’t be empty");
      const result = await authClient.updateUser({ name: next });
      if (result.error) throw new Error(result.error.message ?? "Couldn’t update your name");
    },
  });

  // --- Avatar image: discrete write (empty string clears it) ----------------
  const [imageBusy, setImageBusy] = useState(false);
  async function writeImage(image: string) {
    setImageBusy(true);
    try {
      const result = await authClient.updateUser({ image });
      if (result.error) throw new Error(result.error.message ?? "Couldn’t update your photo");
      toast.success(image ? "Photo updated" : "Photo removed");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t update your photo"));
    } finally {
      setImageBusy(false);
    }
  }

  // --- Change password ------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);

  function resetPasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  }

  async function changePassword(): Promise<boolean> {
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError("Enter your current password.");
      return false;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don’t match.");
      return false;
    }
    setPasswordBusy(true);
    try {
      // Rotating the password invalidates other sessions — a sane security default.
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) throw new Error(result.error.message ?? "Couldn’t change your password");
      resetPasswordForm();
      toast.success("Password changed");
      return true;
    } catch (error) {
      setPasswordError(errorMessage(error, "Couldn’t change your password"));
      return false;
    } finally {
      setPasswordBusy(false);
    }
  }

  // --- Sessions -------------------------------------------------------------
  const [otherSessionsBusy, setOtherSessionsBusy] = useState(false);
  async function signOutOtherSessions() {
    setOtherSessionsBusy(true);
    try {
      const result = await authClient.revokeOtherSessions();
      if (result.error) throw new Error(result.error.message ?? "Couldn’t sign out other devices");
      toast.success("Signed out of all other devices");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t sign out other devices"));
    } finally {
      setOtherSessionsBusy(false);
    }
  }

  async function signOut() {
    await identifyAndCapturePostHogEvent({
      event: "user_signed_out",
      identity: { email: user?.email, name: user?.name, userId: user?.id },
      properties: { surface: "account_settings" },
    });
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          location.reload();
        },
      },
    });
  }

  return {
    user,
    isAuthed,

    name,
    setName,
    autoSaveStatus: nameSave.status,
    isDirty: nameSave.isDirty,
    onRetrySave: nameSave.retry,

    imageBusy,
    onSetImageUrl: (url: string) => void writeImage(url.trim()),
    onRemoveImage: () => void writeImage(""),

    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    passwordBusy,
    onChangePassword: changePassword,
    onResetPasswordForm: resetPasswordForm,

    otherSessionsBusy,
    onSignOutOtherSessions: () => void signOutOtherSessions(),
    onSignOut: () => void signOut(),
  };
}
