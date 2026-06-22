import { useState } from "react";
import type { KeyboardEvent } from "react";

import { Check, KeyRound, Link2, Loader2, LogOut, RadioTower, UserRound, X } from "@/lib/icons";

import { AccountAvatar, initialsFromIdentity } from "@/components/account-avatar";
import { PageHeader } from "@/components/amend-agent-chrome";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import {
  SettingsField,
  SettingsInput,
  SettingsRow,
  SettingsSection,
  StatePill,
  settingsSecondaryButtonClass,
} from "@/components/settings-workspace-panel-primitives";
import { SettingsAutoSaveIndicator } from "@/components/settings-workspace-toolbar";
import {
  type AccountWorkspaceController,
  useAccountWorkspaceController,
} from "@/components/use-account-workspace-controller";

/** Filled primary action — matches the dashboard's foreground-on-background buttons. */
const primaryButtonClass =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-xs font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/85 active:opacity-75 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0";

/** Quiet destructive action — same footprint as the secondary button, danger-tinted. */
const destructiveButtonClass =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 text-xs font-medium text-destructive ring-1 ring-destructive/20 ring-inset transition-colors duration-150 ease-linear hover:bg-destructive/15 active:opacity-75 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0";

/** Avatar control: clickable preview + an inline URL editor and remove action. */
function AvatarField({ account }: { account: AccountWorkspaceController }) {
  const { user } = account;
  const initials = initialsFromIdentity(user?.name, user?.email);
  const [urlDraft, setUrlDraft] = useState<string | null>(null);

  function commit() {
    if (urlDraft !== null) account.onSetImageUrl(urlDraft);
    setUrlDraft(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
    if (event.key === "Escape") setUrlDraft(null);
  }

  if (urlDraft !== null) {
    return (
      <div className="flex items-center gap-2">
        <SettingsInput
          autoFocus
          className="sm:w-64"
          placeholder="https://example.com/avatar.png"
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          aria-label="Apply photo"
          className={settingsSecondaryButtonClass}
          onClick={commit}
        >
          <Check />
        </button>
        <button
          type="button"
          aria-label="Cancel"
          className={settingsSecondaryButtonClass}
          onClick={() => setUrlDraft(null)}
        >
          <X />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="relative">
        <AccountAvatar
          className="size-12 rounded-xl text-base"
          image={user?.image}
          initials={initials}
        />
        {account.imageBusy ? (
          <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/55 text-white">
            <Loader2 className="size-4 animate-spin" />
          </span>
        ) : null}
      </span>
      <button
        type="button"
        className={settingsSecondaryButtonClass}
        onClick={() => setUrlDraft(user?.image ?? "")}
      >
        <Link2 />
        {user?.image ? "Change" : "Add photo"}
      </button>
      {user?.image ? (
        <button
          type="button"
          className={settingsSecondaryButtonClass}
          onClick={account.onRemoveImage}
        >
          <X />
          Remove
        </button>
      ) : null}
    </div>
  );
}

/** Collapsed "Change password" affordance that expands into a verified-change form. */
function PasswordField({ account }: { account: AccountWorkspaceController }) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
    account.onResetPasswordForm();
  }

  if (!open) {
    return (
      <SettingsRow label="Password" description="Change the password you use to sign in.">
        <button
          type="button"
          className={settingsSecondaryButtonClass}
          onClick={() => setOpen(true)}
        >
          <KeyRound />
          Change password
        </button>
      </SettingsRow>
    );
  }

  return (
    <SettingsField
      label="Change password"
      description="Confirm your current password, then choose a new one of at least 8 characters."
    >
      <form
        className="max-w-sm space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void account.onChangePassword().then((ok) => {
            if (ok) setOpen(false);
          });
        }}
      >
        <SettingsInput
          autoComplete="current-password"
          placeholder="Current password"
          type="password"
          value={account.currentPassword}
          onChange={(event) => account.setCurrentPassword(event.target.value)}
        />
        <SettingsInput
          autoComplete="new-password"
          placeholder="New password"
          type="password"
          value={account.newPassword}
          onChange={(event) => account.setNewPassword(event.target.value)}
        />
        <SettingsInput
          autoComplete="new-password"
          placeholder="Confirm new password"
          type="password"
          value={account.confirmPassword}
          onChange={(event) => account.setConfirmPassword(event.target.value)}
        />
        {account.passwordError ? (
          <p className="text-xs text-destructive">{account.passwordError}</p>
        ) : null}
        <div className="flex items-center gap-2 pt-0.5">
          <button type="submit" className={primaryButtonClass} disabled={account.passwordBusy}>
            {account.passwordBusy ? <Loader2 className="animate-spin" /> : null}
            Update password
          </button>
          <button type="button" className={settingsSecondaryButtonClass} onClick={close}>
            Cancel
          </button>
        </div>
        <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
          For your security, changing your password signs you out of other devices.
        </p>
      </form>
    </SettingsField>
  );
}

