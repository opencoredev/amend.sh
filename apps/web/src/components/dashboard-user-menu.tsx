import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@amend/ui/components/dropdown-menu";
import { cn } from "@amend/ui/lib/utils";
import { ChevronsUpDown, LogOut, Settings, UserRound } from "@/lib/icons";

import { authClient } from "@/lib/auth-client";
import { identifyAndCapturePostHogEvent } from "@/lib/posthog";

function initialsFrom(name: string | undefined, email: string | undefined) {
  const source = (name ?? email ?? "").trim();
  if (!source) return "";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function AccountAvatar({
  className,
  image,
  initials,
}: {
  className?: string;
  image?: string | null;
  initials: string;
}) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-background/75 text-xs font-semibold text-foreground ring-1 ring-white/[0.06]",
        className,
      )}
    >
      {image ? (
        <img alt="" className="size-full object-cover" src={image} />
      ) : initials ? (
        initials
      ) : (
        <UserRound className="size-4 text-muted-foreground" />
      )}
    </span>
  );
}

export default function DashboardUserMenu({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const session = authClient.useSession();
  const user = session.data?.user;
  const name = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const email = user?.email ?? "Signed in";
  const image = user?.image;
  const initials = initialsFrom(user?.name, user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl bg-[#151518] px-2 py-2 text-left ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] active:opacity-75 data-[popup-open]:bg-[#1a1a1d]"
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
        sideOffset={8}
        className="w-(--anchor-width) min-w-60 rounded-xl bg-popover p-1.5 shadow-[0_18px_60px_rgb(0_0_0/0.55)] ring-1 ring-white/[0.06]"
      >
        <div className="flex items-center gap-2.5 px-2 py-2">
          <AccountAvatar image={image} initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{name}</p>
            <p className="mt-0.5 truncate text-[0.72rem] leading-tight text-muted-foreground">
              {email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-white/[0.06]" />

        {onOpenSettings ? (
          <DropdownMenuItem
            className="gap-2.5 rounded-lg px-2 py-2 text-sm focus:bg-accent"
            onClick={onOpenSettings}
          >
            <Settings className="size-4 text-muted-foreground" />
            Project settings
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem
          variant="destructive"
          className="gap-2.5 rounded-lg px-2 py-2 text-sm"
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
