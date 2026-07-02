import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@amend/ui/components/dropdown-menu";
import { ChevronsUpDown, LogOut, Settings, UserRound } from "@/lib/icons";

import { AccountAvatar, initialsFromIdentity } from "@/components/account-avatar";
import { authClient } from "@/lib/auth-client";
import { identifyAndCapturePostHogEvent } from "@/lib/posthog";

export default function DashboardUserMenu({
  onOpenAccount,
  onOpenSettings,
}: {
  onOpenAccount?: () => void;
  onOpenSettings?: () => void;
}) {
  const session = authClient.useSession();
  const user = session.data?.user;
  const name = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const email = user?.email ?? "Signed in";
  const image = user?.image;
  const initials = initialsFromIdentity(user?.name, user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl bg-amend-inset px-2 py-2 text-left outline-none ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] focus-visible:ring-2 focus-visible:ring-white/25 active:opacity-75 data-[popup-open]:bg-[#1a1a1d] data-[popup-open]:ring-white/15"
          />
        }
      >
        <AccountAvatar image={image} initials={initials} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight">{name}</span>
          <span className="mt-0.5 block truncate text-[0.72rem] leading-tight text-muted-foreground">
            {email}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        side="top"
        sideOffset={12}
        className="w-(--anchor-width) min-w-[15rem] rounded-2xl bg-popover p-2 shadow-[0_24px_70px_-10px_rgb(0_0_0/0.7)] ring-1 ring-white/[0.08]"
      >
        {/* Identity — sits at the top of the upward menu, clear of the trigger. */}
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.025] px-2.5 py-2.5">
          <AccountAvatar className="size-9 rounded-xl" image={image} initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{name}</p>
            <p className="mt-0.5 truncate text-[0.72rem] leading-tight text-muted-foreground">
              {email}
            </p>
          </div>
        </div>

        <div className="mt-1.5 grid gap-0.5">
          {onOpenAccount ? (
            <DropdownMenuItem
              className="gap-2.5 rounded-lg px-2.5 py-2 text-sm focus:bg-accent"
              onClick={onOpenAccount}
            >
              <UserRound className="size-4 text-muted-foreground" />
              Account settings
            </DropdownMenuItem>
          ) : null}

          {onOpenSettings ? (
            <DropdownMenuItem
              className="gap-2.5 rounded-lg px-2.5 py-2 text-sm focus:bg-accent"
              onClick={onOpenSettings}
            >
              <Settings className="size-4 text-muted-foreground" />
              Project settings
            </DropdownMenuItem>
          ) : null}
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-white/[0.06]" />

        <DropdownMenuItem
          variant="destructive"
          className="gap-2.5 rounded-lg px-2.5 py-2 text-sm"
          onClick={() => {
            void (async () => {
              await identifyAndCapturePostHogEvent({
                event: "user_signed_out",
                identity: { email: user?.email, name: user?.name, userId: user?.id },
                properties: { surface: "dashboard_user_menu" },
              });
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    location.reload();
                  },
                },
              });
            })();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