/**
 * Personal account settings — a dedicated surface separate from project
 * settings, reusing the airy settings design system. Reached from the account
 * menu in the sidebar.
 */
export function AccountWorkspace() {
  const account = useAccountWorkspaceController();
  const { user } = account;
  const email = user?.email ?? "—";
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Your account";
  const initials = initialsFromIdentity(user?.name, user?.email);

  return (
    <>
      <PageHeader className="relative z-20 bg-background" icon={UserRound} title="Account" />

      <DashboardWorkspaceSurface>
        <div className="amend-page-enter mx-auto w-full max-w-2xl px-6 py-8 md:px-8 md:py-10">
          {/* Identity — grounds the page in the person, not the project. The
              autosave cue rides here, mirroring the project settings surface. */}
          <div className="mb-9 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5">
              <AccountAvatar
                className="size-12 rounded-xl text-base"
                image={user?.image}
                initials={initials}
              />
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold leading-tight text-foreground">
                  {displayName}
                </h1>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {email} · Personal account
                </p>
              </div>
            </div>
            <SettingsAutoSaveIndicator
              canSave={account.isAuthed}
              isDirty={account.isDirty}
              onRetry={account.onRetrySave}
              status={account.autoSaveStatus}
            />
          </div>

          <div className="space-y-12">
            <SettingsSection title="Profile" description="How you appear across Amend.">
              <SettingsRow label="Photo" description="A square image works best.">
                <AvatarField account={account} />
              </SettingsRow>

              <SettingsRow label="Display name">
                <SettingsInput
                  className="sm:w-72"
                  placeholder="Your name"
                  value={account.name}
                  onChange={(event) => account.setName(event.target.value)}
                />
              </SettingsRow>

              <SettingsRow
                label="Email"
                description="Used to sign in and for important account notices."
                control={
                  <span className="flex items-center gap-2.5">
                    <span className="truncate text-sm text-foreground/80">{email}</span>
                    <StatePill tone="neutral">Read-only</StatePill>
                  </span>
                }
              />
            </SettingsSection>

            <SettingsSection title="Security" description="Keep your account protected.">
              <PasswordField account={account} />

              <SettingsRow
                label="Other sessions"
                description="Sign out everywhere except this device."
                control={
                  <button
                    type="button"
                    className={settingsSecondaryButtonClass}
                    disabled={account.otherSessionsBusy}
                    onClick={account.onSignOutOtherSessions}
                  >
                    {account.otherSessionsBusy ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <RadioTower />
                    )}
                    Sign out other devices
                  </button>
                }
              />
            </SettingsSection>

            <SettingsSection title="Session">
              <SettingsRow
                label="Sign out"
                description="End your session on this device."
                control={
                  <button
                    type="button"
                    className={destructiveButtonClass}
                    onClick={account.onSignOut}
                  >
                    <LogOut />
                    Sign out
                  </button>
                }
              />
            </SettingsSection>
          </div>
        </div>
      </DashboardWorkspaceSurface>
    </>
  );
}
