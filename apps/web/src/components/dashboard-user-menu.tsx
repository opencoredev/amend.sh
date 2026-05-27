import { Button } from "@amend/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@amend/ui/components/dropdown-menu";
import { LogOut, UserRound } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { identifyAndCapturePostHogEvent } from "@/lib/posthog";

export default function DashboardUserMenu() {
  const session = authClient.useSession();
  const user = session.data?.user;
  const label = user?.name ?? user?.email ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <UserRound />
        <span className="max-w-24 truncate">{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{user?.email ?? "Signed in"}</DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
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
            <LogOut />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
